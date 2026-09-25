package com.marziyagold.service;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.entity.StoneType;
import com.marziyagold.repository.StoneTypeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StoneTypeServiceTest {

    @Mock
    private StoneTypeRepository stoneTypeRepository;

    @InjectMocks
    private StoneTypeService stoneTypeService;

    @Test
    @DisplayName("getActiveStoneTypes should return active stones mapped to Dto")
    void shouldReturnActiveStoneTypes() {
        StoneType s1 = StoneType.builder().id(1L).name("Бриллиант").isActive(true).build();
        StoneType s2 = StoneType.builder().id(2L).name("Рубин").isActive(true).build();

        when(stoneTypeRepository.findByIsActiveTrueOrderByIdAsc()).thenReturn(List.of(s1, s2));

        List<StoneTypeDto> result = stoneTypeService.getActiveStoneTypes();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Бриллиант");
        assertThat(result.get(1).getName()).isEqualTo("Рубин");
    }
}
