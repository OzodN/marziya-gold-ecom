package com.marziyagold.controller;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.service.StoneTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stone-types")
@RequiredArgsConstructor
public class StoneTypeController {

    private final StoneTypeService stoneTypeService;

    @GetMapping
    public ResponseEntity<List<StoneTypeDto>> getStoneTypes() {
        List<StoneTypeDto> response = stoneTypeService.getActiveStoneTypes();
        return ResponseEntity.ok(response);
    }
}
