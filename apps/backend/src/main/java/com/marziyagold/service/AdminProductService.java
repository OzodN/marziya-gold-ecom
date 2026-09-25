package com.marziyagold.service;

import com.marziyagold.dto.AdminProductStoneRequest;
import com.marziyagold.dto.CategoryDto;
import com.marziyagold.dto.CharacteristicEntryDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductImageDto;
import com.marziyagold.dto.ProductSaveRequest;
import com.marziyagold.dto.ProductStoneDto;
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
import com.marziyagold.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoneTypeRepository stoneTypeRepository;

    public Page<ProductSummaryDto> getProducts(Pageable pageable, String query, Long categoryId, Boolean isVisible) {
        Pageable effectivePageable = (pageable != null && pageable.isPaged())
                ? pageable
                : PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (effectivePageable.getSort().isUnsorted()) {
            effectivePageable = PageRequest.of(
                    effectivePageable.getPageNumber(),
                    effectivePageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        String searchQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Product> pageResult = productRepository.findAdminFiltered(categoryId, isVisible, searchQuery, effectivePageable);
        return pageResult.map(this::toSummaryDto);
    }

    public ProductDetailDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Товар с id " + id + " не найден"));

        return toDetailDto(product);
    }

    @Transactional
    public ProductDetailDto createProduct(ProductSaveRequest request) {
        String sku = request.getSku().trim();
        if (productRepository.existsBySku(sku)) {
            throw new IllegalArgumentException("Товар с артикулом (SKU) '" + sku + "' уже существует");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Категория с id " + request.getCategoryId() + " не найдена"));

        String baseSlug = SlugUtils.toSlug(request.getName());
        if (baseSlug.isBlank()) {
            baseSlug = "product-" + System.currentTimeMillis();
        }
        String uniqueSlug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = baseSlug + "-" + counter++;
        }

        Product product = Product.builder()
                .sku(sku)
                .name(request.getName().trim())
                .slug(uniqueSlug)
                .description(request.getDescription())
                .category(category)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .characteristics(toCharacteristicsMapList(request.getCharacteristics()))
                .images(new ArrayList<>())
                .stones(new ArrayList<>())
                .build();

        if (request.getImageUrls() != null) {
            int imgOrder = 0;
            for (String url : request.getImageUrls()) {
                if (url != null && !url.isBlank()) {
                    ProductImage img = ProductImage.builder()
                            .product(product)
                            .url(url.trim())
                            .sortOrder(imgOrder++)
                            .build();
                    product.getImages().add(img);
                }
            }
        }

        if (request.getStones() != null) {
            int stoneOrder = 0;
            for (AdminProductStoneRequest stoneReq : request.getStones()) {
                StoneType stoneType = stoneTypeRepository.findById(stoneReq.getStoneTypeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Тип камня с id " + stoneReq.getStoneTypeId() + " не найден"));

                ProductStone stone = ProductStone.builder()
                        .product(product)
                        .stoneType(stoneType)
                        .sortOrder(stoneReq.getSortOrder() != null ? stoneReq.getSortOrder() : stoneOrder++)
                        .characteristics(toCharacteristicsMapList(stoneReq.getCharacteristics()))
                        .build();
                product.getStones().add(stone);
            }
        }

        Product saved = productRepository.save(product);
        return toDetailDto(saved);
    }

    @Transactional
    public ProductDetailDto updateProduct(Long id, ProductSaveRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Товар с id " + id + " не найден"));

        String sku = request.getSku().trim();
        if (productRepository.existsBySkuAndIdNot(sku, id)) {
            throw new IllegalArgumentException("Товар с артикулом (SKU) '" + sku + "' уже существует");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Категория с id " + request.getCategoryId() + " не найдена"));

        product.setSku(sku);
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
        product.setCharacteristics(toCharacteristicsMapList(request.getCharacteristics()));

        if (product.getSlug() == null || product.getSlug().isBlank()) {
            String baseSlug = SlugUtils.toSlug(request.getName());
            if (baseSlug.isBlank()) {
                baseSlug = "product-" + id;
            }
            String uniqueSlug = baseSlug;
            int counter = 1;
            while (productRepository.existsBySlugAndIdNot(uniqueSlug, id)) {
                uniqueSlug = baseSlug + "-" + counter++;
            }
            product.setSlug(uniqueSlug);
        }

        // Update images cleanly
        product.getImages().clear();
        if (request.getImageUrls() != null) {
            int imgOrder = 0;
            for (String url : request.getImageUrls()) {
                if (url != null && !url.isBlank()) {
                    ProductImage img = ProductImage.builder()
                            .product(product)
                            .url(url.trim())
                            .sortOrder(imgOrder++)
                            .build();
                    product.getImages().add(img);
                }
            }
        }

        // Update stones cleanly
        product.getStones().clear();
        if (request.getStones() != null) {
            int stoneOrder = 0;
            for (AdminProductStoneRequest stoneReq : request.getStones()) {
                StoneType stoneType = stoneTypeRepository.findById(stoneReq.getStoneTypeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Тип камня с id " + stoneReq.getStoneTypeId() + " не найден"));

                ProductStone stone = ProductStone.builder()
                        .product(product)
                        .stoneType(stoneType)
                        .sortOrder(stoneReq.getSortOrder() != null ? stoneReq.getSortOrder() : stoneOrder++)
                        .characteristics(toCharacteristicsMapList(stoneReq.getCharacteristics()))
                        .build();
                product.getStones().add(stone);
            }
        }

        Product saved = productRepository.save(product);
        return toDetailDto(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Товар с id " + id + " не найден"));
        productRepository.delete(product);
    }

    @Transactional
    public ProductDetailDto updateVisibility(Long id, boolean isVisible) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Товар с id " + id + " не найден"));
        product.setIsVisible(isVisible);
        Product saved = productRepository.save(product);
        return toDetailDto(saved);
    }

    private ProductSummaryDto toSummaryDto(Product product) {
        String mainImageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                ? product.getImages().get(0).getUrl()
                : null;

        List<String> imageUrls = (product.getImages() != null)
                ? product.getImages().stream().map(ProductImage::getUrl).toList()
                : Collections.emptyList();

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
                .imageUrls(imageUrls)
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

    private List<Map<String, Object>> toCharacteristicsMapList(List<CharacteristicEntryDto> dtos) {
        if (dtos == null) {
            return new ArrayList<>();
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (CharacteristicEntryDto dto : dtos) {
            if (dto != null && dto.getName() != null) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("name", dto.getName());
                map.put("value", dto.getValue() != null ? dto.getValue() : "");
                list.add(map);
            }
        }
        return list;
    }
}
