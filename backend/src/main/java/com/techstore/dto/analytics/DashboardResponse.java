package com.techstore.dto.analytics;


import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardResponse {
    long totalOrders;
    BigDecimal totalRevenue;
    long totalCustomers;
    long totalProducts;
    long activeProducts;
    
    // Growth metrics
    BigDecimal todayRevenue;
    BigDecimal monthlyRevenue;
    double revenueGrowth; // compared to yesterday
    long todayOrders;
    double orderGrowth;
    BigDecimal averageOrderValue;
    double cancellationRate;

    List<RevenueData> revenueHistory;
    List<TopProductData> topProducts;
    Map<String, Long> orderStatusDistribution;

    // AI & Advanced Analytics
    BigDecimal predictedNextMonthRevenue;
    double abandonedCartRate;
    List<LowStockProduct> lowStockProducts;
    List<AbandonedCartData> abandonedCartInsights;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueData {
        String date;
        BigDecimal revenue;
        long orders;
        BigDecimal aov;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProductData {
        String productName;
        long totalSold;
        BigDecimal totalRevenue;
        double contributionPercentage;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LowStockProduct {
        String name;
        String variantName;
        int currentStock;
        int threshold;
        String status; // "CRITICAL", "WARNING"
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AbandonedCartData {
        String productName;
        long cartCount;
        BigDecimal potentialLoss;
    }
}
