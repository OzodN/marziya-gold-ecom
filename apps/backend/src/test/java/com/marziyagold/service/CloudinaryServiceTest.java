package com.marziyagold.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.marziyagold.dto.MediaUploadResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceTest {

    private CloudinaryService cloudinaryService;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @BeforeEach
    void setUp() throws Exception {
        cloudinaryService = new CloudinaryService("test-cloud", "test-key", "test-secret", "test-folder");
        
        // Inject mock Cloudinary via reflection since it's instantiated in the constructor
        Field cloudinaryField = CloudinaryService.class.getDeclaredField("cloudinary");
        cloudinaryField.setAccessible(true);
        cloudinaryField.set(cloudinaryService, cloudinary);
    }

    @Test
    void upload_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "test image content".getBytes()
        );

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap()))
                .thenReturn(Map.of(
                        "secure_url", "https://res.cloudinary.com/test/image/upload/v12345/test-folder/test.jpg",
                        "public_id", "test-folder/test"
                ));

        MediaUploadResponse response = cloudinaryService.upload(file);

        assertNotNull(response);
        assertEquals("https://res.cloudinary.com/test/image/upload/v12345/test-folder/test.jpg", response.getUrl());
        assertEquals("test-folder/test", response.getPublicId());
        
        verify(cloudinary, times(1)).uploader();
        verify(uploader, times(1)).upload(any(byte[].class), anyMap());
    }

    @Test
    void upload_EmptyFile_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[0]
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> cloudinaryService.upload(file)
        );
        assertEquals("Cannot upload empty file", exception.getMessage());
    }

    @Test
    void upload_FileTooLarge_ThrowsException() {
        byte[] largeContent = new byte[10 * 1024 * 1024 + 1]; // 10MB + 1 byte
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.jpg", "image/jpeg", largeContent
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> cloudinaryService.upload(file)
        );
        assertEquals("File size exceeds 10MB limit", exception.getMessage());
    }

    @Test
    void upload_InvalidType_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "test content".getBytes()
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> cloudinaryService.upload(file)
        );
        assertEquals("Invalid file type. Only JPEG, PNG, and WebP are allowed", exception.getMessage());
    }
    
    @Test
    void upload_CloudinaryError_ThrowsException() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "test image content".getBytes()
        );

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenThrow(new IOException("Cloudinary error"));

        RuntimeException exception = assertThrows(
                RuntimeException.class, () -> cloudinaryService.upload(file)
        );
        assertEquals("Failed to upload image to Cloudinary", exception.getMessage());
    }
}
