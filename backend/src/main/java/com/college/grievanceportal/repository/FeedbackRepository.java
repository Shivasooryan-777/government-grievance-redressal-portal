package com.college.grievanceportal.repository;

import com.college.grievanceportal.model.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Feedback entity operations.
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByGrievanceId(Long grievanceId);
}