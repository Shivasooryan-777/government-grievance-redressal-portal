package com.college.grievanceportal.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Grievance getGrievance() { return grievance; }
    public void setGrievance(Grievance grievance) { this.grievance = grievance; }
    public User getGro() { return gro; }
    public void setGro(User gro) { this.gro = gro; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }

    @PrePersist
    protected void onCreate() {
        loggedAt = LocalDateTime.now();
    }
}