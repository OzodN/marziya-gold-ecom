package com.marziyagold.service;

import com.marziyagold.dto.ContactSettingsDto;
import com.marziyagold.entity.SiteSetting;
import com.marziyagold.repository.SiteSettingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettingsServiceTest {

    @Mock
    private SiteSettingRepository siteSettingRepository;

    @InjectMocks
    private SettingsService settingsService;

    @Test
    @DisplayName("Should return contact settings populated from site settings")
    void shouldReturnContactSettings() {
        SiteSetting s1 = SiteSetting.builder().id(1L).key("contact_phone").value("+998 90 123 45 67").build();
        SiteSetting s2 = SiteSetting.builder().id(2L).key("contact_telegram").value("marziyagold").build();
        SiteSetting s3 = SiteSetting.builder().id(3L).key("master_name").value("Марзия").build();
        SiteSetting s4 = SiteSetting.builder().id(4L).key("about_text").value("Мастерская авторских изделий").build();

        when(siteSettingRepository.findAll()).thenReturn(List.of(s1, s2, s3, s4));

        ContactSettingsDto contacts = settingsService.getContactSettings();

        assertThat(contacts.getContactPhone()).isEqualTo("+998 90 123 45 67");
        assertThat(contacts.getPhoneNumber()).isEqualTo("+998 90 123 45 67");
        assertThat(contacts.getContactTelegram()).isEqualTo("marziyagold");
        assertThat(contacts.getTelegramUsername()).isEqualTo("marziyagold");
        assertThat(contacts.getMasterName()).isEqualTo("Марзия");
        assertThat(contacts.getAboutText()).isEqualTo("Мастерская авторских изделий");
        assertThat(contacts.getMasterBio()).isEqualTo("Мастерская авторских изделий");
    }
}
