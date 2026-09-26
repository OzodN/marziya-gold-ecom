package com.marziyagold.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigCorsTest {

    private SecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        JwtAuthenticationFilter jwtAuthenticationFilter = mock(JwtAuthenticationFilter.class);
        securityConfig = new SecurityConfig(jwtAuthenticationFilter);
        securityConfig.setAllowedOrigins("http://localhost:3000");
    }

    @Test
    @DisplayName("CORS configuration should allow localhost on any port")
    void shouldAllowLocalhostAnyPort() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/admin/auth/login");
        CorsConfiguration config = source.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowCredentials()).isTrue();

        assertThat(config.checkOrigin("http://localhost:3000")).isEqualTo("http://localhost:3000");
        assertThat(config.checkOrigin("http://localhost:3001")).isEqualTo("http://localhost:3001");
        assertThat(config.checkOrigin("http://localhost:8080")).isEqualTo("http://localhost:8080");
    }

    @Test
    @DisplayName("CORS configuration should allow 127.0.0.1 on any port")
    void shouldAllow127001AnyPort() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/admin/auth/login");
        CorsConfiguration config = source.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.checkOrigin("http://127.0.0.1:3000")).isEqualTo("http://127.0.0.1:3000");
        assertThat(config.checkOrigin("http://127.0.0.1:3001")).isEqualTo("http://127.0.0.1:3001");
    }

    @Test
    @DisplayName("CORS configuration should reject untrusted origins when specific origins configured")
    void shouldRejectUntrustedOrigins() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/admin/auth/login");
        CorsConfiguration config = source.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.checkOrigin("http://malicious-site.com")).isNull();
        assertThat(config.checkOrigin("http://fake-localhost.com")).isNull();
    }

    @Test
    @DisplayName("CORS configuration should allow any origin including ngrok tunnels when configured with *")
    void shouldAllowAnyOriginWithWildcard() {
        securityConfig.setAllowedOrigins("*");
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/admin/auth/login");
        CorsConfiguration config = source.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowCredentials()).isTrue();
        assertThat(config.checkOrigin("https://abc123-ngrok-free.app")).isEqualTo("https://abc123-ngrok-free.app");
        assertThat(config.checkOrigin("https://tunnel.ngrok.io")).isEqualTo("https://tunnel.ngrok.io");
        assertThat(config.checkOrigin("http://192.168.1.50:3000")).isEqualTo("http://192.168.1.50:3000");
    }
}
