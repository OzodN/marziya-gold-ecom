package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminSettingsController;
import com.marziyagold.dto.ContactSettingsUpdateRequest;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.service.AdminSettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminSettingsControllerTest {

    @Mock
    private AdminSettingsService adminSettingsService;

    @InjectMocks
    private AdminSettingsController adminSettingsController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Map<String, String> settingsMap;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminSettingsController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        settingsMap = new LinkedHashMap<>();
        settingsMap.put("contact_phone", "+998 90 123 45 67");
        settingsMap.put("contact_telegram", "marziyagold");
        settingsMap.put("about_text", "Мастерская Марзия");
        settingsMap.put("master_name", "Марзия");
    }

    @Test
    @DisplayName("GET /api/v1/admin/settings should return 200 with all settings")
    void shouldReturnAllSettings() throws Exception {
        when(adminSettingsService.getAllSettings()).thenReturn(settingsMap);

        mockMvc.perform(get("/api/v1/admin/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contact_phone").value("+998 90 123 45 67"))
                .andExpect(jsonPath("$.contact_telegram").value("marziyagold"))
                .andExpect(jsonPath("$.about_text").value("Мастерская Марзия"))
                .andExpect(jsonPath("$.master_name").value("Марзия"));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/settings should return 200 with updated settings")
    void shouldUpdateSettings() throws Exception {
        ContactSettingsUpdateRequest request = ContactSettingsUpdateRequest.builder()
                .phone("+998 99 888 77 66")
                .telegramUsername("marziya_new")
                .aboutMaster("Обновленное описание")
                .build();

        Map<String, String> updatedMap = new LinkedHashMap<>(settingsMap);
        updatedMap.put("contact_phone", "+998 99 888 77 66");
        updatedMap.put("contact_telegram", "marziya_new");
        updatedMap.put("about_text", "Обновленное описание");

        when(adminSettingsService.updateContactSettings(any(ContactSettingsUpdateRequest.class)))
                .thenReturn(updatedMap);

        mockMvc.perform(put("/api/v1/admin/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contact_phone").value("+998 99 888 77 66"))
                .andExpect(jsonPath("$.contact_telegram").value("marziya_new"))
                .andExpect(jsonPath("$.about_text").value("Обновленное описание"));
    }
}
