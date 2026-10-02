package com.college.grievanceportal.service;

import com.college.grievanceportal.model.entity.Department;
import com.college.grievanceportal.model.entity.Grievance;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Priority;
import com.college.grievanceportal.model.enums.Role;
import com.college.grievanceportal.model.enums.Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for NotificationService ensuring email dispatching logic works as expected
 * and that errors from SMTP or network failure are swallowed and isolated.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NotificationService notificationService;

    private User citizen;
    private Grievance grievance;
    private Department department;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(notificationService, "fromAddress", "noreply@grievanceportal.gov");

        department = new Department();
        department.setId(1L);
        department.setName("Public Works Department");

        citizen = User.builder()
                .id(10L)
                .name("Ramesh Kumar")
                .email("ramesh@example.com")
                .role(Role.CITIZEN)
                .build();

        grievance = Grievance.builder()
                .id(100L)
                .trackingId("GRV-TEST1234")
                .subject("Broken street light on Main Street")
                .status(Status.IN_PROGRESS)
                .priority(Priority.HIGH)
                .citizen(citizen)
                .department(department)
                .build();
    }

    @Test
    @DisplayName("sendStatusChangeEmail sends properly formatted SimpleMailMessage")
    void testSendStatusChangeEmail_Success() {
        notificationService.sendStatusChangeEmail(citizen, grievance, "PENDING", "IN_PROGRESS");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertNotNull(sent.getTo());
        assertEquals("ramesh@example.com", sent.getTo()[0]);
        assertEquals("noreply@grievanceportal.gov", sent.getFrom());
        assertTrue(sent.getSubject().contains("GRV-TEST1234"));
        assertTrue(sent.getText().contains("Public Works Department"));
        assertTrue(sent.getText().contains("PENDING"));
        assertTrue(sent.getText().contains("IN_PROGRESS"));
    }

    @Test
    @DisplayName("sendStatusChangeEmail catches MailAuthenticationException without throwing")
    void testSendStatusChangeEmail_AuthenticationFailureIsolated() {
        doThrow(new MailAuthenticationException("Bad credentials"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        // Must NOT throw exception to caller
        assertDoesNotThrow(() ->
                notificationService.sendStatusChangeEmail(citizen, grievance, "PENDING", "IN_PROGRESS")
        );

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("sendStatusChangeEmail catches MailSendException without throwing")
    void testSendStatusChangeEmail_NetworkFailureIsolated() {
        doThrow(new MailSendException("SMTP relay timeout"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() ->
                notificationService.sendStatusChangeEmail(citizen, grievance, "IN_PROGRESS", "RESOLVED")
        );

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("sendStatusChangeEmail safely skips sending if citizen email is missing")
    void testSendStatusChangeEmail_MissingEmail() {
        User noEmailUser = User.builder().name("Anonymous").email("").build();

        assertDoesNotThrow(() ->
                notificationService.sendStatusChangeEmail(noEmailUser, grievance, "PENDING", "IN_PROGRESS")
        );

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("sendAppealConfirmationEmail sends appeal confirmation with escalated priority")
    void testSendAppealConfirmationEmail_Success() {
        notificationService.sendAppealConfirmationEmail(citizen, grievance);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertNotNull(sent.getTo());
        assertEquals("ramesh@example.com", sent.getTo()[0]);
        assertTrue(sent.getSubject().contains("Appeal Received"));
        assertTrue(sent.getText().contains("ESCALATED TO HIGH"));
        assertTrue(sent.getText().contains("GRV-TEST1234"));
    }

    @Test
    @DisplayName("sendAppealConfirmationEmail isolates failure without throwing")
    void testSendAppealConfirmationEmail_FailureIsolated() {
        doThrow(new MailSendException("Brevo connection refused"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() ->
                notificationService.sendAppealConfirmationEmail(citizen, grievance)
        );

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
