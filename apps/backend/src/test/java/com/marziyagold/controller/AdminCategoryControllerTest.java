package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminCategoryController;
import com.marziyagold.dto.CategoryAdminResponse;
import com.marziyagold.dto.CategoryAdminSaveRequest;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.service.AdminCategoryService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminCategoryControllerTest {

    @Mock
    private AdminCategoryService adminCategoryService;

    @InjectMocks
    private AdminCategoryController adminCategoryController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private CategoryAdminResponse catResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminCategoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        catResponse = CategoryAdminResponse.builder()
                .id(1L)
                .name("Кольца")
                .slug("koltsa")
                .sortOrder(1)
                .isVisible(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/categories should return 200 with all categories")
    void shouldReturnAllCategories() throws Exception {
        when(adminCategoryService.getAllCategories()).thenReturn(List.of(catResponse));

        mockMvc.perform(get("/api/v1/admin/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Кольца"))
                .andExpect(jsonPath("$[0].slug").value("koltsa"))
                .andExpect(jsonPath("$[0].isVisible").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/admin/categories should return 201 with created category")
    void shouldCreateCategory() throws Exception {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца")
                .slug("koltsa")
                .sortOrder(1)
                .isVisible(true)
                .build();

        when(adminCategoryService.createCategory(any(CategoryAdminSaveRequest.class))).thenReturn(catResponse);

        mockMvc.perform(post("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Кольца"))
                .andExpect(jsonPath("$.slug").value("koltsa"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/categories should return 400 when name is blank")
    void shouldReturn400WhenNameBlank() throws Exception {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("")
                .build();

        mockMvc.perform(post("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    @DisplayName("POST /api/v1/admin/categories should return 400 on duplicate name")
    void shouldReturn400OnDuplicateName() throws Exception {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца")
                .build();

        when(adminCategoryService.createCategory(any(CategoryAdminSaveRequest.class)))
                .thenThrow(new IllegalArgumentException("Категория с названием 'Кольца' уже существует"));

        mockMvc.perform(post("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Категория с названием 'Кольца' уже существует"));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/categories/{id} should return 200 with updated category")
    void shouldUpdateCategory() throws Exception {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца обновленные")
                .slug("koltsa-updated")
                .sortOrder(5)
                .isVisible(false)
                .build();

        CategoryAdminResponse updated = CategoryAdminResponse.builder()
                .id(1L)
                .name("Кольца обновленные")
                .slug("koltsa-updated")
                .sortOrder(5)
                .isVisible(false)
                .build();

        when(adminCategoryService.updateCategory(eq(1L), any(CategoryAdminSaveRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/admin/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Кольца обновленные"))
                .andExpect(jsonPath("$.isVisible").value(false));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/categories/{id} should return 404 when category not found")
    void shouldReturn404WhenCategoryNotFound() throws Exception {
        CategoryAdminSaveRequest request = CategoryAdminSaveRequest.builder()
                .name("Кольца")
                .build();

        when(adminCategoryService.updateCategory(eq(99L), any(CategoryAdminSaveRequest.class)))
                .thenThrow(new ResourceNotFoundException("Категория с id 99 не найдена"));

        mockMvc.perform(put("/api/v1/admin/categories/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Категория с id 99 не найдена"));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/categories/{id} should return 204 No Content")
    void shouldDeleteCategory() throws Exception {
        doNothing().when(adminCategoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/v1/admin/categories/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/categories/{id} should return 404 when category not found")
    void shouldReturn404OnDeleteNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Категория с id 99 не найдена"))
                .when(adminCategoryService).deleteCategory(99L);

        mockMvc.perform(delete("/api/v1/admin/categories/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/categories/{id} should return 400 when category has products")
    void shouldReturn400OnDeleteWithProducts() throws Exception {
        doThrow(new IllegalStateException("Невозможно удалить категорию, к которой привязаны изделия"))
                .when(adminCategoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/v1/admin/categories/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Невозможно удалить категорию, к которой привязаны изделия"));
    }
}
