package com.college.grievanceportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GrievanceRequestDto {
    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject must be less than 255 characters")
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(min = 20, message = "Description must be at least 20 characters long")
    private String description;
}