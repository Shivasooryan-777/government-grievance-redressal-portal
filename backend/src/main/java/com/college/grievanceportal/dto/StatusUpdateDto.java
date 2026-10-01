package com.college.grievanceportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StatusUpdateDto {
    
    @NotBlank(message = "Status is required")
    private String status;

    @Size(max = 2000, message = "Remarks must be 2000 characters or fewer")
    private String remarks;

    @Size(max = 255, message = "Action taken must be 255 characters or fewer")
    private String actionTaken;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
}