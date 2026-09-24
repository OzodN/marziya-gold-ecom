package com.marziyagold.service;

import com.marziyagold.dto.InquiryCreateRequest;
import com.marziyagold.dto.InquiryItemRequest;
import com.marziyagold.dto.InquiryResponseDto;
import com.marziyagold.entity.Inquiry;
import com.marziyagold.entity.InquiryStatus;
import com.marziyagold.entity.Product;
import com.marziyagold.entity.ProductImage;
import com.marziyagold.entity.ProductStone;
import com.marziyagold.entity.StoneType;
import com.marziyagold.exception.RateLimitExceededException;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.InquiryRepository;
import com.marziyagold.repository.ProductRepository;
import com.marziyagold.security.RateLimitingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InquiryServiceTest {

    @Mock
    private InquiryRepository inquiryRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RateLimitingService rateLimitingService;

    @InjectMocks
    private InquiryService inquiryService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
                .id(1L)
                .sku("MG-R-001")
                .name("Кольцо Сияние Востока")
                .isVisible(true)
                .characteristics(List.of(Map.of("name", "Металл", "value", "Золото")))
                .images(new ArrayList<>())
                .stones(new ArrayList<>())
                .build();

        sampleProduct.getImages().add(ProductImage.builder()
                .id(10L)
                .url("https://example.com/ring.jpg")
                .sortOrder(0)
                .build());

        StoneType stoneType = StoneType.builder().id(2L).name("Бриллиант").build();
        sampleProduct.getStones().add(ProductStone.builder()
                .id(20L)
                .stoneType(stoneType)
                .sortOrder(0)
                .characteristics(List.of(Map.of("name", "Вес", "value", "0.5ct")))
                .build());
    }

    @Test
    @DisplayName("Should create inquiry with immutable product snapshot and initial NEW status history")
    void shouldCreateInquirySuccessfully() {
        when(rateLimitingService.tryConsume("192.168.1.1")).thenReturn(true);
        when(productRepository.findByIdIn(List.of(1L))).thenReturn(List.of(sampleProduct));
        when(inquiryRepository.save(any(Inquiry.class))).thenAnswer(invocation -> {
            Inquiry saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        InquiryCreateRequest request = InquiryCreateRequest.builder()
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .comment("Интересует размер 17.5")
                .items(List.of(InquiryItemRequest.builder().productId(1L).quantity(2).build()))
                .build();

        InquiryResponseDto response = inquiryService.createInquiry(request, "192.168.1.1");

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getClientName()).isEqualTo("Азиз");
        assertThat(response.getStatus()).isEqualTo("NEW");
        assertThat(response.getMessage()).contains("Запрос на изготовление успешно отправлен");

        ArgumentCaptor<Inquiry> captor = ArgumentCaptor.forClass(Inquiry.class);
        verify(inquiryRepository).save(captor.capture());
        Inquiry captured = captor.getValue();

        assertThat(captured.getStatus()).isEqualTo(InquiryStatus.NEW);
        assertThat(captured.getItems()).hasSize(1);
        assertThat(captured.getItems().get(0).getQuantity()).isEqualTo(2);

        Map<String, Object> snapshot = captured.getItems().get(0).getProductSnapshot();
        assertThat(snapshot).isNotNull();
        assertThat(snapshot.get("productId")).isEqualTo(1L);
        assertThat(snapshot.get("sku")).isEqualTo("MG-R-001");
        assertThat(snapshot.get("name")).isEqualTo("Кольцо Сияние Востока");
        assertThat(snapshot.get("mainImageUrl")).isEqualTo("https://example.com/ring.jpg");

        assertThat(captured.getStatusHistories()).hasSize(1);
        assertThat(captured.getStatusHistories().get(0).getOldStatus()).isNull();
        assertThat(captured.getStatusHistories().get(0).getNewStatus()).isEqualTo(InquiryStatus.NEW);
        assertThat(captured.getStatusHistories().get(0).getChangedBy()).isEqualTo("CLIENT");
    }

    @Test
    @DisplayName("Should throw RateLimitExceededException when rate limiter rejects")
    void shouldThrowRateLimitExceeded() {
        when(rateLimitingService.tryConsume("192.168.1.1")).thenReturn(false);

        InquiryCreateRequest request = InquiryCreateRequest.builder()
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .items(List.of(InquiryItemRequest.builder().productId(1L).quantity(1).build()))
                .build();

        assertThatThrownBy(() -> inquiryService.createInquiry(request, "192.168.1.1"))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Превышен лимит запросов");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product from selection is not found")
    void shouldThrowWhenProductNotFound() {
        when(rateLimitingService.tryConsume(anyString())).thenReturn(true);
        when(productRepository.findByIdIn(List.of(999L))).thenReturn(List.of());

        InquiryCreateRequest request = InquiryCreateRequest.builder()
                .clientName("Азиз")
                .clientPhone("+998901234567")
                .items(List.of(InquiryItemRequest.builder().productId(999L).quantity(1).build()))
                .build();

        assertThatThrownBy(() -> inquiryService.createInquiry(request, "127.0.0.1"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("не найдено");
    }
}
