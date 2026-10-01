package com.college.grievanceportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public static <T> Builder<T> builder() { return new Builder<>(); }
    public static class Builder<T> {
        private final ApiResponse<T> value = new ApiResponse<>();
        public Builder<T> success(boolean success) { value.success = success; return this; }
        public Builder<T> message(String message) { value.message = message; return this; }
        public Builder<T> data(T data) { value.data = data; return this; }
        public ApiResponse<T> build() { return value; }
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}