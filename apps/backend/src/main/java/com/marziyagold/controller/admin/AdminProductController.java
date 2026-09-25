package com.marziyagold.controller.admin;

import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductPageResponse;
import com.marziyagold.dto.ProductSaveRequest;
import com.marziyagold.dto.ProductSummaryDto;
import com.marziyagold.dto.ProductVisibilityUpdateRequest;
import com.marziyagold.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<ProductPageResponse> getProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isVisible,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProductSummaryDto> pageResult = adminProductService.getProducts(pageable, q, categoryId, isVisible);
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(pageResult.getTotalElements()))
                .header("X-Total-Pages", String.valueOf(pageResult.getTotalPages()))
                .header("X-Page-Number", String.valueOf(pageResult.getNumber()))
                .header("X-Page-Size", String.valueOf(pageResult.getSize()))
                .body(ProductPageResponse.from(pageResult));
    }

    @PostMapping
    public ResponseEntity<ProductDetailDto> createProduct(@Valid @RequestBody ProductSaveRequest request) {
        ProductDetailDto created = adminProductService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDto> getProductById(@PathVariable Long id) {
        ProductDetailDto product = adminProductService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductSaveRequest request
    ) {
        ProductDetailDto updated = adminProductService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<ProductDetailDto> updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody ProductVisibilityUpdateRequest request
    ) {
        ProductDetailDto updated = adminProductService.updateVisibility(id, request.getIsVisible());
        return ResponseEntity.ok(updated);
    }
}
