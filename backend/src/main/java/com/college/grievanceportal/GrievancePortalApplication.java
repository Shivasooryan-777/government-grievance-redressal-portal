package com.college.grievanceportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Government Grievance Redressal Portal backend.
 */
@SpringBootApplication
public class GrievancePortalApplication {

    /**
     * Starts the Spring Boot application.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(GrievancePortalApplication.class, args);
    }
}