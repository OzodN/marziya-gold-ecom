package com.marziyagold.controller;

import com.marziyagold.dto.BatchValidationRequest;
import com.marziyagold.dto.ProductAvailabilityDto;
import com.marziyagold.dto.ProductDetailDto;
import com.marziyagold.dto.ProductPageResponse;
import com.marziyagold.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ProductPageResponse> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) Long stoneTypeId
    ) {
        ProductPageResponse response = productService.getProducts(page, size, q, categorySlug, stoneTypeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDetailDto> getProductBySlug(@PathVariable String slug) {
        ProductDetailDto response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-batch")
    public ResponseEntity<List<ProductAvailabilityDto>> validateBatch(
            @Valid @RequestBody BatchValidationRequest request
    ) {
        List<ProductAvailabilityDto> response = productService.validateBatch(request);
        return ResponseEntity.ok(response);
    }
}
