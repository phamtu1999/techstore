package com.techstore.service.settings;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techstore.dto.settings.StoreSettingsRequest;
import com.techstore.dto.settings.StoreSettingsResponse;
import com.techstore.entity.settings.StoreSettings;
import com.techstore.repository.settings.StoreSettingsRepository;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreSettingsService {

    private final StoreSettingsRepository storeSettingsRepository;
    private final ObjectMapper objectMapper;

    private static final String DEFAULT_SETTING_KEY = "general";

    public StoreSettingsResponse getSettings() {
        StoreSettings settings = storeSettingsRepository.findBySettingKey(DEFAULT_SETTING_KEY)
                .orElseGet(() -> createDefaultSettings());
        return mapToResponse(settings);
    }

    @Transactional
    public StoreSettingsResponse updateSettings(StoreSettingsRequest request) {
        StoreSettings settings = storeSettingsRepository.findBySettingKey(DEFAULT_SETTING_KEY)
                .orElseGet(() -> createDefaultSettings());

        settings.setStoreName(request.getStoreName());
        settings.setLogoUrl(request.getLogoUrl());
        settings.setSupportEmail(request.getSupportEmail());
        settings.setHotlinePhone(request.getHotlinePhone());
        settings.setAddress(request.getAddress());
        settings.setCurrency(request.getCurrency());
        settings.setTimezone(request.getTimezone());
        settings.setVatRate(request.getVatRate());
        settings.setStoreStatus(request.getStoreStatus());
        settings.setCodFee(request.getCodFee());
        settings.setMinOrder(request.getMinOrder());
        settings.setMetaTitle(request.getMetaTitle());
        settings.setMetaKeywords(request.getMetaKeywords());
        settings.setMetaDescription(request.getMetaDescription());

        if (request.getPaymentMethods() != null) {
            try {
                settings.setPaymentMethods(objectMapper.writeValueAsString(request.getPaymentMethods()));
            } catch (JsonProcessingException e) {
                log.error("Error mapping payment methods to JSON", e);
            }
        }

        return mapToResponse(storeSettingsRepository.save(settings));
    }

    private StoreSettings createDefaultSettings() {
        StoreSettings settings = StoreSettings.builder()
                .settingKey(DEFAULT_SETTING_KEY)
                .storeName("Tech Store")
                .logoUrl("https://placehold.co/600x400?text=Tech+Store")
                .supportEmail("support@techstore.com")
                .hotlinePhone("0987.654.321")
                .address("123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh")
                .currency("VND")
                .timezone("Asia/Ho_Chi_Minh")
                .vatRate(10.0)
                .storeStatus(true)
                .codFee(0.0)
                .minOrder(0.0)
                .build();
        return storeSettingsRepository.save(settings);
    }

    private StoreSettingsResponse mapToResponse(StoreSettings settings) {
        Object paymentMethods = null;
        if (settings.getPaymentMethods() != null) {
            try {
                paymentMethods = objectMapper.readValue(settings.getPaymentMethods(), Object.class);
            } catch (JsonProcessingException e) {
                log.error("Error mapping payment methods from JSON", e);
            }
        }

        return StoreSettingsResponse.builder()
                .id(settings.getId())
                .storeName(settings.getStoreName())
                .logoUrl(settings.getLogoUrl())
                .supportEmail(settings.getSupportEmail())
                .hotlinePhone(settings.getHotlinePhone())
                .address(settings.getAddress())
                .currency(settings.getCurrency())
                .timezone(settings.getTimezone())
                .vatRate(settings.getVatRate())
                .storeStatus(settings.getStoreStatus())
                .paymentMethods(paymentMethods)
                .codFee(settings.getCodFee())
                .minOrder(settings.getMinOrder())
                .metaTitle(settings.getMetaTitle())
                .metaKeywords(settings.getMetaKeywords())
                .metaDescription(settings.getMetaDescription())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
