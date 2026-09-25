package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminStoneTypeController;
import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.dto.StoneTypeSaveRequest;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.service.AdminStoneTypeService;
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
class AdminStoneTypeControllerTest {

    @Mock
    private AdminStoneTypeService adminStoneTypeService;

    @InjectMocks
    private AdminStoneTypeController adminStoneTypeController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private StoneTypeDto stoneTypeDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminStoneTypeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        stoneTypeDto = StoneTypeDto.builder()
                .id(1L)
                .name("Бриллиант")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/stone-types should return 200 with all stone types")
    void shouldReturnAllStoneTypes() throws Exception {
        when(adminStoneTypeService.getAllStoneTypes()).thenReturn(List.of(stoneTypeDto));

        mockMvc.perform(get("/api/v1/admin/stone-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Бриллиант"))
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/admin/stone-types should return 201 with created stone type")
    void shouldCreateStoneType() throws Exception {
        StoneTypeSaveRequest request = StoneTypeSaveRequest.builder()
                .name("Бриллиант")
                .isActive(true)
                .build();

        when(adminStoneTypeService.createStoneType(any(StoneTypeSaveRequest.class))).thenReturn(stoneTypeDto);

        mockMvc.perform(post("/api/v1/admin/stone-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Бриллиант"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/stone-types should return 400 when name is blank")
    void shouldReturn400WhenNameBlank() throws Exception {
        StoneTypeSaveRequest request = StoneTypeSaveRequest.builder()
                .name("")
                .build();

        mockMvc.perform(post("/api/v1/admin/stone-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    @DisplayName("POST /api/v1/admin/stone-types should return 400 on duplicate name")
    void shouldReturn400OnDuplicateName() throws Exception {
        StoneTypeSaveRequest request = StoneTypeSaveRequest.builder()
                .name("Бриллиант")
                .build();

        when(adminStoneTypeService.createStoneType(any(StoneTypeSaveRequest.class)))
                .thenThrow(new IllegalArgumentException("Тип камня с названием 'Бриллиант' уже существует"));

        mockMvc.perform(post("/api/v1/admin/stone-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Тип камня с названием 'Бриллиант' уже существует"));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/stone-types/{id} should return 204 No Content")
    void shouldDeleteStoneType() throws Exception {
        doNothing().when(adminStoneTypeService).deleteStoneType(1L);

        mockMvc.perform(delete("/api/v1/admin/stone-types/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/stone-types/{id} should return 404 when stone type not found")
    void shouldReturn404OnDeleteNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Тип камня с id 99 не найден"))
                .when(adminStoneTypeService).deleteStoneType(99L);

        mockMvc.perform(delete("/api/v1/admin/stone-types/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Тип камня с id 99 не найден"));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/stone-types/{id} should return 400 when used in products")
    void shouldReturn400OnDeleteUsedInProducts() throws Exception {
        doThrow(new IllegalStateException("Невозможно удалить тип камня, который используется в изделиях"))
                .when(adminStoneTypeService).deleteStoneType(1L);

        mockMvc.perform(delete("/api/v1/admin/stone-types/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Невозможно удалить тип камня, который используется в изделиях"));
    }
}
