package com.college.grievanceportal.repository;

import com.college.grievanceportal.model.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Grievance entity operations.
 */
@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCitizenId(Long citizenId);
    List<Grievance> findByDepartmentId(Long departmentId);
}