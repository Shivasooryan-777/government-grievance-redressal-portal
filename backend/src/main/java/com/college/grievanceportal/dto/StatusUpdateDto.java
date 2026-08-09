package com.college.grievanceportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateDto {
    
    @NotBlank(message = "Status is required")
    private String status;
}