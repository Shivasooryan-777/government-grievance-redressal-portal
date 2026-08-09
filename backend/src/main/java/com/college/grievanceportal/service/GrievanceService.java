package com.college.grievanceportal.service;

import com.college.grievanceportal.dto.GrievanceRequestDto;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.model.entity.Department;
import com.college.grievanceportal.model.entity.Grievance;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;
import com.college.grievanceportal.repository.DepartmentRepository;
import com.college.grievanceportal.repository.GrievanceRepository;
import com.college.grievanceportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GrievanceService {

    private static final String PLACEHOLDER_DEPARTMENT = "Unassigned";

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

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
        return getQueueForDepartment(gro.getDepartment().getId());
    }

    /**
     * Fetches the grievance queue for a specific department,
     * sorted by priority (highest first).
     * Sorted in-memory using the enum's declaration order, which stays
     * deterministic regardless of STRING vs ORDINAL enum storage in PostgreSQL.
     */
    @Transactional(readOnly = true)
    public List<GrievanceResponseDto> getQueueForDepartment(Long departmentId) {
        return grievanceRepository.findByDepartmentId(departmentId).stream()
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
    public GrievanceResponseDto updateStatus(Long grievanceId, String newStatus, String groIdentifier) {
        Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new IllegalArgumentException("Grievance not found with id: " + grievanceId));

        User gro = findGro(groIdentifier);

        // SECURITY: Verify the GRO's department matches the grievance's department
        if (grievance.getDepartment() == null
                || gro.getDepartment() == null
                || !grievance.getDepartment().getId().equals(gro.getDepartment().getId())) {
            throw new AccessDeniedException("GRO does not belong to the grievance's department");
        }

        // Safely map the incoming string to the Status enum
        Status statusEnum;
        try {
            statusEnum = Status.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + newStatus);
        }

        grievance.setStatus(statusEnum);

        return mapToResponse(grievanceRepository.save(grievance));
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
                user = userRepository.findById(Long.parseLong(identifier))
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
     * Returns the "Unassigned" placeholder department,
     * creating it on first use. Satisfies the NOT NULL constraint
     * until real AI classification arrives in Phase 3.
     */
    private Department getPlaceholderDepartment() {
        return departmentRepository.findByName(PLACEHOLDER_DEPARTMENT)
                .orElseGet(() -> {
                    Department placeholder = new Department();
                    placeholder.setName(PLACEHOLDER_DEPARTMENT);
                    placeholder.setCode("UNASSIGNED"); // Required by NOT NULL constraint
                    return departmentRepository.save(placeholder);
                });
    }

    private String generateTrackingId() {
        return "GRV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private GrievanceResponseDto mapToResponse(Grievance g) {
        return GrievanceResponseDto.builder()
                .id(g.getId())
                .trackingId(g.getTrackingId())
                .subject(g.getSubject())
                .description(g.getDescription())
                .status(g.getStatus())
                .priority(g.getPriority())
                .createdAt(g.getCreatedAt())
                .build();
    }
}