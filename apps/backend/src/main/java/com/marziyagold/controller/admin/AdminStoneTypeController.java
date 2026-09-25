package com.marziyagold.controller.admin;

import com.marziyagold.dto.StoneTypeDto;
import com.marziyagold.dto.StoneTypeSaveRequest;
import com.marziyagold.service.AdminStoneTypeService;
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
@RequestMapping("/api/v1/admin/stone-types")
@RequiredArgsConstructor
public class AdminStoneTypeController {

    private final AdminStoneTypeService adminStoneTypeService;

    @GetMapping
    public ResponseEntity<List<StoneTypeDto>> getAllStoneTypes() {
        List<StoneTypeDto> stoneTypes = adminStoneTypeService.getAllStoneTypes();
        return ResponseEntity.ok(stoneTypes);
    }

    @PostMapping
    public ResponseEntity<StoneTypeDto> createStoneType(@Valid @RequestBody StoneTypeSaveRequest request) {
        StoneTypeDto created = adminStoneTypeService.createStoneType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStoneType(@PathVariable Long id) {
        adminStoneTypeService.deleteStoneType(id);
        return ResponseEntity.noContent().build();
    }
}
