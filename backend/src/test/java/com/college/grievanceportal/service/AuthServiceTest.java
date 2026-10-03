package com.college.grievanceportal.service;

import com.college.grievanceportal.config.JwtProvider;
import com.college.grievanceportal.dto.AuthResponseDto;
import com.college.grievanceportal.dto.LoginRequestDto;
import com.college.grievanceportal.dto.RegisterRequestDto;
import com.college.grievanceportal.model.entity.User;
import com.college.grievanceportal.model.enums.Role;
import com.college.grievanceportal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AuthService covering citizen registration, credential authentication,
 * password hashing verification, and JWT role claim dispatching for CITIZEN and GRO roles.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequestDto registerRequest;
    private LoginRequestDto loginRequest;
    private User citizenUser;
    private User groUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequestDto();
        registerRequest.setName("Asha Sharma");
        registerRequest.setEmail("asha@example.com");
        registerRequest.setPassword("RawPassword123");
        registerRequest.setPhoneNumber("9876543210");

        loginRequest = new LoginRequestDto();
        loginRequest.setEmail("asha@example.com");
        loginRequest.setPassword("RawPassword123");

        citizenUser = User.builder()
                .id(10L)
                .name("Asha Sharma")
                .email("asha@example.com")
                .password("encoded_bcrypt_hash")
                .phoneNumber("9876543210")
                .role(Role.CITIZEN)
                .build();

        groUser = User.builder()
                .id(20L)
                .name("Official Verma")
                .email("gro.pwd@grievanceportal.gov")
                .password("encoded_gro_hash")
                .role(Role.GRO)
                .build();
    }

    @Test
    @DisplayName("register() successfully creates user with hashed password when email is not taken")
    void testRegister_Success_EncodesPasswordAndReturnsToken() {
        when(userRepository.existsByEmail("asha@example.com")).thenReturn(false);
        when(passwordEncoder.encode("RawPassword123")).thenReturn("encoded_bcrypt_hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(jwtProvider.generateToken(any(User.class))).thenReturn("mocked.jwt.token");

        AuthResponseDto response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals(10L, response.getUserId());
        assertEquals("asha@example.com", response.getEmail());
        assertEquals("CITIZEN", response.getRole());

        // Verify password was passed to encoder and never stored raw
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("encoded_bcrypt_hash", savedUser.getPassword());
        assertNotEquals("RawPassword123", savedUser.getPassword());
        assertEquals(Role.CITIZEN, savedUser.getRole());
        verify(passwordEncoder).encode("RawPassword123");
    }

    @Test
    @DisplayName("register() throws IllegalArgumentException when email is already registered")
    void testRegister_DuplicateEmail_ThrowsIllegalArgumentException() {
        when(userRepository.existsByEmail("asha@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> authService.register(registerRequest));

        assertTrue(ex.getMessage().contains("Email is already registered"));
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(jwtProvider, never()).generateToken(any(User.class));
    }

    @Test
    @DisplayName("login() succeeds with valid credentials and returns AuthResponseDto with JWT")
    void testLogin_Success_ReturnsValidAuthResponse() {
        when(userRepository.findByEmail("asha@example.com")).thenReturn(Optional.of(citizenUser));
        when(passwordEncoder.matches("RawPassword123", "encoded_bcrypt_hash")).thenReturn(true);
        when(jwtProvider.generateToken(citizenUser)).thenReturn("valid.jwt.token");

        AuthResponseDto response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals(10L, response.getUserId());
        assertEquals("asha@example.com", response.getEmail());
        assertEquals("CITIZEN", response.getRole());
    }

    @Test
    @DisplayName("login() fails with BadCredentialsException when password does not match")
    void testLogin_IncorrectPassword_ThrowsBadCredentialsException() {
        when(userRepository.findByEmail("asha@example.com")).thenReturn(Optional.of(citizenUser));
        when(passwordEncoder.matches("RawPassword123", "encoded_bcrypt_hash")).thenReturn(false);

        BadCredentialsException ex = assertThrows(BadCredentialsException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid email or password", ex.getMessage());
        verify(jwtProvider, never()).generateToken(any(User.class));
    }

    @Test
    @DisplayName("login() fails with BadCredentialsException when email does not exist")
    void testLogin_EmailNotFound_ThrowsBadCredentialsException() {
        when(userRepository.findByEmail("asha@example.com")).thenReturn(Optional.empty());

        BadCredentialsException ex = assertThrows(BadCredentialsException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid email or password", ex.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtProvider, never()).generateToken(any(User.class));
    }

    @Test
    @DisplayName("login() verifies JwtProvider receives CITIZEN role claim when citizen logs in")
    void testLogin_EmbedsCitizenRoleClaimInToken() {
        when(userRepository.findByEmail("asha@example.com")).thenReturn(Optional.of(citizenUser));
        when(passwordEncoder.matches("RawPassword123", "encoded_bcrypt_hash")).thenReturn(true);
        when(jwtProvider.generateToken(citizenUser)).thenReturn("citizen.jwt.token");

        AuthResponseDto response = authService.login(loginRequest);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(jwtProvider).generateToken(captor.capture());
        assertEquals(Role.CITIZEN, captor.getValue().getRole());
        assertEquals("CITIZEN", response.getRole());
    }

    @Test
    @DisplayName("login() verifies JwtProvider receives GRO role claim when GRO logs in")
    void testLogin_EmbedsGroRoleClaimInToken() {
        LoginRequestDto groLoginRequest = new LoginRequestDto();
        groLoginRequest.setEmail("gro.pwd@grievanceportal.gov");
        groLoginRequest.setPassword("GroSecretPassword");

        when(userRepository.findByEmail("gro.pwd@grievanceportal.gov")).thenReturn(Optional.of(groUser));
        when(passwordEncoder.matches("GroSecretPassword", "encoded_gro_hash")).thenReturn(true);
        when(jwtProvider.generateToken(groUser)).thenReturn("gro.jwt.token");

        AuthResponseDto response = authService.login(groLoginRequest);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(jwtProvider).generateToken(captor.capture());
        assertEquals(Role.GRO, captor.getValue().getRole());
        assertEquals("GRO", response.getRole());
    }
}
