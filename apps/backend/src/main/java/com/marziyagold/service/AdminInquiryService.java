package com.marziyagold.service;

import com.marziyagold.dto.InquiryDetailDto;
import com.marziyagold.dto.InquiryItemDetailDto;
import com.marziyagold.dto.InquiryStatusHistoryDto;
import com.marziyagold.dto.InquirySummaryDto;
import com.marziyagold.dto.NewInquiriesCountDto;
import com.marziyagold.entity.Inquiry;
import com.marziyagold.entity.InquiryItem;
import com.marziyagold.entity.InquiryStatus;
import com.marziyagold.entity.InquiryStatusHistory;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.InquiryRepository;
import com.marziyagold.repository.InquiryStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminInquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryStatusHistoryRepository inquiryStatusHistoryRepository;

    public Page<InquirySummaryDto> getInquiries(Pageable pageable, InquiryStatus status) {
        Pageable effectivePageable = (pageable != null && pageable.isPaged())
                ? pageable
                : PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (effectivePageable.getSort().isUnsorted()) {
            effectivePageable = PageRequest.of(
                    effectivePageable.getPageNumber(),
                    effectivePageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        Page<Inquiry> pageResult = (status != null)
                ? inquiryRepository.findByStatusOrderByCreatedAtDesc(status, effectivePageable)
                : inquiryRepository.findAllByOrderByCreatedAtDesc(effectivePageable);

        return pageResult.map(this::toSummaryDto);
    }

    public InquiryDetailDto getInquiryById(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка с ID " + id + " не найдена"));

        return toDetailDto(inquiry);
    }

    @Transactional
    public InquiryDetailDto updateInquiryStatus(Long id, InquiryStatus newStatus, String adminUsername) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Новый статус обязателен");
        }

        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка с ID " + id + " не найдена"));

        InquiryStatus oldStatus = inquiry.getStatus();
        LocalDateTime now = LocalDateTime.now();

        inquiry.setStatus(newStatus);
        inquiry.setUpdatedAt(now);

        InquiryStatusHistory history = InquiryStatusHistory.builder()
                .inquiry(inquiry)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(adminUsername != null && !adminUsername.isBlank() ? adminUsername : "ADMIN")
                .changedAt(now)
                .build();

        inquiry.getStatusHistories().add(history);
        inquiryStatusHistoryRepository.save(history);
        Inquiry saved = inquiryRepository.save(inquiry);

        return toDetailDto(saved);
    }

    public NewInquiriesCountDto getNewInquiriesCount() {
        long count = inquiryRepository.countByStatus(InquiryStatus.NEW);
        return new NewInquiriesCountDto(count);
    }

    private InquirySummaryDto toSummaryDto(Inquiry inquiry) {
        int itemCount = 0;
        if (inquiry.getItems() != null) {
            itemCount = inquiry.getItems().stream()
                    .mapToInt(i -> i.getQuantity() != null ? i.getQuantity() : 1)
                    .sum();
        }

        return InquirySummaryDto.builder()
                .id(inquiry.getId())
                .clientName(inquiry.getClientName())
                .clientPhone(inquiry.getClientPhone())
                .itemCount(itemCount)
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .build();
    }

    private InquiryDetailDto toDetailDto(Inquiry inquiry) {
        List<InquiryItemDetailDto> itemDtos = new ArrayList<>();
        if (inquiry.getItems() != null) {
            for (InquiryItem item : inquiry.getItems()) {
                Long productId = item.getProduct() != null ? item.getProduct().getId() : null;
                if (productId == null && item.getProductSnapshot() != null && item.getProductSnapshot().get("productId") != null) {
                    try {
                        productId = Long.valueOf(item.getProductSnapshot().get("productId").toString());
                    } catch (NumberFormatException ignored) {
                        // ignore unparseable productId
                    }
                }
                itemDtos.add(InquiryItemDetailDto.builder()
                        .id(item.getId())
                        .productId(productId)
                        .quantity(item.getQuantity())
                        .productSnapshot(item.getProductSnapshot())
                        .build());
            }
        }

        List<InquiryStatusHistoryDto> historyDtos = new ArrayList<>();
        if (inquiry.getStatusHistories() != null) {
            for (InquiryStatusHistory history : inquiry.getStatusHistories()) {
                historyDtos.add(InquiryStatusHistoryDto.builder()
                        .id(history.getId())
                        .oldStatus(history.getOldStatus())
                        .newStatus(history.getNewStatus())
                        .changedBy(history.getChangedBy())
                        .changedAt(history.getChangedAt())
                        .build());
            }
        }

        return InquiryDetailDto.builder()
                .id(inquiry.getId())
                .clientName(inquiry.getClientName())
                .clientPhone(inquiry.getClientPhone())
                .comment(inquiry.getComment())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .items(itemDtos)
                .history(historyDtos)
                .build();
    }
}
