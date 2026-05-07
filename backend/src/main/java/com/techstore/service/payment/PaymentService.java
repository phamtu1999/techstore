package com.techstore.service.payment;

import com.techstore.config.VnPayConfig;
import com.techstore.dto.payment.PaymentResultResponse;
import com.techstore.entity.order.Order;
import com.techstore.entity.order.OrderStatus;
import com.techstore.entity.payment.Payment;
import com.techstore.entity.payment.PaymentMethod;
import com.techstore.entity.payment.PaymentStatus;
import com.techstore.entity.user.Role;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.order.OrderRepository;
import com.techstore.repository.payment.PaymentRepository;
import com.techstore.utils.VnPayUtils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final VnPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public String createVnPayPaymentUrl(String orderId, HttpServletRequest request, User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        boolean isPrivilegedUser = user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_SUPER_ADMIN;
        if (!order.getUser().getId().equals(user.getId()) && !isPrivilegedUser) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = order.getId().toString() + "_" + System.currentTimeMillis();
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        
        long amount = order.getTotalAmount().multiply(new java.math.BigDecimal(100)).longValue();
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + order.getId());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", VnPayUtils.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayUtils.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        
        // Log current payment attempt
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(PaymentMethod.VNPAY)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .transactionId(vnp_TxnRef)
                .ipAddress(VnPayUtils.getIpAddress(request))
                .build();
        paymentRepository.save(payment);

        return vnPayConfig.getUrl() + "?" + queryUrl;
    }

    @Transactional
    public void processVnPayIpn(Map<String, String> params) {
        processVerifiedVnPayCallback(params);
    }

    @Transactional
    public PaymentResultResponse processVnPayReturn(Map<String, String> params) {
        return processVerifiedVnPayCallback(params);
    }

    private PaymentResultResponse processVerifiedVnPayCallback(Map<String, String> params) {
        validateSecureHash(params);

        String transactionId = params.get("vnp_TxnRef");
        if (transactionId == null || transactionId.isBlank()) {
            throw new AppException(ErrorCode.ENTITY_NOT_FOUND);
        }

        String[] transactionParts = transactionId.split("_", 2);
        String orderId = transactionParts[0];

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));

        // Check if payment was already processed (Idempotency)
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_CONFIRMED);
        }

        BigDecimal callbackAmount = parseAmount(params.get("vnp_Amount"));
        if (callbackAmount != null && payment.getAmount() != null && payment.getAmount().compareTo(callbackAmount) != 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_AMOUNT);
        }

        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        boolean isSuccess = "00".equals(responseCode);

        payment.setBankCode(params.get("vnp_BankCode"));
        payment.setMessage(resolveMessage(params, isSuccess));
        payment.setGatewayResponse(params.toString());

        Instant paymentTime = parsePayDate(params.get("vnp_PayDate"));
        if (paymentTime != null) {
            payment.setPaymentTime(paymentTime);
        }

        if (isSuccess) {
            payment.setStatus(PaymentStatus.SUCCESS);
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
        orderRepository.save(order);

        return PaymentResultResponse.builder()
                .success(isSuccess)
                .orderId(order.getId())
                .transactionId(transactionId)
                .paymentStatus(payment.getStatus().name())
                .orderStatus(order.getStatus().name())
                .responseCode(responseCode)
                .message(payment.getMessage())
                .bankCode(payment.getBankCode())
                .amount(payment.getAmount())
                .build();
    }

    private void validateSecureHash(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Map<String, String> fieldsToValidate = new HashMap<>(params);
        fieldsToValidate.remove("vnp_SecureHash");
        fieldsToValidate.remove("vnp_SecureHashType");

        String expectedHash = VnPayUtils.hashAllFields(fieldsToValidate, vnPayConfig.getHashSecret());
        if (!receivedHash.equalsIgnoreCase(expectedHash)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private BigDecimal parseAmount(String amount) {
        if (amount == null || amount.isBlank()) {
            return null;
        }
        return new BigDecimal(amount).movePointLeft(2);
    }

    private Instant parsePayDate(String payDate) {
        if (payDate == null || payDate.isBlank()) {
            return null;
        }
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            Date parsedDate = formatter.parse(payDate);
            return parsedDate.toInstant();
        } catch (ParseException exception) {
            return null;
        }
    }

    private String resolveMessage(Map<String, String> params, boolean isSuccess) {
        String transactionStatus = params.get("vnp_TransactionStatus");
        if (isSuccess || "00".equals(transactionStatus)) {
            return "Payment completed successfully";
        }
        return params.getOrDefault("vnp_OrderInfo", "Payment failed");
    }
}
