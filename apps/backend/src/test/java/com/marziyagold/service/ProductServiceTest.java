package com.marziyagold.service;

import com.marziyagold.dto.BatchValidationRequest;
import com.marziyagold.dto.ProductAvailabilityDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductPageResponse;
import com.marziyagold.entity.Category;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.ProductImage;
import com.marziyagold.entity.ProductStone;
import com.marziyagold.entity.StoneType;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Кольца")
                .slug("koltsa")
                .sortOrder(1)
                .isVisible(true)
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .sku("MG-R-001")
                .name("Кольцо Сияние Востока")
                .slug("koltso-siyanie-vostoka")
                .description("Авторское кольцо ручной работы")
                .category(sampleCategory)
                .isVisible(true)
                .characteristics(List.of(
                        Map.of("name", "Металл", "value", "Желтое золото"),
                        Map.of("name", "Проба", "value", "585")
                ))
                .images(new ArrayList<>())
                .stones(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ProductImage image = ProductImage.builder()
                .id(100L)
                .product(sampleProduct)
                .url("https://images.example.com/ring.jpg")
                .sortOrder(0)
                .build();
        sampleProduct.getImages().add(image);

        StoneType stoneType = StoneType.builder()
                .id(5L)
                .name("Бриллиант")
                .isActive(true)
                .build();

        ProductStone stone = ProductStone.builder()
                .id(200L)
                .product(sampleProduct)
                .stoneType(stoneType)
                .sortOrder(0)
                .characteristics(List.of(Map.of("name", "Вес", "value", "0.50 ct")))
                .build();
        sampleProduct.getStones().add(stone);
    }

    @Test
    @DisplayName("Should return paginated products with metadata")
    void shouldReturnPaginatedProducts() {
        Page<Product> page = new PageImpl<>(List.of(sampleProduct));
        when(productRepository.findFiltered(eq("koltsa"), eq(5L), eq("сияние"), any(Pageable.class)))
                .thenReturn(page);

        ProductPageResponse response = productService.getProducts(0, 12, "сияние", "koltsa", 5L);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getName()).isEqualTo("Кольцо Сияние Востока");
        assertThat(response.getContent().get(0).getSku()).isEqualTo("MG-R-001");
        assertThat(response.getContent().get(0).getCategoryName()).isEqualTo("Кольца");
        assertThat(response.getContent().get(0).getMainImageUrl()).isEqualTo("https://images.example.com/ring.jpg");
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getTotalPages()).isEqualTo(1);
        assertThat(response.getPage()).isEqualTo(0);
        assertThat(response.getPageNumber()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return product detail by slug")
    void shouldReturnProductDetailBySlug() {
        when(productRepository.findBySlugAndIsVisibleTrue("koltso-siyanie-vostoka"))
                .thenReturn(Optional.of(sampleProduct));

        ProductDetailDto detail = productService.getProductBySlug("koltso-siyanie-vostoka");

        assertThat(detail).isNotNull();
        assertThat(detail.getId()).isEqualTo(10L);
        assertThat(detail.getName()).isEqualTo("Кольцо Сияние Востока");
        assertThat(detail.getCategory().getName()).isEqualTo("Кольца");
        assertThat(detail.getImages()).hasSize(1);
        assertThat(detail.getStones()).hasSize(1);
        assertThat(detail.getStones().get(0).getStoneTypeName()).isEqualTo("Бриллиант");
        assertThat(detail.getCharacteristics()).hasSize(2);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product slug not found")
    void shouldThrowWhenProductSlugNotFound() {
        when(productRepository.findBySlugAndIsVisibleTrue("non-existent"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductBySlug("non-existent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("не найдено");
    }

    @Test
    @DisplayName("Should validate batch product availability correctly")
    void shouldValidateBatchAvailability() {
        when(productRepository.findByIdIn(List.of(10L, 999L)))
                .thenReturn(List.of(sampleProduct));

        BatchValidationRequest request = new BatchValidationRequest(List.of(10L, 999L));
        List<ProductAvailabilityDto> result = productService.validateBatch(request);

        assertThat(result).hasSize(2);

        ProductAvailabilityDto first = result.get(0);
        assertThat(first.getProductId()).isEqualTo(10L);
        assertThat(first.getIsAvailable()).isTrue();
        assertThat(first.getName()).isEqualTo("Кольцо Сияние Востока");
        assertThat(first.getMainImageUrl()).isEqualTo("https://images.example.com/ring.jpg");

        ProductAvailabilityDto second = result.get(1);
        assertThat(second.getProductId()).isEqualTo(999L);
        assertThat(second.getIsAvailable()).isFalse();
        assertThat(second.getName()).isNull();
    }
}
