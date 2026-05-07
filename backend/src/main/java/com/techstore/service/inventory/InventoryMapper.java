package com.techstore.service.inventory;

import com.techstore.dto.inventory.InventoryTransactionResponse;
import com.techstore.dto.inventory.SimpleProductVariantResponse;
import com.techstore.entity.inventory.InventoryTransaction;
import com.techstore.entity.product.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public SimpleProductVariantResponse mapToSimpleResponse(ProductVariant variant) {
        String imageUrl = variant.getProduct().getImages() != null && !variant.getProduct().getImages().isEmpty()
                ? variant.getProduct().getImages().iterator().next().getImageUrl()
                : null;

        return SimpleProductVariantResponse.builder()
                .id(variant.getId())
                .productName(variant.getProduct().getName())
                .variantName(variant.getName())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .costPrice(variant.getCostPrice() != null ? variant.getCostPrice() : java.math.BigDecimal.ZERO)
                .stockQuantity(variant.getStockQuantity())
                .lowStockThreshold(10)
                .imageUrl(imageUrl)
                .active(variant.isActive())
                .build();
    }

    public InventoryTransactionResponse mapToTransactionResponse(InventoryTransaction t) {
        return InventoryTransactionResponse.builder()
                .id(t.getId())
                .variantId(t.getVariant().getId())
                .variantName(t.getVariant().getProduct().getName() + " - " + t.getVariant().getName())
                .sku(t.getVariant().getSku())
                .transactionType(t.getTransactionType())
                .quantity(t.getQuantity())
                .balanceAfter(t.getBalanceAfter())
                .referenceNumber(t.getReferenceNumber())
                .note(t.getNote())
                .createdBy(t.getCreatedBy())
                .warehouseLocation(t.getWarehouseLocation())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
