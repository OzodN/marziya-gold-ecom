package com.marziyagold.controller.admin;

import com.marziyagold.dto.CharacteristicKeyDto;
import com.marziyagold.dto.CharacteristicKeySaveRequest;
import com.marziyagold.service.AdminCharacteristicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/characteristic-keys")
@RequiredArgsConstructor
public class AdminCharacteristicKeyController {

    private final AdminCharacteristicService adminCharacteristicService;

    @GetMapping
    public ResponseEntity<List<CharacteristicKeyDto>> getAllKeys() {
        List<CharacteristicKeyDto> keys = adminCharacteristicService.getAllCharacteristicKeys();
        return ResponseEntity.ok(keys);
    }

    @PostMapping
    public ResponseEntity<CharacteristicKeyDto> createKey(@Valid @RequestBody CharacteristicKeySaveRequest request) {
        CharacteristicKeyDto created = adminCharacteristicService.createCharacteristicKey(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKey(@PathVariable Long id) {
        adminCharacteristicService.deleteCharacteristicKey(id);
        return ResponseEntity.noContent().build();
    }
}
