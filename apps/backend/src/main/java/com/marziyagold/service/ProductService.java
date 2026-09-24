package com.marziyagold.service;

import com.marziyagold.dto.BatchValidationRequest;
import com.marziyagold.dto.CategoryDto;
import com.marziyagold.dto.CharacteristicEntryDto;
import com.marziyagold.dto.ProductAvailabilityDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductImageDto;
import com.marziyagold.dto.ProductPageResponse;
import com.marziyagold.dto.ProductStoneDto;
import com.marziyagold.dto.ProductSummaryDto;
import com.marziyagold.entity.Category;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.ProductImage;
import com.marziyagold.entity.ProductStone;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductPageResponse getProducts(int page, int size, String q, String categorySlug, Long stoneTypeId) {
        int pageNumber = Math.max(page, 0);
        int pageSize = size <= 0 ? 12 : Math.min(size, 100);

        String searchQuery = (q != null && !q.trim().isEmpty()) ? q.trim() : null;
        String catSlug = (categorySlug != null && !categorySlug.trim().isEmpty()) ? categorySlug.trim() : null;

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.ASC, "id"));

        Page<Product> productPage = productRepository.findFiltered(catSlug, stoneTypeId, searchQuery, pageable);

        Page<ProductSummaryDto> dtoPage = productPage.map(this::toSummaryDto);
        return ProductPageResponse.from(dtoPage);
    }

    public ProductDetailDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsVisibleTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Изделие с кодом '" + slug + "' не найдено"));

        return toDetailDto(product);
    }

    public List<ProductAvailabilityDto> validateBatch(BatchValidationRequest request) {
        if (request == null || request.getProductIds() == null || request.getProductIds().isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> requestedIds = request.getProductIds();
        List<Product> foundProducts = productRepository.findByIdIn(requestedIds);

        Map<Long, Product> productMap = foundProducts.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity(), (p1, p2) -> p1));

        return requestedIds.stream()
                .map(id -> {
                    Product p = productMap.get(id);
                    boolean isAvailable = p != null && Boolean.TRUE.equals(p.getIsVisible());
                    String name = p != null ? p.getName() : null;
                    String sku = p != null ? p.getSku() : null;
                    String mainImageUrl = (p != null && p.getImages() != null && !p.getImages().isEmpty())
                            ? p.getImages().get(0).getUrl()
                            : null;

                    return ProductAvailabilityDto.builder()
                            .productId(id)
                            .isAvailable(isAvailable)
                            .name(name)
                            .sku(sku)
                            .mainImageUrl(mainImageUrl)
                            .build();
                })
                .toList();
    }

    private ProductSummaryDto toSummaryDto(Product product) {
        String mainImageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                ? product.getImages().get(0).getUrl()
                : null;

        String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;
        String categorySlug = product.getCategory() != null ? product.getCategory().getSlug() : null;

        return ProductSummaryDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .categoryName(categoryName)
                .categorySlug(categorySlug)
                .mainImageUrl(mainImageUrl)
                .isVisible(product.getIsVisible())
                .characteristics(mapCharacteristics(product.getCharacteristics()))
                .build();
    }

    private ProductDetailDto toDetailDto(Product product) {
        Category category = product.getCategory();
        CategoryDto categoryDto = category != null
                ? CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .sortOrder(category.getSortOrder())
                .build()
                : null;

        List<ProductImageDto> imageDtos = product.getImages() != null
                ? product.getImages().stream().map(this::toImageDto).toList()
                : Collections.emptyList();

        List<ProductStoneDto> stoneDtos = product.getStones() != null
                ? product.getStones().stream().map(this::toStoneDto).toList()
                : Collections.emptyList();

        return ProductDetailDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .category(categoryDto)
                .categoryName(category != null ? category.getName() : null)
                .categorySlug(category != null ? category.getSlug() : null)
                .images(imageDtos)
                .stones(stoneDtos)
                .characteristics(mapCharacteristics(product.getCharacteristics()))
                .createdAt(product.getCreatedAt())
                .isVisible(product.getIsVisible())
                .build();
    }

    private ProductImageDto toImageDto(ProductImage image) {
        return ProductImageDto.builder()
                .id(image.getId())
                .url(image.getUrl())
                .publicId(image.getPublicId())
                .sortOrder(image.getSortOrder())
                .build();
    }

    private ProductStoneDto toStoneDto(ProductStone stone) {
        Long stoneTypeId = stone.getStoneType() != null ? stone.getStoneType().getId() : null;
        String stoneTypeName = stone.getStoneType() != null ? stone.getStoneType().getName() : null;

        return ProductStoneDto.builder()
                .id(stone.getId())
                .stoneTypeId(stoneTypeId)
                .stoneTypeName(stoneTypeName)
                .sortOrder(stone.getSortOrder())
                .characteristics(mapCharacteristics(stone.getCharacteristics()))
                .build();
    }

    private List<CharacteristicEntryDto> mapCharacteristics(List<Map<String, Object>> list) {
        if (list == null) {
            return Collections.emptyList();
        }
        return list.stream()
                .map(m -> CharacteristicEntryDto.builder()
                        .name(m.get("name") != null ? m.get("name").toString() : "")
                        .value(m.get("value") != null ? m.get("value").toString() : "")
                        .build())
                .toList();
    }
}
