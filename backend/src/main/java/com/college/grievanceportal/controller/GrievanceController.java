package com.college.grievanceportal.controller;

import com.college.grievanceportal.dto.ApiResponse;
import com.college.grievanceportal.dto.GrievanceRequestDto;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.repository.UserRepository;
import com.college.grievanceportal.service.GrievanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/grievances")
@RequiredArgsConstructor
public class GrievanceController {

    private final GrievanceService grievanceService;
    private final UserRepository userRepository;

    @PostMapping
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