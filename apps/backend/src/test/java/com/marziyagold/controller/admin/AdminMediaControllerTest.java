package com.marziyagold.controller.admin;

import com.marziyagold.dto.MediaUploadResponse;
import com.marziyagold.exception.GlobalExceptionHandler;
import com.marziyagold.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminMediaControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AdminMediaController adminMediaController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminMediaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void uploadMedia_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "test image content".getBytes()
        );

        MediaUploadResponse response = MediaUploadResponse.builder()
                .url("https://res.cloudinary.com/test/image/upload/v12345/test-folder/test.jpg")
                .publicId("test-folder/test")
                .build();

        when(cloudinaryService.upload(any())).thenReturn(response);

        mockMvc.perform(multipart("/api/v1/admin/media/upload")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(response.getUrl()))
                .andExpect(jsonPath("$.publicId").value(response.getPublicId()));
    }
}

