package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminInquiryController;
import com.marziyagold.dto.InquiryDetailDto;
import com.marziyagold.dto.InquiryItemDetailDto;
import com.marziyagold.dto.InquiryStatusHistoryDto;
import com.marziyagold.dto.InquiryStatusUpdateRequest;
import com.marziyagold.dto.InquirySummaryDto;
import com.marziyagold.dto.NewInquiriesCountDto;
import com.marziyagold.entity.InquiryStatus;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.service.AdminInquiryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminInquiryControllerTest {

    @Mock
    private AdminInquiryService adminInquiryService;

    @InjectMocks
    private AdminInquiryController adminInquiryController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminInquiryController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/inquiries should return 200 with inquiries array and pagination headers")
    void shouldReturnInquiriesList() throws Exception {
        InquirySummaryDto summary = InquirySummaryDto.builder()
                .id(1L)
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .itemCount(2)
                .status(InquiryStatus.NEW)
                .createdAt(LocalDateTime.now())
                .build();

        Page<InquirySummaryDto> page = new PageImpl<>(List.of(summary), PageRequest.of(0, 10), 1);

        when(adminInquiryService.getInquiries(any(Pageable.class), eq(null)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/admin/inquiries")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Count", "1"))
                .andExpect(header().string("X-Total-Pages", "1"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].clientName").value("Азиз"))
                .andExpect(jsonPath("$[0].status").value("NEW"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/inquiries with status filter should filter by status")
    void shouldFilterInquiriesByStatus() throws Exception {
        InquirySummaryDto summary = InquirySummaryDto.builder()
                .id(2L)
                .clientName("Мадина")
                .clientPhone("+998909876543")
                .itemCount(1)
                .status(InquiryStatus.CONTACTED)
                .createdAt(LocalDateTime.now())
                .build();

        Page<InquirySummaryDto> page = new PageImpl<>(List.of(summary), PageRequest.of(0, 10), 1);

        when(adminInquiryService.getInquiries(any(Pageable.class), eq(InquiryStatus.CONTACTED)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/admin/inquiries")
                        .param("status", "CONTACTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("CONTACTED"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/inquiries/new-count should return count of NEW inquiries")
    void shouldReturnNewInquiriesCount() throws Exception {
        when(adminInquiryService.getNewInquiriesCount())
                .thenReturn(new NewInquiriesCountDto(5L));

        mockMvc.perform(get("/api/v1/admin/inquiries/new-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5))
                .andExpect(jsonPath("$.newCount").value(5));
    }

    @Test
    @DisplayName("GET /api/v1/admin/inquiries/{id} should return 200 with inquiry detail")
    void shouldReturnInquiryDetail() throws Exception {
        InquiryItemDetailDto item = InquiryItemDetailDto.builder()
                .id(10L)
                .productId(42L)
                .quantity(1)
                .productSnapshot(Map.of("name", "Кольцо", "sku", "MG-001"))
                .build();

        InquiryStatusHistoryDto history = InquiryStatusHistoryDto.builder()
                .id(100L)
                .oldStatus(null)
                .newStatus(InquiryStatus.NEW)
                .changedBy("CLIENT")
                .changedAt(LocalDateTime.now())
                .build();

        InquiryDetailDto detail = InquiryDetailDto.builder()
                .id(1L)
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .comment("Размер 17.5")
                .status(InquiryStatus.NEW)
                .createdAt(LocalDateTime.now())
                .items(List.of(item))
                .history(List.of(history))
                .build();

        when(adminInquiryService.getInquiryById(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/admin/inquiries/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.clientName").value("Азиз"))
                .andExpect(jsonPath("$.items[0].productSnapshot.name").value("Кольцо"))
                .andExpect(jsonPath("$.items[0].snapshot.sku").value("MG-001"))
                .andExpect(jsonPath("$.history[0].newStatus").value("NEW"))
                .andExpect(jsonPath("$.statusHistory[0].newStatus").value("NEW"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/inquiries/{id} should return 404 when not found")
    void shouldReturn404WhenInquiryNotFound() throws Exception {
        when(adminInquiryService.getInquiryById(999L))
                .thenThrow(new ResourceNotFoundException("Заявка с ID 999 не найдена"));

        mockMvc.perform(get("/api/v1/admin/inquiries/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Заявка с ID 999 не найдена"));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/inquiries/{id}/status should return 200 with updated inquiry")
    void shouldUpdateInquiryStatus() throws Exception {
        InquiryStatusUpdateRequest request = InquiryStatusUpdateRequest.builder()
                .status(InquiryStatus.IN_PROGRESS)
                .comment("Принято в работу")
                .build();

        InquiryDetailDto updated = InquiryDetailDto.builder()
                .id(1L)
                .clientName("Азиз")
                .status(InquiryStatus.IN_PROGRESS)
                .build();

        when(adminInquiryService.updateInquiryStatus(eq(1L), eq(InquiryStatus.IN_PROGRESS), eq("admin_user")))
                .thenReturn(updated);

        Principal principal = () -> "admin_user";

        mockMvc.perform(put("/api/v1/admin/inquiries/1/status")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/inquiries/{id}/status should return 400 when status is missing")
    void shouldReturn400WhenStatusMissing() throws Exception {
        mockMvc.perform(put("/api/v1/admin/inquiries/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
