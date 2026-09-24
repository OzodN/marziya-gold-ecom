package com.marziyagold.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "testSecretKeyMustBeAtLeast32BytesLongForHmacSha256TestingPurposes!";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", expirationMs);
        tokenProvider.init();
    }

    @Test
    @DisplayName("Should generate valid JWT token with username and role")
    void shouldGenerateAndValidateToken() {
        String token = tokenProvider.generateToken("admin", "ADMIN");

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.extractUsername(token)).isEqualTo("admin");
        assertThat(tokenProvider.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Should reject invalid or malformed JWT token")
    void shouldRejectInvalidToken() {
        assertThat(tokenProvider.validateToken("invalid.token.here")).isFalse();
        assertThat(tokenProvider.validateToken("")).isFalse();
        assertThat(tokenProvider.validateToken(null)).isFalse();
    }
}
