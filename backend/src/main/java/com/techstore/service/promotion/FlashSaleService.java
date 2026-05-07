package com.techstore.service.promotion;

import com.techstore.dto.promotion.FlashSaleResponse;
import com.techstore.entity.promotion.FlashSale;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.promotion.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;

    @Transactional(readOnly = true)
    public FlashSaleResponse getActiveFlashSale() {
        return flashSaleRepository.findActiveFlashSale(Instant.now())
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional
    public FlashSale createFlashSale(FlashSale flashSale) {
        return flashSaleRepository.save(flashSale);
    }

    @Transactional
    public FlashSale updateFlashSale(String id, FlashSale details) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        
        flashSale.setName(details.getName());
        flashSale.setStartDate(details.getStartDate());
        flashSale.setEndDate(details.getEndDate());
        flashSale.setActive(details.isActive());
        
        return flashSaleRepository.save(flashSale);
    }

    private FlashSaleResponse mapToResponse(FlashSale fs) {
        return FlashSaleResponse.builder()
                .id(fs.getId())
                .name(fs.getName())
                .startDate(fs.getStartDate())
                .endDate(fs.getEndDate())
                .active(fs.isActive())
                .items(fs.getItems() != null ? fs.getItems().stream().map(item -> FlashSaleResponse.FlashSaleItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductVariant().getProduct().getId())
                        .productName(item.getProductVariant().getProduct().getName())
                        .productImageUrl(item.getProductVariant().getProduct().getImages().isEmpty() ? null : item.getProductVariant().getProduct().getImages().iterator().next().getImageUrl())
                        .variantId(item.getProductVariant().getId())
                        .variantName(item.getProductVariant().getName())
                        .originalPrice(item.getProductVariant().getPrice())
                        .salePrice(item.getSalePrice())
                        .stockLimit(item.getStockLimit())
                        .soldCount(item.getSoldCount())
                        .build()).collect(Collectors.toList()) : null)
                .build();
    }
}
