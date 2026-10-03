package com.college.grievanceportal.controller;

import com.college.grievanceportal.dto.ApiResponse;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.dto.StatusUpdateDto;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.service.GrievanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for Grievance Redressal Officers (GRO) to manage departmental workflows.
 */
@RestController
@RequestMapping("/api/gro")
@RequiredArgsConstructor
@Tag(name = "GRO Management", description = "Endpoints for Grievance Redressal Officers to manage and resolve grievances")
public class GroController {

    private final GrievanceService grievanceService;

    @GetMapping("/queue")
    @PreAuthorize("hasRole('GRO')")
    @Operation(
            summary = "Get departmental grievance queue",
            description = "Retrieves prioritized grievance queue for the authenticated GRO's department. Restricted to GRO role."
    )
    public ResponseEntity<ApiResponse<List<GrievanceResponseDto>>> getQueue(Authentication authentication) {
        List<GrievanceResponseDto> queue = grievanceService.getQueueForGro(extractIdentifier(authentication));
        return ResponseEntity.ok(ApiResponse.success("Queue retrieved successfully", queue));
    }

    @PatchMapping("/grievances/{id}/status")
    @PreAuthorize("hasRole('GRO')")
    @Operation(
            summary = "Update grievance status and record resolution",
            description = "Updates grievance status (e.g. IN_PROGRESS, RESOLVED, REJECTED), appends an audit resolution log, and triggers citizen notification. Restricted to GRO role."
    )
    public ResponseEntity<ApiResponse<GrievanceResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDto dto,
            Authentication authentication) {

        GrievanceResponseDto updated = grievanceService.updateStatus(
            id, dto.getStatus(), dto.getRemarks(), dto.getActionTaken(), extractIdentifier(authentication));
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
    }

    /**
     * The JWT filter stores the full User entity as the principal, so
     * authentication.getName() would return the entity's toString() instead
     * of the email. We therefore read the email straight from the principal.
     */
    private String extractIdentifier(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getEmail();
        }
        return authentication.getName();
    }
}