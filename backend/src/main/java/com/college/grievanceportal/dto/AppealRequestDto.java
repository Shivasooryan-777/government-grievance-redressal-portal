package com.college.grievanceportal.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO representing a resolution appeal submitted by a citizen on a resolved grievance.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppealRequestDto {

    @NotBlank(message = "Appeal reason is required")
    @Size(max = 1000, message = "Appeal reason must be 1000 characters or fewer")
    @JsonAlias({"appealReason", "remarks"})
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
