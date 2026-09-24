package com.marziyagold.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingServiceTest {

    private RateLimitingService rateLimitingService;

    @BeforeEach
    void setUp() {
        rateLimitingService = new RateLimitingService();
        ReflectionTestUtils.setField(rateLimitingService, "capacity", 3L);
        ReflectionTestUtils.setField(rateLimitingService, "refillTokens", 3L);
        ReflectionTestUtils.setField(rateLimitingService, "refillDurationMinutes", 1L);
    }

    @Test
    @DisplayName("Should allow requests within capacity and block when exhausted")
    void shouldEnforceRateLimit() {
        String ip = "192.168.1.100";

        // Consume up to capacity (3)
        assertThat(rateLimitingService.tryConsume(ip)).isTrue();
        assertThat(rateLimitingService.tryConsume(ip)).isTrue();
        assertThat(rateLimitingService.tryConsume(ip)).isTrue();

        // 4th request must be rejected
        assertThat(rateLimitingService.tryConsume(ip)).isFalse();

        // Another IP should still have its full tokens
        String anotherIp = "192.168.1.101";
        assertThat(rateLimitingService.tryConsume(anotherIp)).isTrue();
    }
}
