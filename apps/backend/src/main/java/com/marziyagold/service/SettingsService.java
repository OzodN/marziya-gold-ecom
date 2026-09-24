package com.marziyagold.service;

import com.marziyagold.dto.ContactSettingsDto;
import com.marziyagold.entity.SiteSetting;
import com.marziyagold.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingsService {

    private final SiteSettingRepository siteSettingRepository;

    public ContactSettingsDto getContactSettings() {
        Map<String, String> settingsMap = siteSettingRepository.findAll().stream()
                .collect(Collectors.toMap(SiteSetting::getKey, SiteSetting::getValue, (s1, s2) -> s1));

        return ContactSettingsDto.fromMap(settingsMap);
    }
}
