package com.college.grievanceportal.controller;

import com.college.grievanceportal.dto.ApiResponse;
import com.college.grievanceportal.dto.FeedbackRequestDto;
import com.college.grievanceportal.dto.GrievanceRequestDto;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.dto.GrievanceTrackingResponseDto;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.repository.UserRepository;
import com.college.grievanceportal.service.GrievanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for citizen grievance lifecycle operations.
 */
@RestController
@RequestMapping("/api/grievances")
@RequiredArgsConstructor
@Tag(name = "Grievances", description = "Endpoints for grievance submission, citizen grievance list, status tracking, and feedback")
public class GrievanceController {

    private final GrievanceService grievanceService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(
            summary = "Submit a new grievance",
            description = "Creates a new citizen grievance under a specific department, auto-generates a unique tracking ID, and sets status to SUBMITTED. Restricted to CITIZEN role."
    )
    public ResponseEntity<ApiResponse<GrievanceResponseDto>> submitGrievance(
            @Valid @RequestBody GrievanceRequestDto requestDto,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        GrievanceResponseDto response = grievanceService.createGrievance(requestDto, currentUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<GrievanceResponseDto>builder()
                        .success(true)
                        .message("Grievance submitted successfully")
                        .data(response)
                        .build());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(
            summary = "Get grievances filed by authenticated citizen",
            description = "Retrieves all grievances filed by the currently authenticated citizen with resolution logs and feedback. Restricted to CITIZEN role."
    )
    public ResponseEntity<ApiResponse<List<GrievanceResponseDto>>> getMyGrievances(Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        List<GrievanceResponseDto> grievances = grievanceService.getGrievancesForCitizen(currentUser.getId());

        return ResponseEntity.ok(ApiResponse.<List<GrievanceResponseDto>>builder()
                .success(true)
                .message("Grievances fetched successfully")
                .data(grievances)
                .build());
    }

    /**
     * Unauthenticated public tracking endpoint. Allows anyone with a valid tracking ID
     * to check the live status, assigned department, and priority of a grievance without
     * exposing sensitive citizen data or complaint details.
     *
     * @param trackingId the unique grievance tracking ID
     * @return public tracking response with non-sensitive status fields
     */
    @GetMapping("/track/{trackingId}")
    @Operation(
            summary = "Track grievance status publicly",
            description = "Allows anyone with a valid tracking ID to view non-sensitive status, priority, and assigned department without authentication.",
            security = {}
    )
    public ResponseEntity<ApiResponse<GrievanceTrackingResponseDto>> trackGrievance(
            @PathVariable String trackingId) {
        GrievanceTrackingResponseDto response = grievanceService.trackGrievance(trackingId);
        return ResponseEntity.ok(ApiResponse.success("Grievance status retrieved successfully", response));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(
            summary = "Submit feedback for a resolved grievance",
            description = "Submits a citizen rating (1-5) and remarks for a grievance in RESOLVED state. Restricted to the grievance owner."
    )
    public ResponseEntity<ApiResponse<GrievanceResponseDto>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequestDto requestDto,
            Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        GrievanceResponseDto response = grievanceService.submitFeedback(
                id, requestDto, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", response));
    }

    /**
     * Resolves the logged-in user no matter how JwtAuthFilter
     * stores the principal (User entity, email string, or id string).
     */
    private User getAuthenticatedUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        // Case 1: the filter stored the full User entity as principal
        if (principal instanceof User user) {
            return user;
        }

        // Case 2: the principal is the email address
        String name = authentication.getName();
        var byEmail = userRepository.findByEmail(name);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }

        // Case 3: the principal is the user id as a string
        try {
            return userRepository.findById(Long.valueOf(name))
                    .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Authenticated user not found");
        }
    }
}