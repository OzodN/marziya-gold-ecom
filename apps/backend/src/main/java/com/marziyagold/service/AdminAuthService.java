package com.marziyagold.service;

import com.marziyagold.dto.AdminUserDto;
import com.marziyagold.dto.LoginRequest;
import com.marziyagold.entity.AdminUser;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.AdminUserRepository;
import com.marziyagold.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;
import java.util.Collections;

@Service
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${application.security.jwt.cookie-name:access_token}")
    private String cookieName;

    @Value("${application.security.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    public AdminAuthService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AdminUserDto authenticate(LoginRequest request) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletResponse response = attributes != null ? attributes.getResponse() : null;
        return authenticate(request, response);
    }

    public AdminUserDto authenticate(LoginRequest request, HttpServletResponse response) {
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Имя пользователя и пароль обязательны");
        }

        AdminUser adminUser = adminUserRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new BadCredentialsException("Неверное имя пользователя или пароль"));

        if (!passwordEncoder.matches(request.getPassword(), adminUser.getPasswordHash())) {
            throw new BadCredentialsException("Неверное имя пользователя или пароль");
        }

        String token = jwtTokenProvider.generateToken(adminUser.getUsername(), adminUser.getRole());

        if (response != null) {
            ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(Duration.ofMillis(jwtTokenProvider.getExpirationMs()))
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        String roleName = adminUser.getRole() != null ? adminUser.getRole() : "ADMIN";
        String authorityName = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                adminUser.getUsername(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority(authorityName))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return AdminUserDto.builder()
                .id(adminUser.getId())
                .username(adminUser.getUsername())
                .role(adminUser.getRole())
                .createdAt(adminUser.getCreatedAt())
                .build();
    }

    public void logout(HttpServletResponse response) {
        if (response != null) {
            ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
        SecurityContextHolder.clearContext();
    }

    public AdminUser getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadCredentialsException("Администратор не авторизован");
        }
        String username = authentication.getName();
        return adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Администратор '" + username + "' не найден"));
    }

    public AdminUserDto getCurrentAdminDto() {
        AdminUser adminUser = getCurrentAdmin();
        return AdminUserDto.builder()
                .id(adminUser.getId())
                .username(adminUser.getUsername())
                .role(adminUser.getRole())
                .createdAt(adminUser.getCreatedAt())
                .build();
    }
}
