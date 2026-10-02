package com.college.grievanceportal.service;

import com.college.grievanceportal.model.entity.Grievance;
import com.college.grievanceportal.model.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for sending email notifications to citizens regarding grievance progress.
 * All notification methods are executed asynchronously and isolated within error-handling blocks
 * so that transient SMTP network issues, invalid credentials, or provider outages
 * never block or roll back the core business transactions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@grievanceportal.gov}")
    private String fromAddress;

    /**
     * Asynchronously sends a status-change notification email to the citizen.
     * Composes a concise plain-text message detailing the tracking ID, department,
     * previous status, and updated status.
     *
     * @param citizen   the citizen who filed the grievance
     * @param grievance the grievance entity whose status was modified
     * @param oldStatus the status prior to modification
     * @param newStatus the updated status
     */
    @Async
    public void sendStatusChangeEmail(User citizen, Grievance grievance, String oldStatus, String newStatus) {
        if (citizen == null || citizen.getEmail() == null || citizen.getEmail().isBlank()) {
            log.warn("Cannot send status change email: recipient citizen or email is missing for grievance {}",
                    grievance != null ? grievance.getTrackingId() : "unknown");
            return;
        }

        if (grievance == null) {
            log.warn("Cannot send status change email: grievance is null for citizen {}", citizen.getEmail());
            return;
        }

        String departmentName = resolveDepartmentName(grievance);
        String citizenName = resolveCitizenName(citizen);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(citizen.getEmail());
        message.setFrom(fromAddress);
        message.setSubject("[Grievance Portal] Status Update: " + grievance.getTrackingId());
        message.setText(
                "Dear " + citizenName + ",\n\n" +
                "The status of your grievance has been updated.\n\n" +
                "Tracking ID: " + grievance.getTrackingId() + "\n" +
                "Subject: " + grievance.getSubject() + "\n" +
                "Department: " + departmentName + "\n" +
                "Previous Status: " + oldStatus + "\n" +
                "New Status: " + newStatus + "\n\n" +
                "You can track the ongoing progress of your grievance at any time on the portal.\n\n" +
                "Regards,\n" +
                "Government Grievance Redressal Portal"
        );

        try {
            mailSender.send(message);
            log.info("Status change notification successfully sent to {} for grievance {}",
                    citizen.getEmail(), grievance.getTrackingId());
        } catch (Exception ex) {
            log.error("Failed to send status change notification to {} for grievance {}: {}",
                    citizen.getEmail(), grievance.getTrackingId(), ex.getMessage(), ex);
        }
    }

    /**
     * Asynchronously sends an appeal confirmation email to the citizen when an appeal is raised.
     * Confirms receipt of the appeal and informs the citizen that the grievance has been reopened
     * with priority escalated to HIGH.
     *
     * @param citizen   the citizen who raised the appeal
     * @param grievance the reopened grievance
     */
    @Async
    public void sendAppealConfirmationEmail(User citizen, Grievance grievance) {
        if (citizen == null || citizen.getEmail() == null || citizen.getEmail().isBlank()) {
            log.warn("Cannot send appeal confirmation email: recipient citizen or email is missing for grievance {}",
                    grievance != null ? grievance.getTrackingId() : "unknown");
            return;
        }

        if (grievance == null) {
            log.warn("Cannot send appeal confirmation email: grievance is null for citizen {}", citizen.getEmail());
            return;
        }

        String departmentName = resolveDepartmentName(grievance);
        String citizenName = resolveCitizenName(citizen);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(citizen.getEmail());
        message.setFrom(fromAddress);
        message.setSubject("[Grievance Portal] Appeal Received: " + grievance.getTrackingId());
        message.setText(
                "Dear " + citizenName + ",\n\n" +
                "Your resolution appeal has been received and registered.\n\n" +
                "Tracking ID: " + grievance.getTrackingId() + "\n" +
                "Subject: " + grievance.getSubject() + "\n" +
                "Department: " + departmentName + "\n" +
                "Status: IN_PROGRESS\n" +
                "Priority: ESCALATED TO HIGH\n\n" +
                "Your grievance has been reopened and prioritized for senior review. " +
                "You can track ongoing progress using your tracking ID on the portal.\n\n" +
                "Regards,\n" +
                "Government Grievance Redressal Portal"
        );

        try {
            mailSender.send(message);
            log.info("Appeal confirmation notification successfully sent to {} for grievance {}",
                    citizen.getEmail(), grievance.getTrackingId());
        } catch (Exception ex) {
            log.error("Failed to send appeal confirmation notification to {} for grievance {}: {}",
                    citizen.getEmail(), grievance.getTrackingId(), ex.getMessage(), ex);
        }
    }

    /**
     * Helper to safely extract department name, guarding against uninitialized lazy associations.
     */
    private String resolveDepartmentName(Grievance grievance) {
        try {
            if (grievance.getDepartment() != null && grievance.getDepartment().getName() != null) {
                return grievance.getDepartment().getName();
            }
        } catch (Exception ex) {
            log.debug("Department could not be lazily initialized for grievance {}: {}",
                    grievance.getTrackingId(), ex.getMessage());
        }
        return "General Administration";
    }

    /**
     * Helper to safely extract citizen name with fallback.
     */
    private String resolveCitizenName(User citizen) {
        try {
            if (citizen.getName() != null && !citizen.getName().isBlank()) {
                return citizen.getName();
            }
        } catch (Exception ex) {
            log.debug("Citizen name could not be resolved: {}", ex.getMessage());
        }
        return "Citizen";
    }
}
