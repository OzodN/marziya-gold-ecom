package com.marziyagold.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class R2ConfigTest {

    private R2Config r2Config;

    @BeforeEach
    void setUp() {
        r2Config = new R2Config();
        ReflectionTestUtils.setField(r2Config, "endpoint", "https://example.r2.cloudflarestorage.com");
        ReflectionTestUtils.setField(r2Config, "accessKeyId", "test-key");
        ReflectionTestUtils.setField(r2Config, "secretAccessKey", "test-secret");
        ReflectionTestUtils.setField(r2Config, "region", "auto");
    }

    @Test
    @DisplayName("s3Client bean is successfully created")
    void s3ClientBeanCreation() {
        S3Client s3Client = r2Config.s3Client();
        assertNotNull(s3Client);
        s3Client.close();
    }

    @Test
    @DisplayName("s3Presigner bean is successfully created")
    void s3PresignerBeanCreation() {
        S3Presigner s3Presigner = r2Config.s3Presigner();
        assertNotNull(s3Presigner);
        s3Presigner.close();
    }
}
