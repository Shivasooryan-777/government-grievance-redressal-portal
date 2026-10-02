package com.college.grievanceportal.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

/**
 * Response DTO for feedback provided on a resolved grievance,
 * including appeal status and appeal reason.
 */
@Data
@Builder
public class FeedbackResponseDto {
    public FeedbackResponseDto() {}

    public FeedbackResponseDto(Long id, Integer rating, String comment, Boolean appealed, LocalDateTime submittedAt) {
        this(id, rating, comment, appealed, null, submittedAt);
    }

    public FeedbackResponseDto(Long id, Integer rating, String comment, Boolean appealed, String appealReason, LocalDateTime submittedAt) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.appealed = appealed;
        this.appealReason = appealReason;
        this.submittedAt = submittedAt;
    }

    private Long id;
    private Integer rating;
    private String comment;
    private Boolean appealed;
    private String appealReason;
    private LocalDateTime submittedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Boolean getAppealed() { return appealed; }
    public void setAppealed(Boolean appealed) { this.appealed = appealed; }
    public String getAppealReason() { return appealReason; }
    public void setAppealReason(String appealReason) { this.appealReason = appealReason; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final FeedbackResponseDto value = new FeedbackResponseDto();
        public Builder id(Long id) { value.id = id; return this; }
        public Builder rating(Integer rating) { value.rating = rating; return this; }
        public Builder comment(String comment) { value.comment = comment; return this; }
        public Builder appealed(Boolean appealed) { value.appealed = appealed; return this; }
        public Builder appealReason(String appealReason) { value.appealReason = appealReason; return this; }
        public Builder submittedAt(LocalDateTime submittedAt) { value.submittedAt = submittedAt; return this; }
        public FeedbackResponseDto build() { return value; }
    }
}
