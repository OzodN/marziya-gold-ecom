package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminCharacteristicKeyController;
import com.marziyagold.dto.CharacteristicKeyDto;
import com.marziyagold.dto.CharacteristicKeySaveRequest;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.service.AdminCharacteristicService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminCharacteristicKeyControllerTest {

    @Mock
    private AdminCharacteristicService adminCharacteristicService;

    @InjectMocks
    private AdminCharacteristicKeyController adminCharacteristicKeyController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private CharacteristicKeyDto keyDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminCharacteristicKeyController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        keyDto = CharacteristicKeyDto.builder()
                .id(1L)
                .name("Металл")
                .sortOrder(1)
                .isFilterable(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/characteristic-keys should return 200 with all keys")
    void shouldReturnAllKeys() throws Exception {
        when(adminCharacteristicService.getAllCharacteristicKeys()).thenReturn(List.of(keyDto));

        mockMvc.perform(get("/api/v1/admin/characteristic-keys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Металл"))
                .andExpect(jsonPath("$[0].sortOrder").value(1))
                .andExpect(jsonPath("$[0].isFilterable").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/admin/characteristic-keys should return 201 with created key")
    void shouldCreateKey() throws Exception {
        CharacteristicKeySaveRequest request = CharacteristicKeySaveRequest.builder()
                .name("Металл")
                .sortOrder(1)
                .isFilterable(true)
                .build();

        when(adminCharacteristicService.createCharacteristicKey(any(CharacteristicKeySaveRequest.class)))
                .thenReturn(keyDto);

        mockMvc.perform(post("/api/v1/admin/characteristic-keys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Металл"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/characteristic-keys should return 400 when name is blank")
    void shouldReturn400WhenNameBlank() throws Exception {
        CharacteristicKeySaveRequest request = CharacteristicKeySaveRequest.builder()
                .name("")
                .build();

        mockMvc.perform(post("/api/v1/admin/characteristic-keys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    @DisplayName("POST /api/v1/admin/characteristic-keys should return 400 on duplicate name")
    void shouldReturn400OnDuplicateName() throws Exception {
        CharacteristicKeySaveRequest request = CharacteristicKeySaveRequest.builder()
                .name("Металл")
                .build();

        when(adminCharacteristicService.createCharacteristicKey(any(CharacteristicKeySaveRequest.class)))
                .thenThrow(new IllegalArgumentException("Характеристика с названием 'Металл' уже существует"));

        mockMvc.perform(post("/api/v1/admin/characteristic-keys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Характеристика с названием 'Металл' уже существует"));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/characteristic-keys/{id} should return 204 No Content")
    void shouldDeleteKey() throws Exception {
        doNothing().when(adminCharacteristicService).deleteCharacteristicKey(1L);

        mockMvc.perform(delete("/api/v1/admin/characteristic-keys/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/characteristic-keys/{id} should return 404 when key not found")
    void shouldReturn404OnDeleteNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Характеристика с id 99 не найдена"))
                .when(adminCharacteristicService).deleteCharacteristicKey(99L);

        mockMvc.perform(delete("/api/v1/admin/characteristic-keys/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Характеристика с id 99 не найдена"));
    }
}
