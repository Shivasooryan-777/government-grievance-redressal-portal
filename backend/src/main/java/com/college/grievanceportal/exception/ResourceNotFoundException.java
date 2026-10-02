package com.college.grievanceportal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested domain entity (e.g., Grievance, Feedback)
 * is not found in the database. Maps to HTTP 404 Not Found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new ResourceNotFoundException with the specified error message.
     *
     * @param message descriptive message detailing which resource could not be found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
