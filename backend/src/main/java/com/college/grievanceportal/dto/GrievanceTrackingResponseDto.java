package com.college.grievanceportal.dto;

import java.time.LocalDateTime;

import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Public response DTO for tracking grievance status by tracking ID.
 * Deliberately excludes citizen personal identifiable information (PII)
 * and detailed description to protect citizen privacy on unauthenticated lookups.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceTrackingResponseDto {

    private String trackingId;
    private Status status;
    private Priority priority;
    private String departmentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final GrievanceTrackingResponseDto value = new GrievanceTrackingResponseDto();

        public Builder trackingId(String trackingId) { value.trackingId = trackingId; return this; }
        public Builder status(Status status) { value.status = status; return this; }
        public Builder priority(Priority priority) { value.priority = priority; return this; }
        public Builder departmentName(String departmentName) { value.departmentName = departmentName; return this; }
        public Builder createdAt(LocalDateTime createdAt) { value.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { value.updatedAt = updatedAt; return this; }
        public GrievanceTrackingResponseDto build() { return value; }
    }
}
