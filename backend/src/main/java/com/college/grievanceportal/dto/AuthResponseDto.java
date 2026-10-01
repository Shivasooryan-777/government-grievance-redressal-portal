package com.college.grievanceportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private String type;
    private Long userId;
    private String email;
    private String role;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final AuthResponseDto value = new AuthResponseDto();
        public Builder token(String token) { value.token = token; return this; }
        public Builder type(String type) { value.type = type; return this; }
        public Builder userId(Long userId) { value.userId = userId; return this; }
        public Builder email(String email) { value.email = email; return this; }
        public Builder role(String role) { value.role = role; return this; }
        public AuthResponseDto build() { return value; }
    }
}