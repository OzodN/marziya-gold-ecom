package com.marziyagold.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SlugUtilsTest {

    @Test
    @DisplayName("Should transliterate Cyrillic string to clean slug")
    void shouldTransliterateCyrillic() {
        String input = "Кольцо «Сияние Востока» с бриллиантом";
        String slug = SlugUtils.toSlug(input);
        assertThat(slug).isEqualTo("koltso-siyanie-vostoka-s-brilliantom");
    }

    @Test
    @DisplayName("Should handle Latin string and strip invalid characters")
    void shouldHandleLatin() {
        String input = "Gold Ring #585 (Special Edition)!";
        String slug = SlugUtils.toSlug(input);
        assertThat(slug).isEqualTo("gold-ring-585-special-edition");
    }

    @Test
    @DisplayName("Should return empty string for null or blank input")
    void shouldHandleNullOrBlank() {
        assertThat(SlugUtils.toSlug(null)).isEmpty();
        assertThat(SlugUtils.toSlug("")).isEmpty();
        assertThat(SlugUtils.toSlug("   ")).isEmpty();
    }
}
