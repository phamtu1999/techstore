package com.techstore.service.inventory;

import com.techstore.dto.inventory.InventoryTransactionResponse;
import com.techstore.dto.inventory.SimpleProductVariantResponse;
import com.techstore.entity.product.ProductVariant;
import com.techstore.repository.inventory.InventoryTransactionRepository;
import com.techstore.repository.product.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryQueryService {

    private final ProductVariantRepository variantRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final InventoryMapper inventoryMapper;

    @Transactional(readOnly = true)
    public List<SimpleProductVariantResponse> getLowStockVariants() {
        return variantRepository.findLowStockVariants().stream()
                .map(inventoryMapper::mapToSimpleResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<SimpleProductVariantResponse> getAllVariants(Pageable pageable, String search, String filter) {
        boolean isLowStockRequest = "low-stock".equalsIgnoreCase(filter);
        String normalizedSearch = (search == null || search.trim().isEmpty()) ? null : search.trim();
        
        log.info("Inventory Query: isLowStock={}, search={}, offset={}, limit={}", isLowStockRequest, normalizedSearch, pageable.getOffset(), pageable.getPageSize());
        
        Page<ProductVariant> variantPage;
        if (isLowStockRequest) {
            if (normalizedSearch == null) {
                variantPage = variantRepository.findInventoryLowStockPage(pageable);
            } else {
                variantPage = variantRepository.searchInventoryLowStockPage(normalizedSearch, pageable);
            }
        } else {
            if (normalizedSearch == null) {
                variantPage = variantRepository.findAll(pageable);
            } else {
                variantPage = variantRepository.searchInventoryPage(normalizedSearch, pageable);
            }
        }
        
        log.info("Inventory Query Result: totalElements={}, contentSize={}", variantPage.getTotalElements(), variantPage.getContent().size());
        return variantPage.map(inventoryMapper::mapToSimpleResponse);
    }

    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse> getTransactionHistory(String variantId, Pageable pageable) {
        Page<com.techstore.entity.inventory.InventoryTransaction> transactions;
        if (variantId != null) {
            transactions = inventoryTransactionRepository.findByVariantId(variantId, pageable);
        } else {
            transactions = inventoryTransactionRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return transactions.map(inventoryMapper::mapToTransactionResponse);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTotalInventoryValue() {
        return variantRepository.calculateTotalInventoryValue();
    }
}
