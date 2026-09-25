package com.marziyagold.service;

import com.marziyagold.dto.ContactSettingsUpdateRequest;
import com.marziyagold.entity.SiteSetting;
import com.marziyagold.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminSettingsService {

    private final SiteSettingRepository siteSettingRepository;

    public Map<String, String> getAllSettings() {
        Map<String, String> settings = new LinkedHashMap<>();
        for (SiteSetting setting : siteSettingRepository.findAll()) {
            settings.put(setting.getKey(), setting.getValue());
        }

        // Add normalized convenience aliases if present
        if (settings.containsKey("contact_phone")) {
            settings.putIfAbsent("phone", settings.get("contact_phone"));
        }
        if (settings.containsKey("contact_telegram")) {
            settings.putIfAbsent("telegramUsername", settings.get("contact_telegram"));
        }
        if (settings.containsKey("about_text")) {
            settings.putIfAbsent("aboutMaster", settings.get("about_text"));
        }

        return settings;
    }

    @Transactional
    public Map<String, String> updateContactSettings(ContactSettingsUpdateRequest request) {
        if (request.getEffectivePhone() != null) {
            upsertSetting("contact_phone", request.getEffectivePhone().trim());
        }
        if (request.getEffectiveTelegram() != null) {
            String telegram = request.getEffectiveTelegram().trim();
            if (telegram.startsWith("@")) {
                telegram = telegram.substring(1);
            }
            upsertSetting("contact_telegram", telegram);
        }
        if (request.getEffectiveAboutMaster() != null) {
            upsertSetting("about_text", request.getEffectiveAboutMaster().trim());
        }
        if (request.getMasterName() != null) {
            upsertSetting("master_name", request.getMasterName().trim());
        }

        log.info("Admin updated contact settings");
        return getAllSettings();
    }

    private void upsertSetting(String key, String value) {
        SiteSetting setting = siteSettingRepository.findByKey(key)
                .orElseGet(() -> SiteSetting.builder().key(key).build());
        setting.setValue(value);
        siteSettingRepository.save(setting);
    }
}
