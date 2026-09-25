package com.marziyagold.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.controller.admin.AdminProductController;
import com.marziyagold.dto.AdminProductStoneRequest;
import com.marziyagold.dto.CategoryDto;
import com.marziyagold.dto.CharacteristicEntryDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductImageDto;
import com.marziyagold.dto.ProductSaveRequest;
import com.marziyagold.dto.ProductStoneDto;
import com.marziyagold.dto.ProductSummaryDto;
import com.marziyagold.dto.ProductVisibilityUpdateRequest;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.service.AdminProductService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminProductControllerTest {

    @Mock
    private AdminProductService adminProductService;

    @InjectMocks
    private AdminProductController adminProductController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private ProductDetailDto sampleDetail;
    private ProductSummaryDto sampleSummary;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminProductController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleSummary = ProductSummaryDto.builder()
                .id(1L)
                .sku("MG-R-001")
                .name("Кольцо с бриллиантом")
                .slug("koltso-s-brilliantom")
                .categoryName("Кольца")
                .categorySlug("koltsa")
                .mainImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")
                .imageUrls(List.of("https://res.cloudinary.com/demo/image/upload/sample.jpg"))
                .isVisible(true)
                .characteristics(List.of(new CharacteristicEntryDto("Проба", "585")))
                .build();

        sampleDetail = ProductDetailDto.builder()
                .id(1L)
                .sku("MG-R-001")
                .name("Кольцо с бриллиантом")
                .slug("koltso-s-brilliantom")
                .description("Описание изделия")
                .category(CategoryDto.builder().id(10L).name("Кольца").slug("koltsa").build())
                .categoryName("Кольца")
                .categorySlug("koltsa")
                .images(List.of(ProductImageDto.builder().id(101L).url("https://res.cloudinary.com/demo/image/upload/sample.jpg").sortOrder(0).build()))
                .stones(List.of(ProductStoneDto.builder().id(201L).stoneTypeId(5L).stoneTypeName("Бриллиант").sortOrder(0).build()))
                .characteristics(List.of(new CharacteristicEntryDto("Проба", "585")))
                .createdAt(LocalDateTime.now())
                .isVisible(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/products should return 200 with ProductPageResponse and pagination headers")
    void shouldReturnProductPage() throws Exception {
        Page<ProductSummaryDto> page = new PageImpl<>(List.of(sampleSummary), PageRequest.of(0, 20), 1);
        when(adminProductService.getProducts(any(Pageable.class), eq(null), eq(null), eq(null)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/admin/products")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Count", "1"))
                .andExpect(header().string("X-Total-Pages", "1"))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].sku").value("MG-R-001"))
                .andExpect(jsonPath("$.content[0].name").value("Кольцо с бриллиантом"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/admin/products with filters should pass filters to service")
    void shouldFilterProducts() throws Exception {
        Page<ProductSummaryDto> page = new PageImpl<>(List.of(sampleSummary), PageRequest.of(0, 20), 1);
        when(adminProductService.getProducts(any(Pageable.class), eq("кольцо"), eq(10L), eq(true)))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/admin/products")
                        .param("q", "кольцо")
                        .param("categoryId", "10")
                        .param("isVisible", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("MG-R-001"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/products should return 201 with created ProductDetailDto")
    void shouldCreateProduct() throws Exception {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-NEW-001")
                .name("Новое Кольцо")
                .description("Описание")
                .categoryId(10L)
                .isVisible(true)
                .imageUrls(List.of("https://res.cloudinary.com/demo/image/upload/new.jpg"))
                .characteristics(List.of(new CharacteristicEntryDto("Проба", "585")))
                .stones(List.of(AdminProductStoneRequest.builder().stoneTypeId(5L).sortOrder(0).build()))
                .build();

        when(adminProductService.createProduct(any(ProductSaveRequest.class)))
                .thenReturn(sampleDetail);

        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("MG-R-001"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/products with invalid request should return 400 Bad Request")
    void shouldReturn400OnInvalidCreateRequest() throws Exception {
        // Missing sku, name, categoryId
        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.sku").exists())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.categoryId").exists());
    }

    @Test
    @DisplayName("POST /api/v1/admin/products with duplicate SKU should return 400 Bad Request")
    void shouldReturn400OnDuplicateSku() throws Exception {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-DUP-01")
                .name("Дубликат")
                .categoryId(10L)
                .build();

        when(adminProductService.createProduct(any(ProductSaveRequest.class)))
                .thenThrow(new IllegalArgumentException("Товар с артикулом (SKU) 'MG-DUP-01' уже существует"));

        mockMvc.perform(post("/api/v1/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Товар с артикулом (SKU) 'MG-DUP-01' уже существует"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/products/{id} should return 200 with product details")
    void shouldReturnProductById() throws Exception {
        when(adminProductService.getProductById(1L)).thenReturn(sampleDetail);

        mockMvc.perform(get("/api/v1/admin/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("MG-R-001"))
                .andExpect(jsonPath("$.stones[0].stoneTypeName").value("Бриллиант"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/products/{id} should return 404 when product not found")
    void shouldReturn404WhenProductNotFound() throws Exception {
        when(adminProductService.getProductById(999L))
                .thenThrow(new ResourceNotFoundException("Товар с id 999 не найден"));

        mockMvc.perform(get("/api/v1/admin/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Товар с id 999 не найден"));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/products/{id} should return 200 with updated product")
    void shouldUpdateProduct() throws Exception {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-R-001")
                .name("Кольцо с сапфиром")
                .categoryId(10L)
                .build();

        when(adminProductService.updateProduct(eq(1L), any(ProductSaveRequest.class)))
                .thenReturn(sampleDetail);

        mockMvc.perform(put("/api/v1/admin/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/products/{id} should return 404 when product not found")
    void shouldReturn404OnUpdateNonExistent() throws Exception {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-R-001")
                .name("Кольцо")
                .categoryId(10L)
                .build();

        when(adminProductService.updateProduct(eq(999L), any(ProductSaveRequest.class)))
                .thenThrow(new ResourceNotFoundException("Товар с id 999 не найден"));

        mockMvc.perform(put("/api/v1/admin/products/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/products/{id} should return 204 No Content")
    void shouldDeleteProduct() throws Exception {
        doNothing().when(adminProductService).deleteProduct(1L);

        mockMvc.perform(delete("/api/v1/admin/products/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/products/{id} should return 404 when not found")
    void shouldReturn404OnDeleteNonExistent() throws Exception {
        doThrow(new ResourceNotFoundException("Товар с id 999 не найден"))
                .when(adminProductService).deleteProduct(999L);

        mockMvc.perform(delete("/api/v1/admin/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/products/{id}/visibility should return 200 with updated visibility")
    void shouldToggleVisibility() throws Exception {
        ProductVisibilityUpdateRequest request = ProductVisibilityUpdateRequest.builder()
                .isVisible(false)
                .build();

        sampleDetail.setIsVisible(false);
        when(adminProductService.updateVisibility(1L, false)).thenReturn(sampleDetail);

        mockMvc.perform(patch("/api/v1/admin/products/1/visibility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.isVisible").value(false));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/products/{id}/visibility without isVisible should return 400 Bad Request")
    void shouldReturn400WhenVisibilityMissing() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/products/1/visibility")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
