package com.techstore.repository.order;

import com.techstore.entity.order.Order;
import com.techstore.entity.user.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
       boolean existsByIdempotencyKey(String key);

       @Query("""
              select distinct o from Order o
              left join fetch o.user
              left join fetch o.coupon
              left join fetch o.items i
              left join fetch i.variant v
              left join fetch v.product p
              left join fetch p.images
              where o.id = :id
              """)
       Optional<Order> fetchByIdWithDetails(@Param("id") String id);

       @EntityGraph(attributePaths = {"user", "coupon", "items", "items.variant", "items.variant.product", "items.variant.product.images"})
       @Query(value = "SELECT DISTINCT o FROM Order o WHERE o.user = :user", 
              countQuery = "SELECT COUNT(DISTINCT o) FROM Order o WHERE o.user = :user")
       Page<Order> findAllByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);

       @EntityGraph(attributePaths = {"user", "coupon", "items", "items.variant", "items.variant.product", "items.variant.product.images"})
       @Query(value = "SELECT DISTINCT o FROM Order o WHERE o.user = :user AND o.status = :status",
              countQuery = "SELECT COUNT(DISTINCT o) FROM Order o WHERE o.user = :user AND o.status = :status")
       Page<Order> findAllByUserAndStatusOrderByCreatedAtDesc(@Param("user") User user, @Param("status") com.techstore.entity.order.OrderStatus status, Pageable pageable);

       @EntityGraph(attributePaths = {"user", "coupon", "items", "items.variant", "items.variant.product", "items.variant.product.images"})
       @Query(value = "SELECT DISTINCT o FROM Order o",
              countQuery = "SELECT COUNT(DISTINCT o) FROM Order o")
       Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

       @EntityGraph(attributePaths = {"user", "coupon", "items", "items.variant", "items.variant.product", "items.variant.product.images"})
       @Query(value = "SELECT DISTINCT o FROM Order o " +
                     "WHERE (:status IS NULL OR o.status = :status) " +
                     "AND (:search IS NULL OR " +
                     "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(o.receiverPhone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                     "ORDER BY o.createdAt DESC",
              countQuery = "SELECT COUNT(DISTINCT o) FROM Order o " +
                     "WHERE (:status IS NULL OR o.status = :status) " +
                     "AND (:search IS NULL OR " +
                     "LOWER(o.receiverName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                     "LOWER(o.receiverPhone) LIKE LOWER(CONCAT('%', :search, '%')))")
       Page<Order> searchOrders(@Param("status") com.techstore.entity.order.OrderStatus status, 
                               @Param("search") String search, 
                               Pageable pageable);

       @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN ('CONFIRMED', 'DELIVERED')")
       BigDecimal getTotalRevenue();

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'CANCELLED'")
       long countCancelledOrders();

       @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
       List<Object[]> getOrderStatusDistribution();

       @Query(value = "SELECT CAST(created_at AS DATE) as date, SUM(total_amount) as revenue, COUNT(*) as orders " +
                     "FROM orders WHERE status IN ('CONFIRMED', 'DELIVERED', 'SHIPPED', 'SHIPPING') " +
                     "GROUP BY CAST(created_at AS DATE) ORDER BY date DESC LIMIT 30", nativeQuery = true)
       List<Object[]> getExtendedRevenueHistory();

       @Query(value = "SELECT SUM(total_amount) FROM orders " +
                     "WHERE status IN ('CONFIRMED', 'SHIPPING', 'DELIVERED') " +
                     "AND CAST(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS DATE) = CURRENT_DATE", nativeQuery = true)
       BigDecimal getTodayRevenue();

       @Query(value = "SELECT SUM(total_amount) FROM orders " +
                     "WHERE status IN ('CONFIRMED', 'SHIPPING', 'DELIVERED') " +
                     "AND CAST(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS DATE) = CURRENT_DATE - INTERVAL '1' DAY", nativeQuery = true)
       BigDecimal getYesterdayRevenue();

       @Query(value = "SELECT COUNT(*) FROM orders " +
                     "WHERE CAST(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS DATE) = CURRENT_DATE", nativeQuery = true)
       long getTodayOrderCount();

       @Query(value = "SELECT COUNT(*) FROM orders " +
                     "WHERE created_at >= CURRENT_DATE - INTERVAL '1' DAY AND created_at < CURRENT_DATE", nativeQuery = true)
       long getYesterdayOrderCount();

       @Query(value = "SELECT SUM(total_amount) FROM orders " +
                     "WHERE status IN ('CONFIRMED', 'SHIPPING', 'DELIVERED') " +
                     "AND created_at >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'", nativeQuery = true)
       BigDecimal getMonthlyRevenue();

       @Query("SELECT oi.variantName, SUM(oi.quantity), SUM(oi.priceAtPurchase * oi.quantity) " +
                     "FROM OrderItem oi JOIN oi.order o " +
                     "WHERE o.status IN ('CONFIRMED', 'DELIVERED') " +
                     "GROUP BY oi.variantName " +
                     "ORDER BY SUM(oi.quantity) DESC")
       List<Object[]> getTopSellingVariants();

       @Query("SELECT COALESCE(SUM(oi.quantity), 0) " +
                     "FROM OrderItem oi JOIN oi.order o " +
                     "WHERE oi.variant.product.id = :productId AND o.status IN ('CONFIRMED', 'DELIVERED')")
       Long getSoldCountByProductId(String productId);

       @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN ('CONFIRMED', 'DELIVERED') AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
       BigDecimal getTotalRevenueByDateRange(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
       long countOrdersByDateRange(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'CANCELLED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
       long countCancelledOrdersByDateRange(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

       @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate GROUP BY o.status")
       List<Object[]> getOrderStatusDistributionByDateRange(java.time.LocalDateTime startDate,
                     java.time.LocalDateTime endDate);

       @Query("SELECT oi.variantName, SUM(oi.quantity), SUM(oi.priceAtPurchase * oi.quantity) " +
                     "FROM OrderItem oi JOIN oi.order o " +
                     "WHERE o.status IN ('CONFIRMED', 'DELIVERED') AND o.createdAt >= :startDate AND o.createdAt <= :endDate "
                     +
                     "GROUP BY oi.variantName " +
                     "ORDER BY SUM(oi.quantity) DESC")
       List<Object[]> getTopSellingVariantsByDateRange(java.time.LocalDateTime startDate,
                     java.time.LocalDateTime endDate);

       @Query(value = "SELECT CAST(created_at AS DATE) as date, SUM(total_amount) as revenue, COUNT(*) as orders " +
                     "FROM orders WHERE status IN ('CONFIRMED', 'DELIVERED', 'SHIPPED', 'SHIPPING') " +
                     "AND created_at >= :startDate AND created_at <= :endDate " +
                     "GROUP BY CAST(created_at AS DATE) ORDER BY date ASC", nativeQuery = true)
       List<Object[]> getExtendedRevenueHistoryByDateRange(java.time.LocalDateTime startDate,
                     java.time.LocalDateTime endDate);
}
