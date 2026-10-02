package com.college.grievanceportal.exception;

import com.college.grievanceportal.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler providing uniform error responses across all REST endpoints.
 * Wraps all error payloads inside the standard { success, data, message } envelope.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles DTO validation failures triggered by @Valid annotations.
     * Extracts clear field-level error messages into a map within the standard envelope.
     *
     * @param ex the validation exception
     * @return 400 Bad Request with field-level errors in the data payload
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            if (error instanceof FieldError fieldError) {
                errors.put(fieldError.getField(), fieldError.getDefaultMessage());
            } else {
                errors.put(error.getObjectName(), error.getDefaultMessage());
            }
        });
        
        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .build();
                
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles invalid authentication credentials during login.
     *
     * @param ex the bad credentials exception
     * @return 401 Unauthorized
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return new ResponseEntity<>(ApiResponse.error("Invalid email or password"), HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles requests missing valid authentication credentials.
     *
     * @param ex the authentication exception
     * @return 401 Unauthorized
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        return new ResponseEntity<>(ApiResponse.error("Authentication is required"), HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles role or departmental authorization failures.
     *
     * @param ex the access denied exception
     * @return 403 Forbidden with the specific authorization error message
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        String message = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "You are not authorized to perform this action";
        return new ResponseEntity<>(ApiResponse.error(message), HttpStatus.FORBIDDEN);
    }

    /**
     * Handles malformed JSON payloads or invalid JSON values.
     *
     * @param ex the HTTP message not readable exception
     * @return 400 Bad Request
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("Malformed JSON request received: {}", ex.getMessage());
        return new ResponseEntity<>(ApiResponse.error("Malformed JSON request or invalid data format"), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles parameter or path variable type mismatches.
     *
     * @param ex the type mismatch exception
     * @return 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return new ResponseEntity<>(ApiResponse.error("Invalid parameter: " + ex.getName()), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles standard business logic validation failures.
     *
     * @param ex the illegal argument exception
     * @return 400 Bad Request
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    /**
     * Catch-all handler for unexpected internal exceptions.
     * Logs the stack trace via SLF4J and returns a sanitized error envelope.
     *
     * @param ex the unhandled exception
     * @return 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(Exception ex) {
        log.error("Unhandled server exception caught in GlobalExceptionHandler: ", ex);
        return new ResponseEntity<>(ApiResponse.error("An internal server error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}