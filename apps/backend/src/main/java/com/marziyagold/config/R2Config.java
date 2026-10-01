package com.marziyagold.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class R2Config {

    @Value("${app.r2.endpoint:${application.r2.endpoint:https://example.r2.cloudflarestorage.com}}")
    private String endpoint;

    @Value("${app.r2.access-key-id:${application.r2.access-key-id:test-key}}")
    private String accessKeyId;

    @Value("${app.r2.secret-access-key:${application.r2.secret-access-key:test-secret}}")
    private String secretAccessKey;

    @Value("${app.r2.region:${application.r2.region:auto}}")
    private String region;

    @Bean
    public S3Client s3Client() {
        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .serviceConfiguration(serviceConfiguration)
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .serviceConfiguration(serviceConfiguration)
                .build();
    }
}
