package com.marziyagold.controller.admin;

import com.marziyagold.dto.AdminUserDto;
import com.marziyagold.dto.LoginRequest;
import com.marziyagold.service.AdminAuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AdminUserDto> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AdminUserDto adminUser = adminAuthService.authenticate(request, response);
        return ResponseEntity.ok(adminUser);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        adminAuthService.logout(response);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AdminUserDto> me() {
        AdminUserDto currentAdmin = adminAuthService.getCurrentAdminDto();
        return ResponseEntity.ok(currentAdmin);
    }
}
