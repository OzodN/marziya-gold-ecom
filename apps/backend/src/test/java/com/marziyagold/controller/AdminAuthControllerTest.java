package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminAuthController;
import com.marziyagold.dto.AdminUserDto;
import com.marziyagold.dto.LoginRequest;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.service.AdminAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminAuthControllerTest {

    @Mock
    private AdminAuthService adminAuthService;

    @InjectMocks
    private AdminAuthController adminAuthController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminAuthController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/admin/auth/login should return 200 with admin profile on valid credentials")
    void shouldLoginSuccessfully() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("admin123")
                .build();

        AdminUserDto userDto = AdminUserDto.builder()
                .id(1L)
                .username("admin")
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build();

        when(adminAuthService.authenticate(any(LoginRequest.class), any(HttpServletResponse.class)))
                .thenReturn(userDto);

        mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/auth/login should return 401 on invalid credentials")
    void shouldReturn401OnInvalidCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("wrongpassword")
                .build();

        when(adminAuthService.authenticate(any(LoginRequest.class), any(HttpServletResponse.class)))
                .thenThrow(new BadCredentialsException("Неверное имя пользователя или пароль"));

        mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Неверное имя пользователя или пароль"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/auth/login should return 400 on blank username or password")
    void shouldReturn400OnBlankCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .username("")
                .password("")
                .build();

        mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /api/v1/admin/auth/logout should return 200")
    void shouldLogoutSuccessfully() throws Exception {
        doNothing().when(adminAuthService).logout(any(HttpServletResponse.class));

        mockMvc.perform(post("/api/v1/admin/auth/logout"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/admin/auth/me should return 200 with current admin profile")
    void shouldReturnCurrentAdmin() throws Exception {
        AdminUserDto userDto = AdminUserDto.builder()
                .id(1L)
                .username("admin")
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build();

        when(adminAuthService.getCurrentAdminDto()).thenReturn(userDto);

        mockMvc.perform(get("/api/v1/admin/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/auth/me should return 401 when not authenticated")
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        when(adminAuthService.getCurrentAdminDto())
                .thenThrow(new BadCredentialsException("Администратор не авторизован"));

        mockMvc.perform(get("/api/v1/admin/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
