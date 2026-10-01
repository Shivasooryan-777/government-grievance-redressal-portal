package com.college.grievanceportal.model.entity;

import com.college.grievanceportal.model.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString; // <--- ADDED THIS IMPORT

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // FIX: Added @ToString.Exclude to prevent LazyInitializationException 
    // when Spring Security logs the authentication name after the request finishes.
    @ToString.Exclude // <--- ADDED THIS ANNOTATION
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User value = new User();
        public Builder id(Long id) { value.id = id; return this; }
        public Builder name(String name) { value.name = name; return this; }
        public Builder email(String email) { value.email = email; return this; }
        public Builder password(String password) { value.password = password; return this; }
        public Builder phoneNumber(String phoneNumber) { value.phoneNumber = phoneNumber; return this; }
        public Builder role(Role role) { value.role = role; return this; }
        public Builder department(Department department) { value.department = department; return this; }
        public Builder createdAt(LocalDateTime createdAt) { value.createdAt = createdAt; return this; }
        public User build() { return value; }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}