package com.marziyagold.service;

import com.marziyagold.dto.InquiryCreateRequest;
import com.marziyagold.dto.InquiryItemRequest;
import com.marziyagold.dto.InquiryResponseDto;
import com.marziyagold.entity.Inquiry;
import com.marziyagold.entity.InquiryItem;
import com.marziyagold.entity.InquiryStatus;
import com.marziyagold.entity.InquiryStatusHistory;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.ProductStone;
import com.marziyagold.exception.RateLimitExceededException;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.InquiryRepository;
import com.marziyagold.repository.ProductRepository;
import com.marziyagold.security.RateLimitingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final ProductRepository productRepository;
    private final RateLimitingService rateLimitingService;

    @Transactional
    public InquiryResponseDto createInquiry(InquiryCreateRequest request, String clientIp) {
        if (!rateLimitingService.tryConsume(clientIp)) {
            throw new RateLimitExceededException("Превышен лимит запросов. Пожалуйста, подождите перед повторной отправкой.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Подборка не может быть пустой");
        }

        List<Long> productIds = request.getItems().stream()
                .map(InquiryItemRequest::getProductId)
                .distinct()
                .toList();

        List<Product> products = productRepository.findByIdIn(productIds);
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity(), (p1, p2) -> p1));

        LocalDateTime now = LocalDateTime.now();

        Inquiry inquiry = Inquiry.builder()
                .clientName(request.getClientName().trim())
                .clientPhone(request.getClientPhone().trim())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .status(InquiryStatus.NEW)
                .createdAt(now)
                .updatedAt(now)
                .items(new ArrayList<>())
                .statusHistories(new ArrayList<>())
                .build();

        for (InquiryItemRequest itemReq : request.getItems()) {
            Product product = productMap.get(itemReq.getProductId());
            if (product == null) {
                throw new ResourceNotFoundException("Изделие с ID " + itemReq.getProductId() + " не найдено в каталоге");
            }

            Map<String, Object> snapshot = buildProductSnapshot(product);

            InquiryItem inquiryItem = InquiryItem.builder()
                    .inquiry(inquiry)
                    .product(product)
                    .quantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1)
                    .productSnapshot(snapshot)
                    .build();

            inquiry.getItems().add(inquiryItem);
        }

        InquiryStatusHistory initialHistory = InquiryStatusHistory.builder()
                .inquiry(inquiry)
                .oldStatus(null)
                .newStatus(InquiryStatus.NEW)
                .changedBy("CLIENT")
                .changedAt(now)
                .build();

        inquiry.getStatusHistories().add(initialHistory);

        Inquiry savedInquiry = inquiryRepository.save(inquiry);

        return InquiryResponseDto.builder()
                .id(savedInquiry.getId())
                .clientName(savedInquiry.getClientName())
                .status(savedInquiry.getStatus().name())
                .message("Запрос на изготовление успешно отправлен. Мастер свяжется с вами.")
                .createdAt(savedInquiry.getCreatedAt())
                .build();
    }

    private Map<String, Object> buildProductSnapshot(Product product) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("productId", product.getId());
        snapshot.put("sku", product.getSku());
        snapshot.put("name", product.getName());

        String mainImageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                ? product.getImages().get(0).getUrl()
                : null;
        snapshot.put("mainImageUrl", mainImageUrl);

        snapshot.put("characteristics", product.getCharacteristics() != null
                ? product.getCharacteristics()
                : List.of());

        List<Map<String, Object>> stoneSnapshots = new ArrayList<>();
        if (product.getStones() != null) {
            for (ProductStone stone : product.getStones()) {
                Map<String, Object> stoneMap = new LinkedHashMap<>();
                stoneMap.put("stoneTypeName", stone.getStoneType() != null ? stone.getStoneType().getName() : null);
                stoneMap.put("characteristics", stone.getCharacteristics() != null ? stone.getCharacteristics() : List.of());
                stoneSnapshots.add(stoneMap);
            }
        }
        snapshot.put("stones", stoneSnapshots);

        return snapshot;
    }
}
