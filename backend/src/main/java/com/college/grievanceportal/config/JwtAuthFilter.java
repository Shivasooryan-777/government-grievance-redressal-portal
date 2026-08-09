package com.college.grievanceportal.config;

import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        System.out.println(">>> JWT FILTER START for URI: " + request.getRequestURI());
        
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println(">>> FAIL: No Bearer token in header");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        
        // CHECK 1: Basic validation (signature, expiration)
        if (!jwtProvider.validateToken(jwt)) {
            System.out.println(">>> FAIL: validateToken(jwt) returned false (Likely EXPIRED or invalid signature)");
            filterChain.doFilter(request, response);
            return;
        }

        final String userEmail = jwtProvider.extractEmail(jwt);
        System.out.println(">>> Token valid. Extracted email: " + userEmail);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);

            if (user == null) {
                System.out.println(">>> FAIL: User not found in DB for email: " + userEmail);
            } 
            // CHECK 2: User-specific validation (e.g. issued-at vs password-reset)
            else if (!jwtProvider.validateToken(jwt, user)) {
                System.out.println(">>> FAIL: validateToken(jwt, user) returned false");
            } 
            else {
                System.out.println(">>> SUCCESS: Setting Auth for " + userEmail + " with role " + user.getRole());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
        System.out.println(">>> JWT FILTER END");
    }
}