package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactSettingsDto {
    private String contactPhone;
    private String phoneNumber;
    private String contactTelegram;
    private String telegramUsername;
    private String masterName;
    private String aboutText;
    private String masterBio;

    public static ContactSettingsDto fromMap(Map<String, String> settings) {
        String phone = settings.getOrDefault("contact_phone", "");
        String telegram = settings.getOrDefault("contact_telegram", "");
        String masterName = settings.getOrDefault("master_name", "");
        String aboutText = settings.getOrDefault("about_text", "");

        return ContactSettingsDto.builder()
                .contactPhone(phone)
                .phoneNumber(phone)
                .contactTelegram(telegram)
                .telegramUsername(telegram)
                .masterName(masterName)
                .aboutText(aboutText)
                .masterBio(aboutText)
                .build();
    }
}
