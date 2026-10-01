package com.college.grievanceportal.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResolutionLogResponseDto {
    public ResolutionLogResponseDto() {}
    public ResolutionLogResponseDto(Long id, String remarks, String actionTaken, String groEmail, LocalDateTime loggedAt) {
        this.id = id;
        this.remarks = remarks;
        this.actionTaken = actionTaken;
        this.groEmail = groEmail;
        this.loggedAt = loggedAt;
    }

    private Long id;
    private String remarks;
    private String actionTaken;
    private String groEmail;
    private LocalDateTime loggedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
    public String getGroEmail() { return groEmail; }
    public void setGroEmail(String groEmail) { this.groEmail = groEmail; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final ResolutionLogResponseDto value = new ResolutionLogResponseDto();
        public Builder id(Long id) { value.id = id; return this; }
        public Builder remarks(String remarks) { value.remarks = remarks; return this; }
        public Builder actionTaken(String actionTaken) { value.actionTaken = actionTaken; return this; }
        public Builder groEmail(String groEmail) { value.groEmail = groEmail; return this; }
        public Builder loggedAt(LocalDateTime loggedAt) { value.loggedAt = loggedAt; return this; }
        public ResolutionLogResponseDto build() { return value; }
    }
}
