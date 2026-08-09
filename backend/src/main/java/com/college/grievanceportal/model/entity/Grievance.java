package com.college.grievanceportal.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Status;

@Entity
@Table(name = "grievances")
@Data // <-- Make sure you have this annotation!
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingId;

    // 👇 ADD THIS LINE 👇
    @Column(nullable = false)
    private String subject; 

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department; // Might be null/optional

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}