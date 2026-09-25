package com.marziyagold.service;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.dto.StoneTypeSaveRequest;
import com.marziyagold.entity.StoneType;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.ProductStoneRepository;
import com.marziyagold.repository.StoneTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminStoneTypeServiceTest {

    @Mock
    private StoneTypeRepository stoneTypeRepository;

    @Mock
    private ProductStoneRepository productStoneRepository;

    @InjectMocks
    private AdminStoneTypeService adminStoneTypeService;

    private StoneType diamond;
    private StoneType emerald;

    @BeforeEach
    void setUp() {
        diamond = StoneType.builder()
                .id(1L)
                .name("Бриллиант")
                .isActive(true)
                .build();

        emerald = StoneType.builder()
                .id(2L)
                .name("Изумруд")
                .isActive(false)
                .build();
    }

    @Test
    @DisplayName("getAllStoneTypes should return all stone types including inactive ones")
    void shouldReturnAllStoneTypes() {
        when(stoneTypeRepository.findAllByOrderByIdAsc()).thenReturn(List.of(diamond, emerald));

        List<StoneTypeDto> result = adminStoneTypeService.getAllStoneTypes();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Бриллиант");
        assertThat(result.get(0).getIsActive()).isTrue();
        assertThat(result.get(1).getName()).isEqualTo("Изумруд");
        assertThat(result.get(1).getIsActive()).isFalse();
    }

    @Test
    @DisplayName("createStoneType should create stone type successfully")
    void shouldCreateStoneType() {
        StoneTypeSaveRequest request = StoneTypeSaveRequest.builder()
                .name("Сапфир")
                .isActive(true)
                .build();

        when(stoneTypeRepository.existsByName("Сапфир")).thenReturn(false);
        when(stoneTypeRepository.save(any(StoneType.class))).thenAnswer(invocation -> {
            StoneType st = invocation.getArgument(0);
            st.setId(3L);
            return st;
        });

        StoneTypeDto created = adminStoneTypeService.createStoneType(request);

        assertThat(created.getId()).isEqualTo(3L);
        assertThat(created.getName()).isEqualTo("Сапфир");
        assertThat(created.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("createStoneType should throw IllegalArgumentException when duplicate name")
    void shouldThrowWhenDuplicateName() {
        StoneTypeSaveRequest request = StoneTypeSaveRequest.builder()
                .name("Бриллиант")
                .build();

        when(stoneTypeRepository.existsByName("Бриллиант")).thenReturn(true);

        assertThatThrownBy(() -> adminStoneTypeService.createStoneType(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Бриллиант");

        verify(stoneTypeRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteStoneType should delete stone type when not used in products")
    void shouldDeleteStoneTypeSuccessfully() {
        when(stoneTypeRepository.findById(1L)).thenReturn(Optional.of(diamond));
        when(productStoneRepository.existsByStoneTypeId(1L)).thenReturn(false);

        adminStoneTypeService.deleteStoneType(1L);

        verify(stoneTypeRepository).delete(diamond);
    }

    @Test
    @DisplayName("deleteStoneType should throw ResourceNotFoundException when not found")
    void shouldThrowWhenStoneTypeNotFound() {
        when(stoneTypeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminStoneTypeService.deleteStoneType(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(stoneTypeRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteStoneType should throw IllegalStateException when used in products")
    void shouldThrowWhenStoneTypeUsedInProducts() {
        when(stoneTypeRepository.findById(1L)).thenReturn(Optional.of(diamond));
        when(productStoneRepository.existsByStoneTypeId(1L)).thenReturn(true);

        assertThatThrownBy(() -> adminStoneTypeService.deleteStoneType(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("используется в изделиях");

        verify(stoneTypeRepository, never()).delete(any());
    }
}
