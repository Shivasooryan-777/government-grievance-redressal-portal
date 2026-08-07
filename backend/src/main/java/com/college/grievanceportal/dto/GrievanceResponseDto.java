package com.college.grievanceportal.dto;

import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GrievanceResponseDto {
    private Long id;
    private String trackingId;
    private String subject;
    private String description;
    private Status status;
    private Priority priority;
    private LocalDateTime createdAt;
}