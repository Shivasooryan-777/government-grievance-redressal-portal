package com.college.grievanceportal.repository;

import com.college.grievanceportal.model.entity.Grievance;
import com.college.grievanceportal.model.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Grievance entity operations.
 */
@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCitizenId(Long citizenId);
    List<Grievance> findByDepartmentId(Long departmentId);
    List<Grievance> findByDepartmentIdAndStatusIn(Long departmentId, List<Status> statuses);
    List<Grievance> findByDepartmentIdInAndStatusIn(List<Long> departmentIds, List<Status> statuses);

    /**
     * Finds a grievance by its unique public tracking ID.
     *
     * @param trackingId unique tracking identifier (e.g. GRV-XXXXXXXX)
     * @return Optional containing the Grievance if found, or empty
     */
    Optional<Grievance> findByTrackingId(String trackingId);
}