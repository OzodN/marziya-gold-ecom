package com.marziyagold.controller;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.service.StoneTypeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StoneTypeControllerTest {

    @Mock
    private StoneTypeService stoneTypeService;

    @InjectMocks
    private StoneTypeController stoneTypeController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(stoneTypeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/stone-types should return 200 with list of active stones")
    void shouldReturnActiveStoneTypes() throws Exception {
        List<StoneTypeDto> stoneTypes = List.of(
                StoneTypeDto.builder().id(1L).name("Бриллиант").isActive(true).build(),
                StoneTypeDto.builder().id(2L).name("Изумруд").isActive(true).build(),
                StoneTypeDto.builder().id(3L).name("Сапфир").isActive(true).build()
        );

        when(stoneTypeService.getActiveStoneTypes()).thenReturn(stoneTypes);

        mockMvc.perform(get("/api/v1/stone-types")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].name").value("Бриллиант"))
                .andExpect(jsonPath("$[1].name").value("Изумруд"))
                .andExpect(jsonPath("$[2].name").value("Сапфир"));
    }
}
