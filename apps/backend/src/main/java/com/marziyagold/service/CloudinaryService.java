package com.marziyagold.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.marziyagold.dto.MediaUploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final String uploadFolder;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp"
    );

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            @Value("${cloudinary.upload-folder}") String uploadFolder) {
            
        this.uploadFolder = uploadFolder;
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public MediaUploadResponse upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, and WebP are allowed");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", uploadFolder
            ));
            
            return MediaUploadResponse.builder()
                    .url(uploadResult.get("secure_url").toString())
                    .publicId(uploadResult.get("public_id").toString())
                    .build();
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }
}
