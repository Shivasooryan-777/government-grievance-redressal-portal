package com.college.grievanceportal.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Represents an action or update logged by a GRO regarding a specific Grievance.
 * Maintains an audit trail of the steps taken to resolve the issue.
 */
@Entity
@Table(name = "resolution_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResolutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "grievance_id", nullable = false)
    private Grievance grievance;

    @ManyToOne
    @JoinColumn(name = "gro_id", nullable = false)
    private User gro;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String remarks;

    @Column(name = "action_taken", nullable = false)
    private String actionTaken;

    @Column(name = "logged_at", nullable = false, updatable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    protected void onCreate() {
        loggedAt = LocalDateTime.now();
    }
}