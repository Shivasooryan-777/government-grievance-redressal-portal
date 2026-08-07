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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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