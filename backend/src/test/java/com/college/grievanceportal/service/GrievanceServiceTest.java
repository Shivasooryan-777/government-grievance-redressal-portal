package com.college.grievanceportal.service;

import com.college.grievanceportal.dto.FeedbackRequestDto;
import com.college.grievanceportal.dto.GrievanceRequestDto;
import com.college.grievanceportal.dto.GrievanceResponseDto;
import com.college.grievanceportal.dto.GrievanceTrackingResponseDto;
import com.college.grievanceportal.exception.ResourceNotFoundException;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for GrievanceService covering:
 * - Session 3 notification triggers (status updates, resolution appeals)
 * - Session 4 core lifecycle (submission with tracking ID, citizen-scoped queries,
 *   department authorization for GROs, sanitized public tracking lookup,
 *   and appeal validation/escalation logic).
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

    // =========================================================================
    // SESSION 3 TESTS (Notification trigger behaviors — preserved intact)
    // =========================================================================

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

    // =========================================================================
    // SESSION 4 TESTS (Extended coverage for GrievanceService)
    // =========================================================================

    @Test
    @DisplayName("createGrievance() generates a tracking ID and defaults to placeholder department and MEDIUM priority")
    void testCreateGrievance_GeneratesTrackingIdAndDefaults() {
        GrievanceRequestDto requestDto = new GrievanceRequestDto();
        requestDto.setSubject("Damaged streetlight");
        requestDto.setDescription("Light pole #42 is leaning dangerously");

        Department placeholderDept = new Department();
        placeholderDept.setId(99L);
        placeholderDept.setName("General Administration");

        when(userRepository.findById(10L)).thenReturn(Optional.of(citizen));
        when(departmentRepository.findByName("General Administration")).thenReturn(Optional.of(placeholderDept));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> {
            Grievance g = invocation.getArgument(0);
            g.setId(101L);
            return g;
        });

        GrievanceResponseDto response = grievanceService.createGrievance(requestDto, 10L);

        assertNotNull(response);
        assertNotNull(response.getTrackingId());
        assertTrue(response.getTrackingId().startsWith("GRV-"), "Tracking ID must start with GRV- prefix");
        assertEquals(Status.PENDING, response.getStatus());
        assertEquals(Priority.MEDIUM, response.getPriority());
        assertEquals("Damaged streetlight", response.getSubject());

        ArgumentCaptor<Grievance> captor = ArgumentCaptor.forClass(Grievance.class);
        verify(grievanceRepository).save(captor.capture());
        Grievance saved = captor.getValue();

        assertNotNull(saved.getTrackingId());
        assertTrue(saved.getTrackingId().startsWith("GRV-"));
        assertEquals(Status.PENDING, saved.getStatus());
        assertEquals(Priority.MEDIUM, saved.getPriority());
        assertEquals("General Administration", saved.getDepartment().getName());
        assertEquals(citizen, saved.getCitizen());
    }

    @Test
    @DisplayName("getGrievancesForCitizen() queries only grievances belonging to the specified citizen ID")
    void testGetGrievancesForCitizen_OnlyQueriesSpecifiedCitizenId() {
        when(grievanceRepository.findByCitizenId(10L)).thenReturn(List.of(grievance));

        List<GrievanceResponseDto> results = grievanceService.getGrievancesForCitizen(10L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("GRV-ABCD1234", results.get(0).getTrackingId());

        verify(grievanceRepository, times(1)).findByCitizenId(10L);
        verify(grievanceRepository, never()).findByCitizenId(eq(99L));
        verify(grievanceRepository, never()).findAll();
    }

    @Test
    @DisplayName("updateStatus() rejects GRO attempting to update a grievance from a different department (403)")
    void testUpdateStatus_DifferentDepartment_ThrowsAccessDeniedException() {
        Department healthDept = new Department();
        healthDept.setId(2L);
        healthDept.setName("Health Department");

        User groHealth = User.builder()
                .id(25L)
                .name("Official Health")
                .email("gro.health@grievanceportal.gov")
                .role(Role.GRO)
                .department(healthDept)
                .build();

        Department placeholderDept = new Department();
        placeholderDept.setId(99L);
        placeholderDept.setName("General Administration");

        when(grievanceRepository.findById(100L)).thenReturn(Optional.of(grievance));
        when(userRepository.findByEmail("gro.health@grievanceportal.gov")).thenReturn(Optional.of(groHealth));
        when(departmentRepository.findByName("General Administration")).thenReturn(Optional.of(placeholderDept));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                grievanceService.updateStatus(100L, "IN_PROGRESS", "Wrong dept", "Action", "gro.health@grievanceportal.gov"));

        assertEquals("GRO does not belong to the grievance's department", ex.getMessage());
        verify(grievanceRepository, never()).save(any(Grievance.class));
        verify(notificationService, never()).sendStatusChangeEmail(any(), any(), any(), any());
    }

    @Test
    @DisplayName("trackGrievance() returns sanitized DTO without PII for valid tracking ID")
    void testTrackGrievance_ValidTrackingId_ReturnsSanitizedDtoWithoutPii() {
        when(grievanceRepository.findByTrackingId("GRV-ABCD1234")).thenReturn(Optional.of(grievance));

        GrievanceTrackingResponseDto dto = grievanceService.trackGrievance("GRV-ABCD1234");

        assertNotNull(dto);
        assertEquals("GRV-ABCD1234", dto.getTrackingId());
        assertEquals(Status.PENDING, dto.getStatus());
        assertEquals(Priority.MEDIUM, dto.getPriority());
        assertEquals("Public Works Department", dto.getDepartmentName());
    }

    @Test
    @DisplayName("trackGrievance() throws ResourceNotFoundException (404) when tracking ID does not exist")
    void testTrackGrievance_NonExistentTrackingId_ThrowsResourceNotFoundException() {
        when(grievanceRepository.findByTrackingId("GRV-NONEXISTENT")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> grievanceService.trackGrievance("GRV-NONEXISTENT"));

        assertTrue(ex.getMessage().contains("Grievance not found with tracking ID: GRV-NONEXISTENT"));
    }

    @Test
    @DisplayName("raiseAppeal() rejects non-owner citizen attempting to appeal someone else's grievance (403)")
    void testRaiseAppeal_NonOwnerCitizen_ThrowsAccessDeniedException() {
        grievance.setStatus(Status.RESOLVED);

        Feedback feedback = new Feedback();
        feedback.setId(50L);
        feedback.setGrievance(grievance);
        feedback.setIsAppealed(false);

        when(feedbackRepository.findById(50L)).thenReturn(Optional.of(feedback));

        Long unauthorizedCitizenId = 99L;
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                grievanceService.raiseAppeal(50L, "Not resolved properly", unauthorizedCitizenId));

        assertEquals("You can only appeal grievances you submitted", ex.getMessage());
        verify(feedbackRepository, never()).save(any());
        verify(grievanceRepository, never()).save(any());
        verify(notificationService, never()).sendAppealConfirmationEmail(any(), any());
    }

    @Test
    @DisplayName("raiseAppeal() rejects duplicate appeal on already-appealed feedback (400)")
    void testRaiseAppeal_AlreadyAppealed_ThrowsIllegalArgumentException() {
        grievance.setStatus(Status.RESOLVED);

        Feedback feedback = new Feedback();
        feedback.setId(50L);
        feedback.setGrievance(grievance);
        feedback.setIsAppealed(true);
        feedback.setAppealReason("First appeal was filed");

        when(feedbackRepository.findById(50L)).thenReturn(Optional.of(feedback));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                grievanceService.raiseAppeal(50L, "Trying second appeal", 10L));

        assertTrue(ex.getMessage().contains("This feedback has already been appealed"));
        verify(grievanceRepository, never()).save(any());
        verify(notificationService, never()).sendAppealConfirmationEmail(any(), any());
    }

    @Test
    @DisplayName("raiseAppeal() reverts status to IN_PROGRESS and escalates priority to HIGH via repository saves")
    void testRaiseAppeal_SuccessfulAppeal_SavesRevertedStatusAndHighPriority() {
        grievance.setStatus(Status.RESOLVED);
        grievance.setPriority(Priority.LOW);

        Feedback feedback = new Feedback();
        feedback.setId(50L);
        feedback.setGrievance(grievance);
        feedback.setRating(1);
        feedback.setComment("Leak started again");
        feedback.setIsAppealed(false);

        when(feedbackRepository.findById(50L)).thenReturn(Optional.of(feedback));
        when(grievanceRepository.save(any(Grievance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GrievanceResponseDto response = grievanceService.raiseAppeal(50L, "Water pipeline is leaking again", 10L);

        // Verify Feedback repository save call
        ArgumentCaptor<Feedback> feedbackCaptor = ArgumentCaptor.forClass(Feedback.class);
        verify(feedbackRepository).save(feedbackCaptor.capture());
        Feedback savedFeedback = feedbackCaptor.getValue();
        assertTrue(savedFeedback.getIsAppealed());
        assertEquals("Water pipeline is leaking again", savedFeedback.getAppealReason());

        // Verify Grievance repository save call
        ArgumentCaptor<Grievance> grievanceCaptor = ArgumentCaptor.forClass(Grievance.class);
        verify(grievanceRepository).save(grievanceCaptor.capture());
        Grievance savedGrievance = grievanceCaptor.getValue();
        assertEquals(Status.IN_PROGRESS, savedGrievance.getStatus());
        assertEquals(Priority.HIGH, savedGrievance.getPriority());

        // Verify response reflects reopened status and escalated priority
        assertNotNull(response);
        assertEquals(Status.IN_PROGRESS, response.getStatus());
        assertEquals(Priority.HIGH, response.getPriority());
    }

    @Test
    @DisplayName("submitFeedback() successfully saves feedback for resolved grievance by owner")
    void testSubmitFeedback_Success() {
        grievance.setStatus(Status.RESOLVED);

        FeedbackRequestDto dto = new FeedbackRequestDto();
        dto.setRating(5);
        dto.setComment("Fixed promptly and cleanly");

        when(grievanceRepository.findById(100L)).thenReturn(Optional.of(grievance));
        when(feedbackRepository.findByGrievanceId(100L)).thenReturn(Optional.empty());

        GrievanceResponseDto response = grievanceService.submitFeedback(100L, dto, 10L);

        assertNotNull(response);
        ArgumentCaptor<Feedback> captor = ArgumentCaptor.forClass(Feedback.class);
        verify(feedbackRepository).save(captor.capture());
        Feedback saved = captor.getValue();
        assertEquals(5, saved.getRating());
        assertEquals("Fixed promptly and cleanly", saved.getComment());
        assertEquals(false, saved.getIsAppealed());
    }

    @Test
    @DisplayName("submitFeedback() rejects feedback when grievance is not yet RESOLVED")
    void testSubmitFeedback_NotResolved_ThrowsIllegalArgumentException() {
        grievance.setStatus(Status.IN_PROGRESS);

        FeedbackRequestDto dto = new FeedbackRequestDto();
        dto.setRating(3);
        dto.setComment("Still being worked on");

        when(grievanceRepository.findById(100L)).thenReturn(Optional.of(grievance));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> grievanceService.submitFeedback(100L, dto, 10L));

        assertTrue(ex.getMessage().contains("Feedback can only be submitted for resolved grievances"));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    @DisplayName("getQueueForDepartment() returns grievances sorted by priority descending")
    void testGetQueueForDepartment_SortedByPriorityDescending() {
        Grievance mediumGrievance = Grievance.builder()
                .id(101L)
                .trackingId("GRV-MED1111")
                .status(Status.IN_PROGRESS)
                .priority(Priority.MEDIUM)
                .citizen(citizen)
                .department(department)
                .build();

        Grievance highGrievance = Grievance.builder()
                .id(102L)
                .trackingId("GRV-HIGH222")
                .status(Status.PENDING)
                .priority(Priority.HIGH)
                .citizen(citizen)
                .department(department)
                .build();

        Grievance lowGrievance = Grievance.builder()
                .id(103L)
                .trackingId("GRV-LOW3333")
                .status(Status.PENDING)
                .priority(Priority.LOW)
                .citizen(citizen)
                .department(department)
                .build();

        when(grievanceRepository.findByDepartmentIdAndStatusIn(
                eq(1L), eq(List.of(Status.PENDING, Status.IN_PROGRESS))))
                .thenReturn(List.of(mediumGrievance, lowGrievance, highGrievance));

        List<GrievanceResponseDto> queue = grievanceService.getQueueForDepartment(1L);

        assertEquals(3, queue.size());
        assertEquals(Priority.HIGH, queue.get(0).getPriority());
        assertEquals(Priority.MEDIUM, queue.get(1).getPriority());
        assertEquals(Priority.LOW, queue.get(2).getPriority());
    }
}
