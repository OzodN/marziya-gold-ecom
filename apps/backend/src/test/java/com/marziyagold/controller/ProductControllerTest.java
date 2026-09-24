package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.dto.BatchValidationRequest;
import com.marziyagold.dto.ProductAvailabilityDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductPageResponse;
import com.marziyagold.dto.ProductSummaryDto;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.service.ProductService;
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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/products should return 200 with catalog page")
    void shouldReturnProductCatalogPage() throws Exception {
        ProductSummaryDto summary = ProductSummaryDto.builder()
                .id(1L)
                .sku("MG-R-001")
                .name("Кольцо Сияние Востока")
                .slug("koltso-siyanie-vostoka")
                .categoryName("Кольца")
                .isVisible(true)
                .build();

        ProductPageResponse pageResponse = ProductPageResponse.builder()
                .content(List.of(summary))
                .page(0)
                .pageNumber(0)
                .size(12)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        when(productService.getProducts(anyInt(), anyInt(), any(), any(), any()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/products")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("MG-R-001"))
                .andExpect(jsonPath("$.content[0].name").value("Кольцо Сияние Востока"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.pageNumber").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/products/{slug} should return 200 with product details")
    void shouldReturnProductDetails() throws Exception {
        ProductDetailDto detail = ProductDetailDto.builder()
                .id(1L)
                .sku("MG-R-001")
                .name("Кольцо Сияние Востока")
                .slug("koltso-siyanie-vostoka")
                .build();

        when(productService.getProductBySlug("koltso-siyanie-vostoka"))
                .thenReturn(detail);

        mockMvc.perform(get("/api/v1/products/koltso-siyanie-vostoka"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("MG-R-001"))
                .andExpect(jsonPath("$.name").value("Кольцо Сияние Востока"));
    }

    @Test
    @DisplayName("GET /api/v1/products/{slug} should return 404 when product not found")
    void shouldReturn404WhenNotFound() throws Exception {
        when(productService.getProductBySlug(anyString()))
                .thenThrow(new ResourceNotFoundException("Изделие не найдено"));

        mockMvc.perform(get("/api/v1/products/unknown-product"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Изделие не найдено"));
    }

    @Test
    @DisplayName("POST /api/v1/products/validate-batch should return 200 with item availability")
    void shouldValidateBatch() throws Exception {
        BatchValidationRequest request = new BatchValidationRequest(List.of(1L, 2L));
        ProductAvailabilityDto avail = ProductAvailabilityDto.builder()
                .productId(1L)
                .isAvailable(true)
                .name("Кольцо")
                .build();

        when(productService.validateBatch(any(BatchValidationRequest.class)))
                .thenReturn(List.of(avail));

        mockMvc.perform(post("/api/v1/products/validate-batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").value(1))
                .andExpect(jsonPath("$[0].isAvailable").value(true));
    }
}
