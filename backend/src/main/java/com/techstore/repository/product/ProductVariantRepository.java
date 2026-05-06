package com.techstore.repository.product;

import com.techstore.entity.product.ProductVariant;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdWithLock(String id);

    @EntityGraph(attributePaths = {"product", "product.images"})
    List<ProductVariant> findAll();

    @EntityGraph(attributePaths = {"product", "product.images"})
    Page<ProductVariant> findAll(Pageable pageable);

    @Query(value = "SELECT v FROM ProductVariant v JOIN FETCH v.product p LEFT JOIN FETCH p.images")
    List<ProductVariant> findAllWithProductAndImages();

    @Query(value = "SELECT SUM(COALESCE(v.costPrice, 0) * v.stockQuantity) FROM ProductVariant v")
    BigDecimal calculateTotalInventoryValue();

    @EntityGraph(attributePaths = {"product", "product.images"})
    @Query("SELECT v FROM ProductVariant v WHERE " +
           "LOWER(v.product.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.sku) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<ProductVariant> searchInventoryPage(String search, Pageable pageable);


    @EntityGraph(attributePaths = {"product", "product.images"})
    Optional<ProductVariant> findBySku(String sku);
    
    List<ProductVariant> findByProductIdOrderBySortOrderAsc(String productId);

    @Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p LEFT JOIN FETCH p.images WHERE v.stockQuantity <= 20")
    List<ProductVariant> findLowStockVariants();

    @Query(
        value = "SELECT v FROM ProductVariant v JOIN FETCH v.product p WHERE v.stockQuantity <= 20",
        countQuery = "SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity <= 20"
    )
    Page<ProductVariant> findInventoryLowStockPage(Pageable pageable);

    @Query(
        value = "SELECT v FROM ProductVariant v JOIN FETCH v.product p WHERE " +
                "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                "LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                "LOWER(v.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND v.stockQuantity <= 20",
        countQuery = "SELECT COUNT(v) FROM ProductVariant v JOIN v.product p WHERE " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(v.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND v.stockQuantity <= 20"
    )
    Page<ProductVariant> searchInventoryLowStockPage(String search, Pageable pageable);
}
