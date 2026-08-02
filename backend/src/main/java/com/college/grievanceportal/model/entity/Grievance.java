package com.college.grievanceportal.model.entity;

import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a formal complaint or request raised by a Citizen.
 * Tracks the lifecycle of the issue from submission to resolution, 
 * including priority, status, and assigned department.
 */
@Entity
@Table(name = "grievances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_id", nullable = false, unique = true)
    private String trackingId;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "grievance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResolutionLog> resolutionLogs = new ArrayList<>();

    @OneToOne(mappedBy = "grievance", cascade = CascadeType.ALL, orphanRemoval = true)
    private Feedback feedback;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (trackingId == null || trackingId.isBlank()) {
            // Generates a unique tracking ID like GRV-A1B2C3D4
            trackingId = "GRV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}