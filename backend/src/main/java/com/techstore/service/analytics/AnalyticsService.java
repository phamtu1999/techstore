package com.techstore.service.analytics;

import com.techstore.dto.analytics.DashboardResponse;
import com.techstore.entity.order.OrderStatus;
import com.techstore.repository.cart.CartItemRepository;
import com.techstore.repository.order.OrderRepository;
import com.techstore.repository.product.ProductVariantRepository;
import com.techstore.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import org.springframework.security.core.context.SecurityContextHolder;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartItemRepository cartItemRepository;

    @Cacheable(value = "analytics", key = "#period + '_' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public DashboardResponse getDashboardStats(String period) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startDate;
        java.time.LocalDateTime endDate = now;

        if ("today".equals(period)) {
            startDate = now.toLocalDate().atStartOfDay();
        } else if ("7d".equals(period)) {
            startDate = now.minusDays(7);
        } else if ("30d".equals(period)) {
            startDate = now.minusDays(30);
        } else { // "all"
            startDate = java.time.LocalDateTime.of(2000, 1, 1, 0, 0); // long time ago
        }

        BigDecimal totalRevenue = nullToZero(orderRepository.getTotalRevenueByDateRange(startDate, endDate));
        long totalOrders = orderRepository.countOrdersByDateRange(startDate, endDate);
        long totalCustomers = userRepository.count();

        // Growth Metrics
        BigDecimal todayRevenue = nullToZero(orderRepository.getTodayRevenue());
        BigDecimal yesterdayRevenue = nullToZero(orderRepository.getYesterdayRevenue());
        double revenueGrowth = calculateGrowth(todayRevenue, yesterdayRevenue);

        long todayOrders = orderRepository.getTodayOrderCount();
        long yesterdayOrders = orderRepository.getYesterdayOrderCount();
        double orderGrowth = calculateGrowth(BigDecimal.valueOf(todayOrders), BigDecimal.valueOf(yesterdayOrders));

        BigDecimal monthlyRevenue = nullToZero(orderRepository.getMonthlyRevenue());
        BigDecimal aov = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        long cancelledCount = orderRepository.countCancelledOrdersByDateRange(startDate, endDate);
        double cancellationRate = totalOrders > 0 ? (double) cancelledCount / totalOrders * 100 : 0;

        // Map status distribution
        List<Object[]> statusRows = orderRepository.getOrderStatusDistributionByDateRange(startDate, endDate);
        Map<String, Long> distribution = statusRows.stream()
                .collect(Collectors.toMap(
                        row -> ((OrderStatus) row[0]).name(),
                        row -> (Long) row[1]
                ));

        // Map recent revenue history
        List<Object[]> historyRows = orderRepository.getExtendedRevenueHistoryByDateRange(startDate, endDate);
        List<DashboardResponse.RevenueData> history = historyRows.stream()
                .map(row -> {
                    BigDecimal rev = (BigDecimal) row[1];
                    long ord = ((Number) row[2]).longValue();
                    BigDecimal dayAov = ord > 0 ? rev.divide(BigDecimal.valueOf(ord), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                    return new DashboardResponse.RevenueData(row[0].toString(), rev, ord, dayAov);
                })
                .collect(Collectors.toList());

        // Map top products
        List<Object[]> topProductRows = orderRepository.getTopSellingVariantsByDateRange(startDate, endDate);
        BigDecimal finalTotalRevenue = totalRevenue;
        List<DashboardResponse.TopProductData> topProducts = topProductRows.stream()
                .limit(5)
                .map(row -> {
                    BigDecimal productRev = (BigDecimal) row[2];
                    double contribution = finalTotalRevenue.compareTo(BigDecimal.ZERO) > 0 
                        ? productRev.divide(finalTotalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100 
                        : 0;
                    return new DashboardResponse.TopProductData((String) row[0], (Long) row[1], productRev, contribution);
                })
                .collect(Collectors.toList());

        DashboardResponse response = DashboardResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalCustomers(totalCustomers)
                .todayRevenue(todayRevenue)
                .monthlyRevenue(monthlyRevenue)
                .revenueGrowth(revenueGrowth)
                .todayOrders(todayOrders)
                .orderGrowth(orderGrowth)
                .averageOrderValue(aov)
                .cancellationRate(cancellationRate)
                .orderStatusDistribution(distribution)
                .revenueHistory(history)
                .topProducts(topProducts)
                // AI & Advanced Analytics
                .predictedNextMonthRevenue(monthlyRevenue.multiply(java.math.BigDecimal.valueOf(1.15))) // Simple AI Forecast: 15% growth
                .lowStockProducts(calculateLowStock())
                .abandonedCartInsights(calculateAbandonedCarts())
                .abandonedCartRate(calculateAbandonedRate(totalOrders))
                .build();

        // Sanitize for Staff
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOnly = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")) && 
                auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        
        if (isStaffOnly) {
           response.setTotalRevenue(BigDecimal.ZERO);
           response.setTodayRevenue(BigDecimal.ZERO);
           response.setMonthlyRevenue(BigDecimal.ZERO);
           response.setRevenueGrowth(0);
           response.setAverageOrderValue(BigDecimal.ZERO);
           response.setPredictedNextMonthRevenue(BigDecimal.ZERO);
           
           if (response.getRevenueHistory() != null) {
               response.getRevenueHistory().forEach(h -> {
                   h.setRevenue(BigDecimal.ZERO);
                   h.setAov(BigDecimal.ZERO);
               });
           }
           
           if (response.getTopProducts() != null) {
               response.getTopProducts().forEach(p -> {
                   p.setTotalRevenue(BigDecimal.ZERO);
                   p.setContributionPercentage(0);
               });
           }

           if (response.getAbandonedCartInsights() != null) {
               response.getAbandonedCartInsights().forEach(i -> i.setPotentialLoss(BigDecimal.ZERO));
           }
        }

        return response;
    }

    private List<DashboardResponse.LowStockProduct> calculateLowStock() {
        return productVariantRepository.findLowStockVariants().stream()
                .<DashboardResponse.LowStockProduct>map(v -> DashboardResponse.LowStockProduct.builder()
                        .name(v.getProduct().getName())
                        .variantName(v.getName())
                        .currentStock(v.getStockQuantity())
                        .threshold(10)
                        .status(v.getStockQuantity() <= 3 ? "CRITICAL" : "WARNING")
                        .build())
                .collect(Collectors.toList());
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private List<DashboardResponse.AbandonedCartData> calculateAbandonedCarts() {
        return cartItemRepository.getAbandonedCartInsights().stream()
                .limit(5)
                .<DashboardResponse.AbandonedCartData>map(row -> DashboardResponse.AbandonedCartData.builder()
                        .productName(String.valueOf(row[0]))
                        .cartCount(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                        .potentialLoss(row[2] != null ? new java.math.BigDecimal(row[2].toString()) : java.math.BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    private double calculateAbandonedRate(long totalOrders) {
        long usersWithCarts = cartItemRepository.countUsersWithItemsInCart();
        if (usersWithCarts == 0) return 0;
        return (double) usersWithCarts / (usersWithCarts + totalOrders) * 100;
    }

    private double calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .doubleValue() * 100;
    }

    public byte[] exportReport(String period) {
        DashboardResponse stats = getDashboardStats(period);
        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            
            org.apache.poi.xssf.usermodel.XSSFSheet sheet = workbook.createSheet("Analytics - " + period);
            int rowIdx = 0;
            
            // Header
            org.apache.poi.xssf.usermodel.XSSFRow header = sheet.createRow(rowIdx++);
            header.createCell(0).setCellValue("Thống Kê Tổng Quan (" + period + ")");
            
            rowIdx++;
            org.apache.poi.xssf.usermodel.XSSFRow totalRow = sheet.createRow(rowIdx++);
            totalRow.createCell(0).setCellValue("Tổng Doanh Thu");
            totalRow.createCell(1).setCellValue(stats.getTotalRevenue().doubleValue());
            
            org.apache.poi.xssf.usermodel.XSSFRow ordersRow = sheet.createRow(rowIdx++);
            ordersRow.createCell(0).setCellValue("Tổng Đơn Hàng");
            ordersRow.createCell(1).setCellValue(stats.getTotalOrders());
            
            org.apache.poi.xssf.usermodel.XSSFRow customersRow = sheet.createRow(rowIdx++);
            customersRow.createCell(0).setCellValue("Khách Hàng");
            customersRow.createCell(1).setCellValue(stats.getTotalCustomers());
            
            rowIdx++;
            org.apache.poi.xssf.usermodel.XSSFRow historyTitle = sheet.createRow(rowIdx++);
            historyTitle.createCell(0).setCellValue("Lịch sử doanh thu");
            
            org.apache.poi.xssf.usermodel.XSSFRow historyHeader = sheet.createRow(rowIdx++);
            historyHeader.createCell(0).setCellValue("Ngày");
            historyHeader.createCell(1).setCellValue("Doanh thu");
            historyHeader.createCell(2).setCellValue("Số đơn");
            historyHeader.createCell(3).setCellValue("Giá trị đơn (AOV)");
            
            for (DashboardResponse.RevenueData data : stats.getRevenueHistory()) {
                org.apache.poi.xssf.usermodel.XSSFRow row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getDate());
                row.createCell(1).setCellValue(data.getRevenue().doubleValue());
                row.createCell(2).setCellValue(data.getOrders());
                row.createCell(3).setCellValue(data.getAov().doubleValue());
            }
            
            workbook.write(out);
            return out.toByteArray();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Lỗi khi xuất file Excel", e);
        }
    }
}
