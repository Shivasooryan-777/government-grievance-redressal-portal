package com.college.grievanceportal.controller;

import com.college.grievanceportal.dto.ApiResponse;
import com.college.grievanceportal.dto.AppealRequestDto;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.repository.UserRepository;
import com.college.grievanceportal.service.GrievanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for citizen feedback actions and resolution appeals.
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final GrievanceService grievanceService;
    private final UserRepository userRepository;

    /**
     * Submits a resolution appeal for a previously resolved grievance based on its feedback record.
     * Reopens the grievance to IN_PROGRESS, escalates its priority to HIGH, and marks the feedback
     * as appealed with the citizen's justification.
     * Restricted to authenticated citizens who submitted the original grievance.
     *
     * @param feedbackId     the ID of the feedback associated with the resolved grievance
     * @param requestDto     the appeal payload containing the appeal reason
     * @param authentication the current Spring Security authentication context
     * @return updated grievance details wrapped in the standard ApiResponse envelope
     */
    @PatchMapping("/{feedbackId}/appeal")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ApiResponse<GrievanceResponseDto>> raiseAppeal(
            @PathVariable Long feedbackId,
            @Valid @RequestBody AppealRequestDto requestDto,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        GrievanceResponseDto updatedGrievance = grievanceService.raiseAppeal(
                feedbackId, requestDto.getReason(), currentUser.getId());

        return ResponseEntity.ok(ApiResponse.success("Resolution appeal submitted successfully", updatedGrievance));
    }

    /**
     * Resolves the authenticated user regardless of whether the principal
     * is stored as a User entity, an email address, or an id string in the security context.
     *
     * @param authentication current security authentication
     * @return resolved User entity from database or security context
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
