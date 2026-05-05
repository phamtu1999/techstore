package com.techstore.entity.settings;

import com.techstore.entity.base.BaseEntity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "store_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSettings extends BaseEntity {

    @Column(name = "store_name")
    private String storeName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "support_email")
    private String supportEmail;

    @Column(name = "hotline_phone")
    private String hotlinePhone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "setting_key", unique = true)
    private String settingKey;

    @Column(name = "currency")
    @Builder.Default
    private String currency = "VND";

    @Column(name = "timezone")
    @Builder.Default
    private String timezone = "Asia/Ho_Chi_Minh";

    @Column(name = "vat_rate")
    @Builder.Default
    private Double vatRate = 10.0;

    @Column(name = "store_status")
    @Builder.Default
    private Boolean storeStatus = true;

    // Payment settings
    @Column(name = "payment_methods", columnDefinition = "TEXT")
    private String paymentMethods; // JSON string

    @Column(name = "cod_fee")
    @Builder.Default
    private Double codFee = 0.0;

    @Column(name = "min_order")
    @Builder.Default
    private Double minOrder = 0.0;

    // SEO settings
    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_keywords")
    private String metaKeywords;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;
}
