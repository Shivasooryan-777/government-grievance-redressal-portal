package com.college.grievanceportal.service;

import com.college.grievanceportal.model.entity.Department;
import com.college.grievanceportal.model.entity.Feedback;
import com.college.grievanceportal.model.entity.Grievance;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Role;
import com.college.grievanceportal.model.enums.Status;
import com.college.grievanceportal.repository.DepartmentRepository;
import com.college.grievanceportal.repository.FeedbackRepository;
import com.college.grievanceportal.repository.GrievanceRepository;
import com.college.grievanceportal.repository.ResolutionLogRepository;
import com.college.grievanceportal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for GrievanceService covering status update notifications and appeal notifications.
 */
@ExtendWith(MockitoExtension.class)
class GrievanceServiceTest {

    @Mock
    private GrievanceRepository grievanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private ResolutionLogRepository resolutionLogRepository;

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private GrievanceService grievanceService;

    private Department department;
    private User citizen;
    private User gro;
    private Grievance grievance;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Public Works Department");

        citizen = User.builder()
                .id(10L)
                .name("Asha Sharma")
                .email("asha@example.com")
                .role(Role.CITIZEN)
                .build();

        gro = User.builder()
                .id(20L)
                .name("Official Verma")
                .email("gro.pwd@grievanceportal.gov")
                .role(Role.GRO)
                .department(department)
                .build();

        grievance = Grievance.builder()
                .id(100L)
                .trackingId("GRV-ABCD1234")
                .subject("Water pipeline leakage")
                .description("Continuous leak near market area")
                .status(Status.PENDING)
                .priority(Priority.MEDIUM)
                .citizen(citizen)
                .department(department)
                .build();
    }

    @Test
    @DisplayName("updateStatus triggers sendStatusChangeEmail when status changes")
    void testUpdateStatus_TriggersNotificationOnStatusChange() {
        when(grievanceRepository.findById(100L)).thenReturn(Optional.of(grievance));
        when(userRepository.findByEmail("gro.pwd@grievanceportal.gov")).thenReturn(Optional.of(gro));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        grievanceService.updateStatus(100L, "IN_PROGRESS", "Work started", "Assigned team", "gro.pwd@grievanceportal.gov");

        assertEquals(Status.IN_PROGRESS, grievance.getStatus());
        verify(notificationService, times(1)).sendStatusChangeEmail(
                eq(citizen), eq(grievance), eq("PENDING"), eq("IN_PROGRESS")
        );
    }

    @Test
    @DisplayName("updateStatus does not send email if status remains identical")
    void testUpdateStatus_DoesNotNotifyIfStatusUnchanged() {
        grievance.setStatus(Status.IN_PROGRESS);

        when(grievanceRepository.findById(100L)).thenReturn(Optional.of(grievance));
        when(userRepository.findByEmail("gro.pwd@grievanceportal.gov")).thenReturn(Optional.of(gro));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        grievanceService.updateStatus(100L, "IN_PROGRESS", "Additional remarks", "Updated notes", "gro.pwd@grievanceportal.gov");

        verify(notificationService, never()).sendStatusChangeEmail(any(), any(), any(), any());
    }

    @Test
    @DisplayName("raiseAppeal triggers both sendStatusChangeEmail and sendAppealConfirmationEmail")
    void testRaiseAppeal_TriggersBothNotifications() {
        grievance.setStatus(Status.RESOLVED);

        Feedback feedback = new Feedback();
        feedback.setId(50L);
        feedback.setGrievance(grievance);
        feedback.setRating(1);
        feedback.setComment("Issue still not fixed properly");
        feedback.setIsAppealed(false);

        when(feedbackRepository.findById(50L)).thenReturn(Optional.of(feedback));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        grievanceService.raiseAppeal(50L, "Water is still leaking heavily", 10L);

        assertEquals(Status.IN_PROGRESS, grievance.getStatus());
        assertEquals(Priority.HIGH, grievance.getPriority());

        // Verifies status change notification (RESOLVED -> IN_PROGRESS)
        verify(notificationService, times(1)).sendStatusChangeEmail(
                eq(citizen), eq(grievance), eq("RESOLVED"), eq("IN_PROGRESS")
        );

        // Verifies appeal confirmation notification
        verify(notificationService, times(1)).sendAppealConfirmationEmail(
                eq(citizen), eq(grievance)
        );
    }
}
