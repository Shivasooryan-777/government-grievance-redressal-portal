package com.college.grievanceportal.repository;

import com.college.grievanceportal.model.entity.ResolutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ResolutionLog entity operations.
 */
@Repository
public interface ResolutionLogRepository extends JpaRepository<ResolutionLog, Long> {
    List<ResolutionLog> findByGrievanceId(Long grievanceId);
}