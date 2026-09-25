package com.marziyagold.service;

import com.marziyagold.dto.ContactSettingsUpdateRequest;
import com.marziyagold.entity.SiteSetting;
import com.marziyagold.repository.SiteSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminSettingsServiceTest {

    @Mock
    private SiteSettingRepository siteSettingRepository;

    @InjectMocks
    private AdminSettingsService adminSettingsService;

    private SiteSetting phoneSetting;
    private SiteSetting telegramSetting;
    private SiteSetting aboutSetting;
    private SiteSetting masterSetting;

    @BeforeEach
    void setUp() {
        phoneSetting = SiteSetting.builder().id(1L).key("contact_phone").value("+998 90 123 45 67").build();
        telegramSetting = SiteSetting.builder().id(2L).key("contact_telegram").value("marziyagold").build();
        aboutSetting = SiteSetting.builder().id(3L).key("about_text").value("Мастерская Марзия").build();
        masterSetting = SiteSetting.builder().id(4L).key("master_name").value("Марзия").build();
    }

    @Test
    @DisplayName("getAllSettings should return all site settings with convenience aliases")
    void shouldReturnAllSettings() {
        when(siteSettingRepository.findAll()).thenReturn(List.of(phoneSetting, telegramSetting, aboutSetting, masterSetting));

        Map<String, String> settings = adminSettingsService.getAllSettings();

        assertThat(settings).containsEntry("contact_phone", "+998 90 123 45 67");
        assertThat(settings).containsEntry("phone", "+998 90 123 45 67");
        assertThat(settings).containsEntry("contact_telegram", "marziyagold");
        assertThat(settings).containsEntry("telegramUsername", "marziyagold");
        assertThat(settings).containsEntry("about_text", "Мастерская Марзия");
        assertThat(settings).containsEntry("aboutMaster", "Мастерская Марзия");
        assertThat(settings).containsEntry("master_name", "Марзия");
    }

    @Test
    @DisplayName("updateContactSettings should upsert settings and strip @ from telegram")
    void shouldUpdateContactSettings() {
        when(siteSettingRepository.findByKey(eq("contact_phone"))).thenReturn(Optional.of(phoneSetting));
        when(siteSettingRepository.findByKey(eq("contact_telegram"))).thenReturn(Optional.of(telegramSetting));
        when(siteSettingRepository.findByKey(eq("about_text"))).thenReturn(Optional.of(aboutSetting));
        when(siteSettingRepository.findAll()).thenReturn(List.of(phoneSetting, telegramSetting, aboutSetting));

        ContactSettingsUpdateRequest request = ContactSettingsUpdateRequest.builder()
                .phone("+998 99 999 99 99")
                .telegramUsername("@new_marziya")
                .aboutMaster("Новое описание мастера")
                .build();

        Map<String, String> result = adminSettingsService.updateContactSettings(request);

        ArgumentCaptor<SiteSetting> captor = ArgumentCaptor.forClass(SiteSetting.class);
        verify(siteSettingRepository, times(3)).save(captor.capture());

        List<SiteSetting> savedList = captor.getAllValues();
        assertThat(savedList).anyMatch(s -> s.getKey().equals("contact_phone") && s.getValue().equals("+998 99 999 99 99"));
        assertThat(savedList).anyMatch(s -> s.getKey().equals("contact_telegram") && s.getValue().equals("new_marziya"));
        assertThat(savedList).anyMatch(s -> s.getKey().equals("about_text") && s.getValue().equals("Новое описание мастера"));
    }

    @Test
    @DisplayName("updateContactSettings should handle compatibility alias fields")
    void shouldHandleCompatibilityFields() {
        when(siteSettingRepository.findByKey(eq("contact_phone"))).thenReturn(Optional.empty());
        when(siteSettingRepository.findByKey(eq("contact_telegram"))).thenReturn(Optional.empty());
        when(siteSettingRepository.findByKey(eq("master_name"))).thenReturn(Optional.empty());
        when(siteSettingRepository.findAll()).thenReturn(List.of());

        ContactSettingsUpdateRequest request = ContactSettingsUpdateRequest.builder()
                .contactPhone("+998 91 111 22 33")
                .contactTelegram("marziya_channel")
                .masterName("Марзия Ханум")
                .build();

        adminSettingsService.updateContactSettings(request);

        ArgumentCaptor<SiteSetting> captor = ArgumentCaptor.forClass(SiteSetting.class);
        verify(siteSettingRepository, times(3)).save(captor.capture());

        List<SiteSetting> savedList = captor.getAllValues();
        assertThat(savedList).anyMatch(s -> s.getKey().equals("contact_phone") && s.getValue().equals("+998 91 111 22 33"));
        assertThat(savedList).anyMatch(s -> s.getKey().equals("contact_telegram") && s.getValue().equals("marziya_channel"));
        assertThat(savedList).anyMatch(s -> s.getKey().equals("master_name") && s.getValue().equals("Марзия Ханум"));
    }
}
