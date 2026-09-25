package com.marziyagold.service;

import com.marziyagold.dto.AdminProductStoneRequest;
import com.marziyagold.dto.CharacteristicEntryDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductSaveRequest;
import com.marziyagold.dto.ProductSummaryDto;
import com.marziyagold.entity.Category;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.ProductImage;
import com.marziyagold.entity.ProductStone;
import com.marziyagold.entity.StoneType;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.CategoryRepository;
import com.marziyagold.repository.ProductRepository;
import com.marziyagold.repository.StoneTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private StoneTypeRepository stoneTypeRepository;

    @InjectMocks
    private AdminProductService adminProductService;

    private Category category;
    private StoneType diamondStoneType;
    private Product product;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .name("Кольца")
                .slug("koltsa")
                .sortOrder(1)
                .isVisible(true)
                .build();

        diamondStoneType = StoneType.builder()
                .id(10L)
                .name("Бриллиант")
                .isActive(true)
                .build();

        product = Product.builder()
                .id(100L)
                .sku("MG-R-001")
                .name("Кольцо с бриллиантом")
                .slug("koltso-s-brilliantom")
                .description("Эксклюзивное изделие")
                .category(category)
                .isVisible(true)
                .characteristics(new ArrayList<>(List.of(
                        Map.of("name", "Металл", "value", "Золото"),
                        Map.of("name", "Проба", "value", "585")
                )))
                .images(new ArrayList<>())
                .stones(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ProductImage image = ProductImage.builder()
                .id(1001L)
                .product(product)
                .url("https://res.cloudinary.com/demo/image/upload/sample.jpg")
                .sortOrder(0)
                .build();
        product.getImages().add(image);

        ProductStone stone = ProductStone.builder()
                .id(2001L)
                .product(product)
                .stoneType(diamondStoneType)
                .sortOrder(0)
                .characteristics(new ArrayList<>(List.of(Map.of("name", "Вес", "value", "0.5 ct"))))
                .build();
        product.getStones().add(stone);
    }

    @Test
    @DisplayName("getProducts should return paginated summary DTOs with default sort by createdAt DESC")
    void shouldReturnPaginatedProducts() {
        Page<Product> page = new PageImpl<>(List.of(product), PageRequest.of(0, 20), 1);

        when(productRepository.findAdminFiltered(eq(1L), eq(true), eq("MG-R-001"), any(Pageable.class)))
                .thenReturn(page);

        Page<ProductSummaryDto> result = adminProductService.getProducts(
                PageRequest.of(0, 20),
                "MG-R-001",
                1L,
                true
        );

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        ProductSummaryDto summary = result.getContent().get(0);
        assertThat(summary.getId()).isEqualTo(100L);
        assertThat(summary.getSku()).isEqualTo("MG-R-001");
        assertThat(summary.getName()).isEqualTo("Кольцо с бриллиантом");
        assertThat(summary.getCategoryName()).isEqualTo("Кольца");
        assertThat(summary.getMainImageUrl()).isEqualTo("https://res.cloudinary.com/demo/image/upload/sample.jpg");
        assertThat(summary.getImageUrls()).containsExactly("https://res.cloudinary.com/demo/image/upload/sample.jpg");
        assertThat(summary.getCharacteristics()).hasSize(2);
    }

    @Test
    @DisplayName("getProductById should return complete product detail")
    void shouldReturnProductById() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        ProductDetailDto detail = adminProductService.getProductById(100L);

        assertThat(detail).isNotNull();
        assertThat(detail.getId()).isEqualTo(100L);
        assertThat(detail.getSku()).isEqualTo("MG-R-001");
        assertThat(detail.getName()).isEqualTo("Кольцо с бриллиантом");
        assertThat(detail.getCategory().getName()).isEqualTo("Кольца");
        assertThat(detail.getImages()).hasSize(1);
        assertThat(detail.getStones()).hasSize(1);
        assertThat(detail.getStones().get(0).getStoneTypeName()).isEqualTo("Бриллиант");
        assertThat(detail.getCharacteristics()).hasSize(2);
    }

    @Test
    @DisplayName("getProductById should throw ResourceNotFoundException when product does not exist")
    void shouldThrowWhenProductByIdNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.getProductById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Товар с id 999 не найден");
    }

    @Test
    @DisplayName("createProduct should successfully create product with images and stones")
    void shouldCreateProductSuccessfully() {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-E-002")
                .name("Серьги Восточные")
                .description("Изящные серьги")
                .categoryId(1L)
                .isVisible(true)
                .imageUrls(List.of("https://res.cloudinary.com/demo/image/upload/earrings.jpg"))
                .characteristics(List.of(new CharacteristicEntryDto("Металл", "Белое золото")))
                .stones(List.of(AdminProductStoneRequest.builder()
                        .stoneTypeId(10L)
                        .sortOrder(0)
                        .characteristics(List.of(new CharacteristicEntryDto("Вес", "0.3 ct")))
                        .build()))
                .build();

        when(productRepository.existsBySku("MG-E-002")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsBySlug("sergi-vostochnye")).thenReturn(false);
        when(stoneTypeRepository.findById(10L)).thenReturn(Optional.of(diamondStoneType));

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product saved = invocation.getArgument(0);
            saved.setId(101L);
            saved.setCreatedAt(LocalDateTime.now());
            saved.setUpdatedAt(LocalDateTime.now());
            return saved;
        });

        ProductDetailDto result = adminProductService.createProduct(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(101L);
        assertThat(result.getSku()).isEqualTo("MG-E-002");
        assertThat(result.getName()).isEqualTo("Серьги Восточные");
        assertThat(result.getSlug()).isEqualTo("sergi-vostochnye");
        assertThat(result.getImages()).hasSize(1);
        assertThat(result.getStones()).hasSize(1);
        assertThat(result.getStones().get(0).getStoneTypeName()).isEqualTo("Бриллиант");
        assertThat(result.getCharacteristics()).hasSize(1);
    }

    @Test
    @DisplayName("createProduct should throw IllegalArgumentException when SKU already exists")
    void shouldThrowWhenCreatingWithDuplicateSku() {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-R-001")
                .name("Дубликат")
                .categoryId(1L)
                .build();

        when(productRepository.existsBySku("MG-R-001")).thenReturn(true);

        assertThatThrownBy(() -> adminProductService.createProduct(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Товар с артикулом (SKU) 'MG-R-001' уже существует");
    }

    @Test
    @DisplayName("createProduct should throw ResourceNotFoundException when category not found")
    void shouldThrowWhenCreatingWithInvalidCategory() {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-NEW-01")
                .name("Новый товар")
                .categoryId(999L)
                .build();

        when(productRepository.existsBySku("MG-NEW-01")).thenReturn(false);
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.createProduct(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Категория с id 999 не найдена");
    }

    @Test
    @DisplayName("createProduct should resolve slug collisions by appending counter")
    void shouldResolveSlugCollision() {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-COLL-01")
                .name("Кольцо")
                .categoryId(1L)
                .build();

        when(productRepository.existsBySku("MG-COLL-01")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsBySlug("koltso")).thenReturn(true);
        when(productRepository.existsBySlug("koltso-1")).thenReturn(false);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        when(productRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        adminProductService.createProduct(request);

        Product saved = captor.getValue();
        assertThat(saved.getSlug()).isEqualTo("koltso-1");
    }

    @Test
    @DisplayName("updateProduct should update product fields, images and stones transactionally")
    void shouldUpdateProductSuccessfully() {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-R-001-UPDATED")
                .name("Кольцо с сапфиром")
                .description("Обновленное описание")
                .categoryId(1L)
                .isVisible(false)
                .imageUrls(List.of("https://res.cloudinary.com/demo/image/upload/sapphire.jpg"))
                .characteristics(List.of(new CharacteristicEntryDto("Проба", "750")))
                .stones(List.of(AdminProductStoneRequest.builder()
                        .stoneTypeId(10L)
                        .sortOrder(0)
                        .characteristics(List.of(new CharacteristicEntryDto("Вес", "1.0 ct")))
                        .build()))
                .build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySkuAndIdNot("MG-R-001-UPDATED", 100L)).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(stoneTypeRepository.findById(10L)).thenReturn(Optional.of(diamondStoneType));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDetailDto result = adminProductService.updateProduct(100L, request);

        assertThat(result).isNotNull();
        assertThat(result.getSku()).isEqualTo("MG-R-001-UPDATED");
        assertThat(result.getName()).isEqualTo("Кольцо с сапфиром");
        assertThat(result.getDescription()).isEqualTo("Обновленное описание");
        assertThat(result.getIsVisible()).isFalse();
        assertThat(result.getImages()).hasSize(1);
        assertThat(result.getImages().get(0).getUrl()).isEqualTo("https://res.cloudinary.com/demo/image/upload/sapphire.jpg");
        assertThat(result.getStones()).hasSize(1);
        assertThat(result.getCharacteristics()).hasSize(1);
    }

    @Test
    @DisplayName("updateProduct should throw IllegalArgumentException on duplicate SKU")
    void shouldThrowWhenUpdatingWithDuplicateSku() {
        ProductSaveRequest request = ProductSaveRequest.builder()
                .sku("MG-OTHER-002")
                .name("Кольцо")
                .categoryId(1L)
                .build();

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySkuAndIdNot("MG-OTHER-002", 100L)).thenReturn(true);

        assertThatThrownBy(() -> adminProductService.updateProduct(100L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Товар с артикулом (SKU) 'MG-OTHER-002' уже существует");
    }

    @Test
    @DisplayName("deleteProduct should delete existing product")
    void shouldDeleteProduct() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        adminProductService.deleteProduct(100L);

        verify(productRepository).delete(product);
    }

    @Test
    @DisplayName("deleteProduct should throw ResourceNotFoundException when product does not exist")
    void shouldThrowWhenDeletingNonExistentProduct() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.deleteProduct(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Товар с id 999 не найден");
    }

    @Test
    @DisplayName("updateVisibility should toggle isVisible status")
    void shouldUpdateVisibility() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDetailDto result = adminProductService.updateVisibility(100L, false);

        assertThat(result.getIsVisible()).isFalse();
        assertThat(product.getIsVisible()).isFalse();
    }
}
