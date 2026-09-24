package com.marziyagold.service;

import com.marziyagold.dto.AdminUserDto;
import com.marziyagold.dto.LoginRequest;
import com.marziyagold.entity.AdminUser;
import com.marziyagold.repository.AdminUserRepository;
import com.marziyagold.security.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAuthServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AdminAuthService adminAuthService;

    private AdminUser sampleAdmin;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        ReflectionTestUtils.setField(adminAuthService, "cookieName", "access_token");
        ReflectionTestUtils.setField(adminAuthService, "cookieSecure", false);

        sampleAdmin = AdminUser.builder()
                .id(1L)
                .username("admin")
                .passwordHash("$2a$10$hashedPassword")
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should authenticate successfully with correct credentials and set HttpOnly cookie")
    void shouldAuthenticateSuccessfully() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("admin123")
                .build();

        MockHttpServletResponse response = new MockHttpServletResponse();

        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));
        when(passwordEncoder.matches("admin123", "$2a$10$hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken("admin", "ADMIN")).thenReturn("generated-jwt-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(86400000L);

        AdminUserDto result = adminAuthService.authenticate(request, response);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("admin");
        assertThat(result.getRole()).isEqualTo("ADMIN");

        String setCookie = response.getHeader(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).isNotNull();
        assertThat(setCookie).contains("access_token=generated-jwt-token");
        assertThat(setCookie).contains("HttpOnly");
        assertThat(setCookie).contains("SameSite=Strict");
        assertThat(setCookie).contains("Path=/");
        assertThat(setCookie).contains("Max-Age=86400");

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("admin");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when username is not found")
    void shouldThrowWhenUsernameNotFound() {
        LoginRequest request = LoginRequest.builder()
                .username("unknown")
                .password("password")
                .build();

        when(adminUserRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> adminAuthService.authenticate(request, response))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Неверное имя пользователя или пароль");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password does not match")
    void shouldThrowWhenPasswordMismatch() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("wrongpassword")
                .build();

        MockHttpServletResponse response = new MockHttpServletResponse();

        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> adminAuthService.authenticate(request, response))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Неверное имя пользователя или пароль");
    }

    @Test
    @DisplayName("Should clear cookie and context on logout")
    void shouldClearCookieOnLogout() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        adminAuthService.logout(response);

        String setCookie = response.getHeader(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).isNotNull();
        assertThat(setCookie).contains("access_token=");
        assertThat(setCookie).contains("Max-Age=0");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("Should return current admin when authenticated")
    void shouldReturnCurrentAdminWhenAuthenticated() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        null,
                        java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))
                )
        );

        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(sampleAdmin));

        AdminUserDto currentAdmin = adminAuthService.getCurrentAdminDto();

        assertThat(currentAdmin).isNotNull();
        assertThat(currentAdmin.getUsername()).isEqualTo("admin");
        assertThat(currentAdmin.getRole()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when unauthenticated on getCurrentAdmin")
    void shouldThrowWhenUnauthenticatedOnGetCurrentAdmin() {
        assertThatThrownBy(() -> adminAuthService.getCurrentAdmin())
                .isInstanceOf(BadCredentialsException.class);
    }
}
