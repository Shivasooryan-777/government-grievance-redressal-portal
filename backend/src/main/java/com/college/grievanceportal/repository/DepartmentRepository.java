package com.college.grievanceportal.repository;

import com.college.grievanceportal.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Department entity operations.
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}