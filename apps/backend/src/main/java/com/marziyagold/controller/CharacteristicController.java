package com.marziyagold.controller;

import com.marziyagold.dto.FilterGroupDto;
import com.marziyagold.dto.FilterKeysDto;
import com.marziyagold.service.CharacteristicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/characteristics")
@RequiredArgsConstructor
public class CharacteristicController {

    private final CharacteristicService characteristicService;

    @GetMapping("/filter-keys")
    public ResponseEntity<List<FilterGroupDto>> getFilterKeys() {
        List<FilterGroupDto> response = characteristicService.getFilterGroups();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/keys")
    public ResponseEntity<FilterKeysDto> getDetailedKeys() {
        FilterKeysDto response = characteristicService.getFilterKeys();
        return ResponseEntity.ok(response);
    }
}
