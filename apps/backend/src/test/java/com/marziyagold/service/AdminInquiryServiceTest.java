package com.marziyagold.service;

import com.marziyagold.dto.InquiryDetailDto;
import com.marziyagold.dto.InquirySummaryDto;
import com.marziyagold.dto.NewInquiriesCountDto;
import com.marziyagold.entity.Inquiry;
import com.marziyagold.entity.InquiryItem;
import com.marziyagold.entity.InquiryStatus;
import com.marziyagold.entity.InquiryStatusHistory;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.InquiryRepository;
import com.marziyagold.repository.InquiryStatusHistoryRepository;
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
class AdminInquiryServiceTest {

    @Mock
    private InquiryRepository inquiryRepository;

    @Mock
    private InquiryStatusHistoryRepository inquiryStatusHistoryRepository;

    @InjectMocks
    private AdminInquiryService adminInquiryService;

    private Inquiry sampleInquiry;

    @BeforeEach
    void setUp() {
        sampleInquiry = Inquiry.builder()
                .id(1L)
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .comment("Размер 17.5")
                .status(InquiryStatus.NEW)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .statusHistories(new ArrayList<>())
                .build();

        InquiryItem item = InquiryItem.builder()
                .id(10L)
                .inquiry(sampleInquiry)
                .quantity(2)
                .productSnapshot(Map.of("productId", 100L, "name", "Кольцо"))
                .build();
        sampleInquiry.getItems().add(item);

        InquiryStatusHistory history = InquiryStatusHistory.builder()
                .id(100L)
                .inquiry(sampleInquiry)
                .oldStatus(null)
                .newStatus(InquiryStatus.NEW)
                .changedBy("CLIENT")
                .changedAt(LocalDateTime.now())
                .build();
        sampleInquiry.getStatusHistories().add(history);
    }

    @Test
    @DisplayName("Should return paginated inquiries without status filter")
    void shouldReturnInquiriesWithoutFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Inquiry> inquiryPage = new PageImpl<>(List.of(sampleInquiry), pageable, 1);

        when(inquiryRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(inquiryPage);

        Page<InquirySummaryDto> result = adminInquiryService.getInquiries(pageable, null);

        assertThat(result.getContent()).hasSize(1);
        InquirySummaryDto dto = result.getContent().get(0);
        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getClientName()).isEqualTo("Азиз");
        assertThat(dto.getItemCount()).isEqualTo(2);
        assertThat(dto.getStatus()).isEqualTo(InquiryStatus.NEW);
    }

    @Test
    @DisplayName("Should return paginated inquiries with status filter")
    void shouldReturnInquiriesWithStatusFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Inquiry> inquiryPage = new PageImpl<>(List.of(sampleInquiry), pageable, 1);

        when(inquiryRepository.findByStatusOrderByCreatedAtDesc(eq(InquiryStatus.NEW), any(Pageable.class)))
                .thenReturn(inquiryPage);

        Page<InquirySummaryDto> result = adminInquiryService.getInquiries(pageable, InquiryStatus.NEW);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(InquiryStatus.NEW);
        verify(inquiryRepository).findByStatusOrderByCreatedAtDesc(eq(InquiryStatus.NEW), any(Pageable.class));
    }

    @Test
    @DisplayName("Should return detailed inquiry by ID with snapshot and history")
    void shouldReturnInquiryById() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(sampleInquiry));

        InquiryDetailDto detail = adminInquiryService.getInquiryById(1L);

        assertThat(detail).isNotNull();
        assertThat(detail.getId()).isEqualTo(1L);
        assertThat(detail.getClientName()).isEqualTo("Азиз");
        assertThat(detail.getItems()).hasSize(1);
        assertThat(detail.getItems().get(0).getQuantity()).isEqualTo(2);
        assertThat(detail.getItems().get(0).getProductSnapshot()).containsEntry("name", "Кольцо");
        assertThat(detail.getHistory()).hasSize(1);
        assertThat(detail.getHistory().get(0).getNewStatus()).isEqualTo(InquiryStatus.NEW);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when inquiry ID not found")
    void shouldThrowWhenInquiryNotFound() {
        when(inquiryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminInquiryService.getInquiryById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Заявка с ID 999 не найдена");
    }

    @Test
    @DisplayName("Should update inquiry status and record audit history")
    void shouldUpdateInquiryStatus() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(sampleInquiry));
        when(inquiryRepository.save(any(Inquiry.class))).thenAnswer(inv -> inv.getArgument(0));

        InquiryDetailDto updated = adminInquiryService.updateInquiryStatus(1L, InquiryStatus.CONTACTED, "admin_user");

        assertThat(updated.getStatus()).isEqualTo(InquiryStatus.CONTACTED);
        assertThat(updated.getHistory()).hasSize(2);

        ArgumentCaptor<InquiryStatusHistory> historyCaptor = ArgumentCaptor.forClass(InquiryStatusHistory.class);
        verify(inquiryStatusHistoryRepository).save(historyCaptor.capture());

        InquiryStatusHistory recordedHistory = historyCaptor.getValue();
        assertThat(recordedHistory.getOldStatus()).isEqualTo(InquiryStatus.NEW);
        assertThat(recordedHistory.getNewStatus()).isEqualTo(InquiryStatus.CONTACTED);
        assertThat(recordedHistory.getChangedBy()).isEqualTo("admin_user");
        assertThat(recordedHistory.getChangedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when new status is null")
    void shouldThrowWhenNewStatusIsNull() {
        assertThatThrownBy(() -> adminInquiryService.updateInquiryStatus(1L, null, "admin"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Новый статус обязателен");
    }

    @Test
    @DisplayName("Should return count of new inquiries for 30s polling")
    void shouldReturnNewInquiriesCount() {
        when(inquiryRepository.countByStatus(InquiryStatus.NEW)).thenReturn(7L);

        NewInquiriesCountDto countDto = adminInquiryService.getNewInquiriesCount();

        assertThat(countDto.getCount()).isEqualTo(7L);
        assertThat(countDto.getNewCount()).isEqualTo(7L);
    }
}
