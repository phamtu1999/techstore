package com.techstore.dto.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSettingsResponse {
    private String id;
    private String storeName;
    private String logoUrl;
    private String supportEmail;
    private String hotlinePhone;
    private String address;
    private String currency;
    private String timezone;
    private Double vatRate;
    private Boolean storeStatus;
    private Object paymentMethods;
    private Double codFee;
    private Double minOrder;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
    private Instant updatedAt;
}
