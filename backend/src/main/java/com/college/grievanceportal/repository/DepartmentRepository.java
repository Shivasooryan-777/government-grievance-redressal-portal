package com.college.grievanceportal.repository;

import com.college.grievanceportal.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // Used to fetch (or verify) the "Unassigned" placeholder department
    Optional<Department> findByName(String name);
}