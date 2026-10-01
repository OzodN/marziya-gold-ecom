package com.marziyagold.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marziyagold.dto.MediaUploadResponse;
import com.marziyagold.dto.PresignedUploadRequest;
import com.marziyagold.dto.PresignedUploadResponse;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.service.MediaStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminMediaControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private MediaStorageService mediaStorageService;

    @InjectMocks
    private AdminMediaController adminMediaController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminMediaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("presignUpload succeeds with valid payload")
    void presignUpload_Success() throws Exception {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName("ring-closeup.jpg")
                .contentType("image/jpeg")
                .build();

        PresignedUploadResponse response = PresignedUploadResponse.builder()
                .uploadUrl("https://example.r2.cloudflarestorage.com/marziya-media/products/uuid.jpg?X-Amz-Signature=xxx")
                .objectKey("products/uuid.jpg")
                .publicUrl("https://media.marziyagold.uz/products/uuid.jpg")
                .build();

        when(mediaStorageService.generatePresignedUploadUrl(any(PresignedUploadRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/admin/media/presign-upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadUrl").value(response.getUploadUrl()))
                .andExpect(jsonPath("$.objectKey").value(response.getObjectKey()))
                .andExpect(jsonPath("$.publicUrl").value(response.getPublicUrl()));
    }

    @Test
    @DisplayName("presignUpload handles authenticated admin user in SecurityContext")
    void presignUpload_WithAuthenticatedAdmin() throws Exception {
        org.springframework.security.core.context.SecurityContext securityContext =
                org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                "admin", null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))
        ));
        org.springframework.security.core.context.SecurityContextHolder.setContext(securityContext);
        try {
            PresignedUploadRequest request = PresignedUploadRequest.builder()
                    .fileName("ring.jpg")
                    .contentType("image/jpeg")
                    .build();

            PresignedUploadResponse response = PresignedUploadResponse.builder()
                    .uploadUrl("https://example.r2.cloudflarestorage.com/marziya-media/products/uuid.jpg")
                    .objectKey("products/uuid.jpg")
                    .publicUrl("https://media.marziyagold.uz/products/uuid.jpg")
                    .build();

            when(mediaStorageService.generatePresignedUploadUrl(any(PresignedUploadRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/admin/media/presign-upload")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.uploadUrl").value(response.getUploadUrl()));
        } finally {
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
    }

    @Test
    @DisplayName("presignUpload returns 400 when fileName is blank")
    void presignUpload_BlankFileName_ReturnsBadRequest() throws Exception {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName("")
                .contentType("image/jpeg")
                .build();

        mockMvc.perform(post("/api/v1/admin/media/presign-upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.fileName").exists());
    }

    @Test
    @DisplayName("presignUpload returns 400 when contentType is blank")
    void presignUpload_BlankContentType_ReturnsBadRequest() throws Exception {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName("test.png")
                .contentType("")
                .build();

        mockMvc.perform(post("/api/v1/admin/media/presign-upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.contentType").exists());
    }

    @Test
    @DisplayName("presignUpload returns 400 when service throws IllegalArgumentException for unsupported MIME")
    void presignUpload_UnsupportedMime_ReturnsBadRequest() throws Exception {
        PresignedUploadRequest request = PresignedUploadRequest.builder()
                .fileName("doc.pdf")
                .contentType("application/pdf")
                .build();

        when(mediaStorageService.generatePresignedUploadUrl(any(PresignedUploadRequest.class)))
                .thenThrow(new IllegalArgumentException("Unsupported content type: application/pdf"));

        mockMvc.perform(post("/api/v1/admin/media/presign-upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported content type: application/pdf"));
    }

    @Test
    @DisplayName("uploadMedia succeeds with valid multipart file")
    void uploadMedia_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "test image content".getBytes()
        );

        MediaUploadResponse response = MediaUploadResponse.builder()
                .url("https://media.marziyagold.uz/products/uuid.jpg")
                .publicId("products/uuid.jpg")
                .build();

        when(mediaStorageService.upload(any())).thenReturn(response);

        mockMvc.perform(multipart("/api/v1/admin/media/upload")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(response.getUrl()))
                .andExpect(jsonPath("$.publicId").value(response.getPublicId()));
    }

    @Test
    @DisplayName("uploadMedia returns 400 when service throws IllegalArgumentException")
    void uploadMedia_EmptyFile_ReturnsBadRequest() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[0]
        );

        when(mediaStorageService.upload(any()))
                .thenThrow(new IllegalArgumentException("Cannot upload empty file"));

        mockMvc.perform(multipart("/api/v1/admin/media/upload")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot upload empty file"));
    }
}
