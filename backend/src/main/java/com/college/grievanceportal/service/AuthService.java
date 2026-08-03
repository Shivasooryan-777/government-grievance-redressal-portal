package com.college.grievanceportal.service;

import com.college.grievanceportal.config.JwtProvider;
import com.college.grievanceportal.dto.AuthResponseDto;
import com.college.grievanceportal.dto.LoginRequestDto;
import com.college.grievanceportal.dto.RegisterRequestDto;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Role;
import com.college.grievanceportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role userRole = Role.CITIZEN;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role provided");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(userRole)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtProvider.generateToken(savedUser);

        return buildAuthResponse(savedUser, token);
    }

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtProvider.generateToken(user);
        return buildAuthResponse(user, token);
    }

    private AuthResponseDto buildAuthResponse(User user, String token) {
        return AuthResponseDto.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}