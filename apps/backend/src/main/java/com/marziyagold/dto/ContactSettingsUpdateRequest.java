package com.marziyagold.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactSettingsUpdateRequest {

    private String phone;
    private String telegramUsername;
    private String aboutMaster;

    // Compatibility fields
    private String contactPhone;
    private String contactTelegram;
    private String aboutText;
    private String masterName;

    public String getEffectivePhone() {
        return phone != null ? phone : contactPhone;
    }

    public String getEffectiveTelegram() {
        return telegramUsername != null ? telegramUsername : contactTelegram;
    }

    public String getEffectiveAboutMaster() {
        return aboutMaster != null ? aboutMaster : aboutText;
    }
}
