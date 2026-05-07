package com.techstore.service.order;

import com.techstore.dto.PageResponse;
import com.techstore.dto.order.CouponRequest;
import com.techstore.dto.order.CouponResponse;
import com.techstore.dto.order.CouponValidationResponse;
import com.techstore.entity.order.Coupon;
import com.techstore.entity.order.DiscountType;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.order.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    @Transactional(readOnly = true)
    public PageResponse<CouponResponse> getAllCoupons(String query, Pageable pageable) {
        Page<Coupon> page;
        if (query != null && !query.trim().isEmpty()) {
            page = couponRepository.searchByCode(query, pageable);
        } else {
            page = couponRepository.findAll(pageable);
        }
        return PageResponse.of(page.map(couponMapper::mapToCouponResponse));
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        return couponMapper.mapToCouponResponse(coupon);
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.COUPON_ALREADY_EXISTS);
        }
        Coupon coupon = couponMapper.mapToCoupon(request);
        return couponMapper.mapToCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(String id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
                
        Optional<Coupon> existingCoupon = couponRepository.findByCodeIgnoreCase(request.getCode());
        if (existingCoupon.isPresent() && !existingCoupon.get().getId().equals(id)) {
            throw new AppException(ErrorCode.COUPON_ALREADY_EXISTS);
        }

        couponMapper.updateCouponFromRequest(coupon, request);
        return couponMapper.mapToCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(String id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        couponRepository.delete(coupon);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderValue, User user) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code);
        
        if (couponOpt.isEmpty()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Mã giảm giá không tồn tại")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        Coupon coupon = couponOpt.get();

        if (coupon.getTargetUser() != null) {
            if (user == null || !coupon.getTargetUser().getId().equals(user.getId())) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .message("Mã giảm giá này không dành cho bạn")
                        .discountAmount(BigDecimal.ZERO)
                        .build();
            }
        }

        if (!coupon.isActive()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Mã giảm giá đã bị vô hiệu hóa")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        if (coupon.getExpirationDate().isBefore(Instant.now())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Mã giảm giá đã hết hạn")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Mã giảm giá đã hết lượt sử dụng")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        if (orderValue.compareTo(coupon.getMinPurchase()) < 0) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Đơn hàng chưa đạt giá trị tối thiểu (" + String.format("%,d", coupon.getMinPurchase().longValue()) + "đ) để áp dụng mã này")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        BigDecimal discountAmount = calculateDiscount(coupon, orderValue);

        return CouponValidationResponse.builder()
                .valid(true)
                .message("Áp dụng mã giảm giá thành công")
                .discountAmount(discountAmount)
                .couponCode(coupon.getCode())
                .build();
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderValue) {
        BigDecimal discount = BigDecimal.ZERO;
        
        if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = coupon.getDiscountValue();
        } else if (coupon.getDiscountType() == DiscountType.PERCENT) {
            discount = orderValue.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        }

        if (coupon.getMaxDiscount() != null && coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        }

        if (discount.compareTo(orderValue) > 0) {
            discount = orderValue;
        }

        return discount;
    }
}
