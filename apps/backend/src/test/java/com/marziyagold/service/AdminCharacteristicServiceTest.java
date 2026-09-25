package com.marziyagold.service;

import com.marziyagold.dto.CharacteristicKeyDto;
import com.marziyagold.dto.CharacteristicKeySaveRequest;
import com.marziyagold.entity.CharacteristicKey;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.CharacteristicKeyRepository;
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
class AdminCharacteristicServiceTest {

    @Mock
    private CharacteristicKeyRepository characteristicKeyRepository;

    @InjectMocks
    private AdminCharacteristicService adminCharacteristicService;

    private CharacteristicKey key1;
    private CharacteristicKey key2;

    @BeforeEach
    void setUp() {
        key1 = CharacteristicKey.builder()
                .id(1L)
                .name("Металл")
                .sortOrder(1)
                .isFilterable(true)
                .build();

        key2 = CharacteristicKey.builder()
                .id(2L)
                .name("Вес изделия")
                .sortOrder(2)
                .isFilterable(false)
                .build();
    }

    @Test
    @DisplayName("getAllCharacteristicKeys should return all keys ordered by sortOrder")
    void shouldReturnAllKeys() {
        when(characteristicKeyRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(key1, key2));

        List<CharacteristicKeyDto> result = adminCharacteristicService.getAllCharacteristicKeys();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Металл");
        assertThat(result.get(0).getIsFilterable()).isTrue();
        assertThat(result.get(1).getName()).isEqualTo("Вес изделия");
        assertThat(result.get(1).getIsFilterable()).isFalse();
    }

    @Test
    @DisplayName("createCharacteristicKey should create key successfully")
    void shouldCreateKeySuccessfully() {
        CharacteristicKeySaveRequest request = CharacteristicKeySaveRequest.builder()
                .name("Размер")
                .sortOrder(3)
                .isFilterable(true)
                .build();

        when(characteristicKeyRepository.existsByName("Размер")).thenReturn(false);
        when(characteristicKeyRepository.save(any(CharacteristicKey.class))).thenAnswer(invocation -> {
            CharacteristicKey entity = invocation.getArgument(0);
            entity.setId(3L);
            return entity;
        });

        CharacteristicKeyDto created = adminCharacteristicService.createCharacteristicKey(request);

        assertThat(created.getId()).isEqualTo(3L);
        assertThat(created.getName()).isEqualTo("Размер");
        assertThat(created.getSortOrder()).isEqualTo(3);
        assertThat(created.getIsFilterable()).isTrue();
    }

    @Test
    @DisplayName("createCharacteristicKey should throw IllegalArgumentException when duplicate name")
    void shouldThrowWhenDuplicateName() {
        CharacteristicKeySaveRequest request = CharacteristicKeySaveRequest.builder()
                .name("Металл")
                .build();

        when(characteristicKeyRepository.existsByName("Металл")).thenReturn(true);

        assertThatThrownBy(() -> adminCharacteristicService.createCharacteristicKey(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Металл");

        verify(characteristicKeyRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteCharacteristicKey should delete key successfully")
    void shouldDeleteKeySuccessfully() {
        when(characteristicKeyRepository.findById(1L)).thenReturn(Optional.of(key1));

        adminCharacteristicService.deleteCharacteristicKey(1L);

        verify(characteristicKeyRepository).delete(key1);
    }

    @Test
    @DisplayName("deleteCharacteristicKey should throw ResourceNotFoundException when key not found")
    void shouldThrowWhenKeyNotFound() {
        when(characteristicKeyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCharacteristicService.deleteCharacteristicKey(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(characteristicKeyRepository, never()).delete(any());
    }
}
