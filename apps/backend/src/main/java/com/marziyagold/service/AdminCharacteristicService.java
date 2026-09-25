package com.marziyagold.service;

import com.marziyagold.dto.CharacteristicKeyDto;
import com.marziyagold.dto.CharacteristicKeySaveRequest;
import com.marziyagold.entity.CharacteristicKey;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.CharacteristicKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCharacteristicService {

    private final CharacteristicKeyRepository characteristicKeyRepository;

    public List<CharacteristicKeyDto> getAllCharacteristicKeys() {
        return characteristicKeyRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CharacteristicKeyDto createCharacteristicKey(CharacteristicKeySaveRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (characteristicKeyRepository.existsByName(name)) {
            throw new IllegalArgumentException("Характеристика с названием '" + name + "' уже существует");
        }

        CharacteristicKey characteristicKey = CharacteristicKey.builder()
                .name(name)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isFilterable(request.getIsFilterable() != null ? request.getIsFilterable() : true)
                .build();

        CharacteristicKey saved = characteristicKeyRepository.save(characteristicKey);
        log.info("Admin created characteristic key id={}, name={}", saved.getId(), saved.getName());
        return toDto(saved);
    }

    @Transactional
    public void deleteCharacteristicKey(Long id) {
        CharacteristicKey characteristicKey = characteristicKeyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Характеристика с id " + id + " не найдена"));

        characteristicKeyRepository.delete(characteristicKey);
        log.info("Admin deleted characteristic key id={}", id);
    }

    private CharacteristicKeyDto toDto(CharacteristicKey entity) {
        return CharacteristicKeyDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .sortOrder(entity.getSortOrder())
                .isFilterable(entity.getIsFilterable())
                .build();
    }
}
