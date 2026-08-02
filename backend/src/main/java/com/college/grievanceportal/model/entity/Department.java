package com.college.grievanceportal.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents an administrative department (e.g., Water Supply, Electricity) 
 * that handles specific types of grievances and employs GROs.
 */
@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "department")
    private List<User> groList = new ArrayList<>();

    @OneToMany(mappedBy = "department")
    private List<Grievance> grievances = new ArrayList<>();
}