package com.marziyagold.service;

import com.marziyagold.dto.MediaUploadResponse;
import com.marziyagold.dto.PresignedUploadRequest;
import com.marziyagold.dto.PresignedUploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class MediaStorageService {

    public static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "video/mp4"
    );

    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final String bucket;
    private final String publicUrl;
    private final long ttlMinutes;

    public MediaStorageService(
            S3Presigner s3Presigner,
            S3Client s3Client,
            @Value("${app.r2.bucket:${application.r2.bucket:marziya-media}}") String bucket,
            @Value("${app.r2.public-url:${NEXT_PUBLIC_MEDIA_URL:https://media.marziyagold.uz}}") String publicUrl,
            @Value("${app.r2.presign-ttl-minutes:15}") long ttlMinutes
    ) {
        this.s3Presigner = s3Presigner;
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.publicUrl = publicUrl;
        this.ttlMinutes = ttlMinutes;
    }

    public PresignedUploadResponse generatePresignedUploadUrl(PresignedUploadRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Presigned upload request cannot be null");
        }
        if (request.getFileName() == null || request.getFileName().isBlank()) {
            throw new IllegalArgumentException("File name is required");
        }
        if (request.getContentType() == null || request.getContentType().isBlank()) {
            throw new IllegalArgumentException("Content type is required");
        }

        String normalizedContentType = request.getContentType().trim().toLowerCase();
        if (!ALLOWED_CONTENT_TYPES.contains(normalizedContentType)) {
            throw new IllegalArgumentException("Unsupported content type: " + request.getContentType() +
                    ". Allowed types: " + String.join(", ", ALLOWED_CONTENT_TYPES));
        }

        String extension = extractExtension(request.getFileName(), normalizedContentType);
        String objectKey = "products/" + UUID.randomUUID() + "." + extension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(normalizedContentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(ttlMinutes))
                .putObjectRequest(putObjectRequest)
                .build();

        try {
            PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);
            String uploadUrl = presignedPutObjectRequest.url().toString();

            String basePublicUrl = publicUrl.replaceAll("/+$", "");
            String fullPublicUrl = basePublicUrl + "/" + objectKey;

            return PresignedUploadResponse.builder()
                    .uploadUrl(uploadUrl)
                    .objectKey(objectKey)
                    .publicUrl(fullPublicUrl)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate presigned upload URL", e);
            throw new RuntimeException("Failed to generate presigned upload URL: " + e.getMessage(), e);
        }
    }

    public MediaUploadResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.trim().toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Allowed: " + String.join(", ", ALLOWED_CONTENT_TYPES));
        }

        String normalizedContentType = contentType.trim().toLowerCase();
        String extension = extractExtension(file.getOriginalFilename(), normalizedContentType);
        String objectKey = "products/" + UUID.randomUUID() + "." + extension;

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(normalizedContentType)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String basePublicUrl = publicUrl.replaceAll("/+$", "");
            return MediaUploadResponse.builder()
                    .url(basePublicUrl + "/" + objectKey)
                    .publicId(objectKey)
                    .build();
        } catch (Exception e) {
            log.error("Failed to upload file to storage", e);
            throw new RuntimeException("Failed to upload file to storage: " + e.getMessage(), e);
        }
    }

    private String extractExtension(String fileName, String contentType) {
        if (fileName != null && fileName.contains(".")) {
            String ext = fileName.substring(fileName.lastIndexOf('.') + 1).trim().toLowerCase();
            if (!ext.isEmpty() && ext.matches("^[a-z0-9]+$")) {
                return ext;
            }
        }
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/avif" -> "avif";
            case "video/mp4" -> "mp4";
            default -> "bin";
        };
    }
}
