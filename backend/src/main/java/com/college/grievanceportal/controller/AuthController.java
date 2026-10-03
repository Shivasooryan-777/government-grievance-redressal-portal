package com.college.grievanceportal.controller;

import com.college.grievanceportal.dto.ApiResponse;
import com.college.grievanceportal.dto.AuthResponseDto;
import com.college.grievanceportal.dto.LoginRequestDto;
import com.college.grievanceportal.dto.RegisterRequestDto;
import com.college.grievanceportal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for citizen registration and user authentication.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for citizen registration and user authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
            summary = "Register a new citizen account",
            description = "Creates a new citizen user account with BCrypt-hashed password and returns an initial JWT authentication token.",
            security = {}
    )
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthResponseDto response = authService.register(request);
        return new ResponseEntity<>(
                ApiResponse.success("User registered successfully", response), 
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    @Operation(
            summary = "Authenticate user and issue JWT",
            description = "Authenticates user credentials (CITIZEN or GRO) and returns a signed JWT Bearer token.",
            security = {}
    )
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }
}