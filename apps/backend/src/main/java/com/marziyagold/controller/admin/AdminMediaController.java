package com.marziyagold.controller.admin;

import com.marziyagold.dto.MediaUploadResponse;
import com.marziyagold.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<MediaUploadResponse> uploadMedia(@RequestParam("file") MultipartFile file) {
        MediaUploadResponse response = cloudinaryService.upload(file);
        return ResponseEntity.ok(response);
    }
}
