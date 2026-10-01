package com.college.grievanceportal.dto;

import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GrievanceResponseDto {
    public GrievanceResponseDto() {}
    public GrievanceResponseDto(Long id, String trackingId, String subject, String description,
            Status status, Priority priority, LocalDateTime createdAt,
            List<ResolutionLogResponseDto> resolutionLogs, FeedbackResponseDto feedback) {
        this.id = id;
        this.trackingId = trackingId;
        this.subject = subject;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.createdAt = createdAt;
        this.resolutionLogs = resolutionLogs;
        this.feedback = feedback;
    }

    private Long id;
    private String trackingId;
    private String subject;
    private String description;
    private Status status;
    private Priority priority;
    private LocalDateTime createdAt;
    private List<ResolutionLogResponseDto> resolutionLogs;
    private FeedbackResponseDto feedback;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<ResolutionLogResponseDto> getResolutionLogs() { return resolutionLogs; }
    public void setResolutionLogs(List<ResolutionLogResponseDto> resolutionLogs) { this.resolutionLogs = resolutionLogs; }
    public FeedbackResponseDto getFeedback() { return feedback; }
    public void setFeedback(FeedbackResponseDto feedback) { this.feedback = feedback; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final GrievanceResponseDto value = new GrievanceResponseDto();
        public Builder id(Long id) { value.id = id; return this; }
        public Builder trackingId(String trackingId) { value.trackingId = trackingId; return this; }
        public Builder subject(String subject) { value.subject = subject; return this; }
        public Builder description(String description) { value.description = description; return this; }
        public Builder status(Status status) { value.status = status; return this; }
        public Builder priority(Priority priority) { value.priority = priority; return this; }
        public Builder createdAt(LocalDateTime createdAt) { value.createdAt = createdAt; return this; }
        public Builder resolutionLogs(List<ResolutionLogResponseDto> logs) { value.resolutionLogs = logs; return this; }
        public Builder feedback(FeedbackResponseDto feedback) { value.feedback = feedback; return this; }
        public GrievanceResponseDto build() { return value; }
    }
}