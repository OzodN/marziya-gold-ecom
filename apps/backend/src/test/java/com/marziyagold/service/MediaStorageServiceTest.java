package com.marziyagold.service;

import com.marziyagold.dto.MediaUploadResponse;
import com.marziyagold.dto.PresignedUploadRequest;
import com.marziyagold.dto.PresignedUploadResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MediaStorageServiceTest {

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private S3Client s3Client;

    private MediaStorageService mediaStorageService;

    private static final String BUCKET = "test-bucket";
    private static final String PUBLIC_URL = "https://media.marziyagold.uz";
    private static final long TTL_MINUTES = 15;

    @BeforeEach
    void setUp() {
        mediaStorageService = new MediaStorageService(
                s3Presigner,
                s3Client,
                BUCKET,
                PUBLIC_URL,
                TTL_MINUTES
        );
    }

    @Test
    @DisplayName("generatePresignedUploadUrl successfully generates presigned PUT URL for JPEG")
    void generatePresignedUploadUrl_Success_Jpeg() throws Exception {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName("ring-photo.jpg")
                .contentType("image/jpeg")
                .build();

        PresignedPutObjectRequest presignedPutObjectRequest = mock(PresignedPutObjectRequest.class);
        String dummyPresignedUrl = "https://test-bucket.r2.cloudflarestorage.com/products/mock-key.jpg?X-Amz-Signature=test";
        when(presignedPutObjectRequest.url()).thenReturn(URI.create(dummyPresignedUrl).toURL());
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedPutObjectRequest);

        PresignedUploadResponse response = mediaStorageService.generatePresignedUploadUrl(request);

        assertNotNull(response);
        assertEquals(dummyPresignedUrl, response.getUploadUrl());
        assertTrue(response.getObjectKey().startsWith("products/"));
        assertTrue(response.getObjectKey().endsWith(".jpg"));
        assertEquals("https://media.marziyagold.uz/" + response.getObjectKey(), response.getPublicUrl());

        ArgumentCaptor<PutObjectPresignRequest> captor = ArgumentCaptor.forClass(PutObjectPresignRequest.class);
        verify(s3Presigner, times(1)).presignPutObject(captor.capture());
        PutObjectPresignRequest captured = captor.getValue();

        assertEquals(Duration.ofMinutes(15), captured.signatureDuration());
        assertEquals(BUCKET, captured.putObjectRequest().bucket());
        assertEquals(response.getObjectKey(), captured.putObjectRequest().key());
        assertEquals("image/jpeg", captured.putObjectRequest().contentType());
    }

    @ParameterizedTest(name = "MIME: {0}, File: {1} -> Ext: {2}")
    @CsvSource({
            "image/png, necklace.png, png",
            "image/webp, earrings.webp, webp",
            "image/avif, bracelet.avif, avif",
            "video/mp4, showreel.mp4, mp4",
            "image/jpeg, no-extension, jpg"
    })
    @DisplayName("generatePresignedUploadUrl supports all allowed content types")
    void generatePresignedUploadUrl_AllowedTypes(String contentType, String fileName, String expectedExtension) throws Exception {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName(fileName)
                .contentType(contentType)
                .build();

        PresignedPutObjectRequest presignedPutObjectRequest = mock(PresignedPutObjectRequest.class);
        when(presignedPutObjectRequest.url()).thenReturn(URI.create("https://r2.test/upload").toURL());
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedPutObjectRequest);

        PresignedUploadResponse response = mediaStorageService.generatePresignedUploadUrl(request);

        assertNotNull(response);
        assertTrue(response.getObjectKey().startsWith("products/"));
        assertTrue(response.getObjectKey().endsWith("." + expectedExtension));
    }

    @Test
    @DisplayName("generatePresignedUploadUrl throws exception on unsupported content type")
    void generatePresignedUploadUrl_UnsupportedContentType() {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName("doc.pdf")
                .contentType("application/pdf")
                .build();

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> mediaStorageService.generatePresignedUploadUrl(request)
        );
        assertTrue(ex.getMessage().contains("Unsupported content type"));
    }

    @Test
    @DisplayName("generatePresignedUploadUrl throws exception on null or blank request fields")
    void generatePresignedUploadUrl_NullOrBlankFields() {
        assertThrows(IllegalArgumentException.class, () -> mediaStorageService.generatePresignedUploadUrl(null));

        PresignedUploadRequest blankFileName = PresignedUploadRequest.builder()
                .fileName("")
                .contentType("image/jpeg")
                .build();
        assertThrows(IllegalArgumentException.class, () -> mediaStorageService.generatePresignedUploadUrl(blankFileName));

        PresignedUploadRequest blankContentType = PresignedUploadRequest.builder()
                .fileName("photo.jpg")
                .contentType("  ")
                .build();
        assertThrows(IllegalArgumentException.class, () -> mediaStorageService.generatePresignedUploadUrl(blankContentType));
    }

    @Test
    @DisplayName("upload directly uploads multipart file via S3Client")
    void upload_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "earring.png", "image/png", "sample bytes".getBytes()
        );

        MediaUploadResponse response = mediaStorageService.upload(file);

        assertNotNull(response);
        assertTrue(response.getPublicId().startsWith("products/"));
        assertTrue(response.getPublicId().endsWith(".png"));
        assertEquals("https://media.marziyagold.uz/" + response.getPublicId(), response.getUrl());

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client, times(1)).putObject(requestCaptor.capture(), any(RequestBody.class));
        assertEquals(BUCKET, requestCaptor.getValue().bucket());
        assertEquals("image/png", requestCaptor.getValue().contentType());
    }

    @Test
    @DisplayName("upload throws exception on empty file")
    void upload_EmptyFile_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> mediaStorageService.upload(file)
        );
        assertEquals("Cannot upload empty file", ex.getMessage());
    }

    @Test
    @DisplayName("upload throws exception when file exceeds 10MB limit")
    void upload_FileTooLarge_ThrowsException() {
        byte[] largeBytes = new byte[10 * 1024 * 1024 + 1];
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.jpg", "image/jpeg", largeBytes
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> mediaStorageService.upload(file)
        );
        assertEquals("File size exceeds 10MB limit", ex.getMessage());
    }

    @Test
    @DisplayName("upload throws exception on invalid content type")
    void upload_InvalidContentType_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.gif", "image/gif", "gif data".getBytes()
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> mediaStorageService.upload(file)
        );
        assertTrue(ex.getMessage().contains("Invalid file type"));
    }

    @Test
    @DisplayName("upload wraps storage exception into RuntimeException")
    void upload_S3Error_ThrowsRuntimeException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "ring.jpg", "image/jpeg", "image bytes".getBytes()
        );

        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(S3Exception.builder().message("Access denied").build());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> mediaStorageService.upload(file)
        );
        assertTrue(ex.getMessage().contains("Failed to upload file to storage"));
    }
}
