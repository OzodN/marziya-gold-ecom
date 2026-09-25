package com.marziyagold.service;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.dto.StoneTypeSaveRequest;
import com.marziyagold.entity.StoneType;
import com.marziyagold.exception.ResourceNotFoundException;
import com.marziyagold.repository.ProductStoneRepository;
import com.marziyagold.repository.StoneTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStoneTypeService {

    private final StoneTypeRepository stoneTypeRepository;
    private final ProductStoneRepository productStoneRepository;

    public List<StoneTypeDto> getAllStoneTypes() {
        return stoneTypeRepository.findAllByOrderByIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public StoneTypeDto createStoneType(StoneTypeSaveRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (stoneTypeRepository.existsByName(name)) {
            throw new IllegalArgumentException("Тип камня с названием '" + name + "' уже существует");
        }

        StoneType stoneType = StoneType.builder()
                .name(name)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        StoneType saved = stoneTypeRepository.save(stoneType);
        log.info("Admin created stone type id={}, name={}", saved.getId(), saved.getName());
        return toDto(saved);
    }

    @Transactional
    public void deleteStoneType(Long id) {
        StoneType stoneType = stoneTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тип камня с id " + id + " не найден"));

        if (productStoneRepository.existsByStoneTypeId(id)) {
            throw new IllegalStateException("Невозможно удалить тип камня, который используется в изделиях");
        }

        stoneTypeRepository.delete(stoneType);
        log.info("Admin deleted stone type id={}", id);
    }

    private StoneTypeDto toDto(StoneType entity) {
        return StoneTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .isActive(entity.getIsActive())
                .build();
    }
}
