package com.marziyagold.service;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.entity.StoneType;
import com.marziyagold.repository.StoneTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoneTypeService {

    private final StoneTypeRepository stoneTypeRepository;

    public List<StoneTypeDto> getActiveStoneTypes() {
        return stoneTypeRepository.findByIsActiveTrueOrderByIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    private StoneTypeDto toDto(StoneType entity) {
        return StoneTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .isActive(entity.getIsActive())
                .build();
    }
}
