package com.techstore.service.order;

import com.techstore.dto.order.OrderResponse;
import com.techstore.entity.order.Order;
import com.techstore.entity.user.Role;
import com.techstore.entity.user.User;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(User user, com.techstore.entity.order.OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findAllByUserAndStatusOrderByCreatedAtDesc(user, status, pageable)
                    .map(order -> orderMapper.mapToOrderResponse(order, false));
        }
        return orderRepository.findAllByUserOrderByCreatedAtDesc(user, pageable)
                .map(order -> orderMapper.mapToOrderResponse(order, false));
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(com.techstore.entity.order.OrderStatus status, String search, Pageable pageable) {
        return orderRepository.searchOrders(status, search, pageable)
                .map(order -> orderMapper.mapToOrderResponse(order, false));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Check if user is the order owner or has management roles
        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isManagement = user.getRole() == Role.ROLE_ADMIN || 
                             user.getRole() == Role.ROLE_SUPER_ADMIN || 
                             user.getRole() == Role.ROLE_MANAGER ||
                             user.getRole() == Role.ROLE_STAFF;

        if (!isOwner && !isManagement) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return orderMapper.mapToOrderResponse(order);
    }
}
