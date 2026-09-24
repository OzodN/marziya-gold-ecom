package com.marziyagold.controller;

import com.marziyagold.dto.ContactSettingsDto;
import com.marziyagold.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/contacts")
    public ResponseEntity<ContactSettingsDto> getContacts() {
        ContactSettingsDto response = settingsService.getContactSettings();
        return ResponseEntity.ok(response);
    }
}
