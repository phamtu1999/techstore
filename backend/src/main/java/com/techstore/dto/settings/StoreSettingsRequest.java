package com.techstore.dto.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSettingsRequest {
    private String storeName;
    private String logoUrl;
    private String supportEmail;
    private String hotlinePhone;
    private String address;
    private String currency;
    private String timezone;
    private Double vatRate;
    private Boolean storeStatus;
    private Object paymentMethods; // Can be a map or object from frontend
    private Double codFee;
    private Double minOrder;
    private String metaTitle;
    private String metaKeywords;
    private String metaDescription;
}
