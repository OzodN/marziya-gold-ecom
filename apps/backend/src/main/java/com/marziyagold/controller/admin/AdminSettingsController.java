package com.marziyagold.controller.admin;

import com.marziyagold.dto.ContactSettingsUpdateRequest;
import com.marziyagold.service.AdminSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        Map<String, String> settings = adminSettingsService.getAllSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateSettings(@Valid @RequestBody ContactSettingsUpdateRequest request) {
        Map<String, String> updated = adminSettingsService.updateContactSettings(request);
        return ResponseEntity.ok(updated);
    }
}
