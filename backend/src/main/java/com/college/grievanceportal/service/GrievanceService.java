package com.college.grievanceportal.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.college.grievanceportal.dto.FeedbackRequestDto;
import com.college.grievanceportal.dto.FeedbackResponseDto;
import com.college.grievanceportal.dto.GrievanceRequestDto;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.dto.GrievanceTrackingResponseDto;
import com.college.grievanceportal.dto.ResolutionLogResponseDto;
import com.college.grievanceportal.exception.ResourceNotFoundException;
import com.college.grievanceportal.model.entity.Department;
import com.college.grievanceportal.model.entity.Feedback;
import com.college.grievanceportal.model.entity.Grievance;
import com.college.grievanceportal.model.entity.ResolutionLog;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;
import com.college.grievanceportal.repository.DepartmentRepository;
import com.college.grievanceportal.repository.FeedbackRepository;
import com.college.grievanceportal.repository.GrievanceRepository;
import com.college.grievanceportal.repository.ResolutionLogRepository;
import com.college.grievanceportal.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service managing core grievance workflows including submission, department queuing,
 * status transitions by GROs, feedback recording, resolution appeals, and email notifications.
 */
@Service
@RequiredArgsConstructor
public class GrievanceService {

    private static final String PLACEHOLDER_DEPARTMENT = "General Administration";

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ResolutionLogRepository resolutionLogRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;

    @Transactional
    public GrievanceResponseDto createGrievance(GrievanceRequestDto dto, Long citizenId) {
        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new IllegalArgumentException("Citizen not found"));

        Grievance grievance = new Grievance();
        grievance.setTrackingId(generateTrackingId());
        grievance.setSubject(dto.getSubject());
        grievance.setDescription(dto.getDescription());
        grievance.setStatus(Status.PENDING);      // Placeholder until AI classification (Phase 3)
        grievance.setPriority(Priority.MEDIUM);  // Placeholder until AI classification (Phase 3)
        grievance.setCitizen(citizen);
        grievance.setDepartment(getPlaceholderDepartment()); // Satisfies NOT NULL constraint
        grievance.setCreatedAt(LocalDateTime.now());

        return mapToResponse(grievanceRepository.save(grievance));
    }

    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> getGrievancesForCitizen(Long citizenId) {
        return grievanceRepository.findByCitizenId(citizenId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Fetches the queue for the authenticated GRO by resolving their department
     * from the JWT identity (email or user id), sorted by priority (highest first).
     */
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> getQueueForGro(String groIdentifier) {
        User gro = findGro(groIdentifier);
        if (gro.getDepartment() == null) {
            throw new IllegalArgumentException("GRO has no department assigned");
        }
        Department unassigned = departmentRepository.findByName(PLACEHOLDER_DEPARTMENT).orElse(null);
        List<Long> departmentIds = (unassigned == null || unassigned.getId().equals(gro.getDepartment().getId()))
            ? List.of(gro.getDepartment().getId())
            : List.of(gro.getDepartment().getId(), unassigned.getId());
        return grievanceRepository.findByDepartmentIdInAndStatusIn(
                departmentIds, List.of(Status.PENDING, Status.IN_PROGRESS)).stream()
            .sorted(Comparator.comparing(Grievance::getPriority).reversed())
            .map(this::mapToResponse)
            .toList();
    }

    /**
     * Fetches the grievance queue for a specific department,
     * sorted by priority (highest first).
     * Sorted in-memory using the enum's declaration order, which stays
     * deterministic regardless of STRING vs ORDINAL enum storage in PostgreSQL.
     */
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> getQueueForDepartment(Long departmentId) {
        return grievanceRepository.findByDepartmentIdAndStatusIn(
                departmentId, List.of(Status.PENDING, Status.IN_PROGRESS)).stream()
                .sorted(Comparator.comparing(Grievance::getPriority).reversed())
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Updates the status of a grievance.
     * Includes a security check to ensure the GRO belongs to the same department
     * as the grievance. The GRO identity comes from the security context, never
     * from the client.
     */
    @Transactional
    public GrievanceResponseDto updateStatus(
            Long grievanceId, String newStatus, String remarks, String actionTaken, String groIdentifier) {
        Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new IllegalArgumentException("Grievance not found with id: " + grievanceId));

        User gro = findGro(groIdentifier);

        // SECURITY: Verify the GRO's department matches the grievance's department
        if (grievance.getDepartment() == null || gro.getDepartment() == null) {
            throw new AccessDeniedException("GRO does not belong to the grievance's department");
        }
        Department unassigned = departmentRepository.findByName(PLACEHOLDER_DEPARTMENT).orElse(null);
        boolean isUnassigned = unassigned != null && grievance.getDepartment().getId().equals(unassigned.getId());
        if (!isUnassigned && !grievance.getDepartment().getId().equals(gro.getDepartment().getId())) {
            throw new AccessDeniedException("GRO does not belong to the grievance's department");
        }
        if (isUnassigned) {
            grievance.setDepartment(gro.getDepartment());
        }

        // Safely map the incoming string to the Status enum
        Status statusEnum;
        try {
            statusEnum = Status.valueOf(newStatus.trim().toUpperCase());
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        Status oldStatus = grievance.getStatus();
        grievance.setStatus(statusEnum);

        ResolutionLog log = new ResolutionLog();
        log.setGrievance(grievance);
        log.setGro(gro);
        log.setRemarks(remarks == null || remarks.isBlank() ? "Status changed to " + statusEnum : remarks.trim());
        log.setActionTaken(actionTaken == null || actionTaken.isBlank() ? statusEnum.name() : actionTaken.trim());
        resolutionLogRepository.save(log);

        Grievance savedGrievance = grievanceRepository.save(grievance);

        // Notify citizen asynchronously if status actually changed
        if (oldStatus != statusEnum) {
            User citizen = savedGrievance.getCitizen();
            if (citizen != null) {
                citizen.getName();
                citizen.getEmail();
            }
            if (savedGrievance.getDepartment() != null) {
                savedGrievance.getDepartment().getName();
            }
            notificationService.sendStatusChangeEmail(
                    citizen,
                    savedGrievance,
                    oldStatus != null ? oldStatus.name() : "UNKNOWN",
                    statusEnum.name()
            );
        }

        return mapToResponse(savedGrievance);
    }

    @Transactional
    public GrievanceResponseDto submitFeedback(Long grievanceId, FeedbackRequestDto dto, Long citizenId) {
        Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new IllegalArgumentException("Grievance not found with id: " + grievanceId));

        if (!grievance.getCitizen().getId().equals(citizenId)) {
            throw new AccessDeniedException("You can only review your own grievances");
        }
        if (grievance.getStatus() != Status.RESOLVED) {
            throw new IllegalArgumentException("Feedback can only be submitted for resolved grievances");
        }
        if (feedbackRepository.findByGrievanceId(grievanceId).isPresent()) {
            throw new IllegalArgumentException("Feedback has already been submitted for this grievance");
        }

        Feedback feedback = new Feedback();
        feedback.setGrievance(grievance);
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        feedback.setIsAppealed(false);
        feedbackRepository.save(feedback);
        return mapToResponse(grievance);
    }

    /**
     * Resolves the authenticated GRO from the JWT identity and verifies
     * the user actually holds the GRO role in the database.
     */
    private User findGro(String identifier) {
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        User user;
        if (byEmail.isPresent()) {
            user = byEmail.get();
        } else {
            try {
                user = userRepository.findById(Long.valueOf(identifier))
                        .orElseThrow(() -> new IllegalArgumentException("GRO user not found"));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("GRO user not found");
            }
        }

        // SECURITY: enforce GRO role against the database, not the token claims
        if (!"GRO".equals(user.getRole().name())) {
            throw new AccessDeniedException("GRO role required");
        }
        return user;
    }

    /**
     * Returns the "General Administration" fallback department,
     * creating it on first use if not yet seeded. Satisfies the NOT NULL constraint
     * until real AI classification arrives in Phase 3.
     */
    private Department getPlaceholderDepartment() {
        return departmentRepository.findByName(PLACEHOLDER_DEPARTMENT)
                .orElseGet(() -> {
                    Department placeholder = new Department();
                    placeholder.setName(PLACEHOLDER_DEPARTMENT);
                    placeholder.setCode("GEN_ADMIN");
                    placeholder.setDescription("General municipal administration and unassigned grievances");
                    return departmentRepository.save(placeholder);
                });
    }

    /**
     * Looks up a grievance by its unique tracking ID and converts it into a non-sensitive
     * tracking DTO suitable for unauthenticated public status checks.
     *
     * @param trackingId the grievance tracking identifier (e.g. GRV-XXXXXXXX)
     * @return non-sensitive tracking DTO with status, department, and timestamp fields
     */
    @Transactional(readOnly = true)
    public GrievanceTrackingResponseDto trackGrievance(String trackingId) {
        if (trackingId == null || trackingId.trim().isBlank()) {
            throw new IllegalArgumentException("Tracking ID cannot be empty");
        }

        Grievance grievance = grievanceRepository.findByTrackingId(trackingId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Grievance not found with tracking ID: " + trackingId.trim()));

        return GrievanceTrackingResponseDto.builder()
                .trackingId(grievance.getTrackingId())
                .status(grievance.getStatus())
                .priority(grievance.getPriority())
                .departmentName(grievance.getDepartment() != null ? grievance.getDepartment().getName() : "Unassigned")
                .createdAt(grievance.getCreatedAt())
                .updatedAt(grievance.getUpdatedAt())
                .build();
    }

    /**
     * Submits a resolution appeal for a resolved grievance using its existing feedback record.
     * Reopens the grievance back to IN_PROGRESS and escalates priority to HIGH so it surfaces
     * at the top of the GRO's priority queue automatically.
     * Enforces the one-appeal rule and validates that only the grievance's citizen owner can appeal.
     *
     * @param feedbackId ID of the Feedback record being appealed
     * @param reason     reason explanation provided by the citizen
     * @param citizenId  ID of the authenticated citizen
     * @return updated GrievanceResponseDto reflecting the reopened status and HIGH priority
     */
    @Transactional
    public GrievanceResponseDto raiseAppeal(Long feedbackId, String reason, Long citizenId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + feedbackId));

        Grievance grievance = feedback.getGrievance();

        // Security check: Only the citizen who submitted the grievance can appeal
        if (!grievance.getCitizen().getId().equals(citizenId)) {
            throw new AccessDeniedException("You can only appeal grievances you submitted");
        }

        // Enforce "no duplicate appeal" rule
        if (Boolean.TRUE.equals(feedback.getIsAppealed())) {
            throw new IllegalArgumentException("This feedback has already been appealed");
        }

        // Only resolved grievances can be appealed
        if (grievance.getStatus() != Status.RESOLVED) {
            throw new IllegalArgumentException("Only resolved grievances can be appealed");
        }

        if (reason == null || reason.trim().isBlank()) {
            throw new IllegalArgumentException("Appeal reason cannot be empty");
        }

        // Mark feedback as appealed with the provided reason
        feedback.setIsAppealed(true);
        feedback.setAppealReason(reason.trim());
        feedbackRepository.save(feedback);

        Status oldStatus = grievance.getStatus();

        // Reopen grievance: Status -> IN_PROGRESS, Priority -> HIGH
        grievance.setStatus(Status.IN_PROGRESS);
        grievance.setPriority(Priority.HIGH);
        Grievance updatedGrievance = grievanceRepository.save(grievance);

        // Pre-initialize lazy proxies in the persistence context
        User citizen = updatedGrievance.getCitizen();
        if (citizen != null) {
            citizen.getName();
            citizen.getEmail();
        }
        if (updatedGrievance.getDepartment() != null) {
            updatedGrievance.getDepartment().getName();
        }

        // Notify citizen of the status reversion to IN_PROGRESS
        notificationService.sendStatusChangeEmail(
                citizen,
                updatedGrievance,
                oldStatus != null ? oldStatus.name() : "RESOLVED",
                Status.IN_PROGRESS.name()
        );

        // Send appeal receipt and priority escalation confirmation
        notificationService.sendAppealConfirmationEmail(citizen, updatedGrievance);

        return mapToResponse(updatedGrievance);
    }

    private String generateTrackingId() {
        return "GRV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private GrievanceResponseDto mapToResponse(Grievance g) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findByGrievanceId(g.getId());
        boolean isAppealed = feedbackOpt.map(f -> Boolean.TRUE.equals(f.getIsAppealed())).orElse(false);

        return GrievanceResponseDto.builder()
                .id(g.getId())
                .trackingId(g.getTrackingId())
                .subject(g.getSubject())
                .description(g.getDescription())
                .status(g.getStatus())
                .priority(g.getPriority())
                .isAppealed(isAppealed)
                .createdAt(g.getCreatedAt())
                .resolutionLogs(resolutionLogRepository.findByGrievanceId(g.getId()).stream()
                    .map(log -> ResolutionLogResponseDto.builder()
                        .id(log.getId())
                        .remarks(log.getRemarks())
                        .actionTaken(log.getActionTaken())
                        .groEmail(log.getGro().getEmail())
                        .loggedAt(log.getLoggedAt())
                        .build())
                    .toList())
                .feedback(feedbackOpt
                    .map(feedback -> FeedbackResponseDto.builder()
                        .id(feedback.getId())
                        .rating(feedback.getRating())
                        .comment(feedback.getComment())
                        .appealed(feedback.getIsAppealed())
                        .appealReason(feedback.getAppealReason())
                        .submittedAt(feedback.getSubmittedAt())
                        .build())
                    .orElse(null))
                .build();
    }
}