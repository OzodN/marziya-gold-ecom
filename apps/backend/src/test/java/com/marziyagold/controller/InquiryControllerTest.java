package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.dto.InquiryCreateRequest;
import com.marziyagold.dto.InquiryItemRequest;
import com.marziyagold.dto.InquiryResponseDto;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.RateLimitExceededException;
import com.marziyagold.service.InquiryService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InquiryControllerTest {

    @Mock
    private InquiryService inquiryService;

    @InjectMocks
    private InquiryController inquiryController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(inquiryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/inquiries should return 201 Created on valid inquiry")
    void shouldCreateInquirySuccessfully() throws Exception {
        InquiryCreateRequest request = InquiryCreateRequest.builder()
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .comment("Кольцо размер 17.5")
                .items(List.of(InquiryItemRequest.builder().productId(1L).quantity(1).build()))
                .build();

        InquiryResponseDto responseDto = InquiryResponseDto.builder()
                .id(42L)
                .clientName("Азиз")
                .status("NEW")
                .message("Запрос на изготовление успешно отправлен. Мастер свяжется с вами.")
                .createdAt(LocalDateTime.now())
                .build();

        when(inquiryService.createInquiry(any(InquiryCreateRequest.class), eq("203.0.113.195")))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/inquiries")
                        .header("X-Forwarded-For", "203.0.113.195, 70.41.3.18")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.clientName").value("Азиз"))
                .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    @DisplayName("POST /api/v1/inquiries should return 429 when rate limit exceeded")
    void shouldReturn429WhenRateLimitExceeded() throws Exception {
        InquiryCreateRequest request = InquiryCreateRequest.builder()
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .items(List.of(InquiryItemRequest.builder().productId(1L).quantity(1).build()))
                .build();

        when(inquiryService.createInquiry(any(InquiryCreateRequest.class), eq("192.168.1.1")))
                .thenThrow(new RateLimitExceededException("Превышен лимит запросов"));

        mockMvc.perform(post("/api/v1/inquiries")
                        .header("X-Real-IP", "192.168.1.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.error").value("Too Many Requests"));
    }

    @Test
    @DisplayName("POST /api/v1/inquiries should return 400 when body fails validation")
    void shouldReturn400WhenValidationFails() throws Exception {
        // Missing name and phone
        InquiryCreateRequest request = InquiryCreateRequest.builder()
                .clientName("")
                .clientPhone("")
                .items(List.of())
                .build();

        mockMvc.perform(post("/api/v1/inquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").exists());
    }
}
