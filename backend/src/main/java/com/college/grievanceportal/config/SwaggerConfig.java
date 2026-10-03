package com.college.grievanceportal.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI and Swagger UI configuration.
 * Configures API metadata, contact details, and JWT Bearer security scheme
 * for interactive testing in Swagger UI.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Government Grievance Redressal Portal API",
                version = "1.0",
                description = "RESTful API documentation for Citizen Grievance Submission, Tracking, Redressal, and Officer Management.",
                contact = @Contact(name = "Grievance Portal Team", email = "support@grievanceportal.gov")
        ),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Enter JWT Bearer token obtained from /api/auth/login"
)
public class SwaggerConfig {
}
