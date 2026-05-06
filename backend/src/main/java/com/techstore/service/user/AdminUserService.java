package com.techstore.service.user;

import com.techstore.dto.user.UserCreationRequest;
import com.techstore.dto.user.UserFilterRequest;
import com.techstore.dto.user.UserResponse;
import com.techstore.entity.user.Role;
import com.techstore.entity.user.User;
import com.techstore.entity.user.UserStatus;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.user.UserRepository;
import com.techstore.service.auth.SessionCommandService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final SessionCommandService sessionCommandService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createUser(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Role newRole;
        try {
            newRole = Role.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ROLE);
        }
        checkAuthority(newRole, null);

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .active(true)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .deleted(false)
                .role(newRole)
                .twoFactorEnabled(false)
                .build();

        userRepository.save(user);
        log.info("Admin created new user: {} with role: {}", user.getEmail(), user.getRole());
    }

    public Page<UserResponse> getAllUsers(UserFilterRequest filter) {
        Pageable pageable = createPageable(filter);
        Specification<User> spec = createSpecification(filter);
        
        Page<User> users = userRepository.findAll(spec, pageable);
        List<UserResponse> mapped = enrichUsers(users.getContent());
        return new org.springframework.data.domain.PageImpl<>(mapped, pageable, users.getTotalElements());
    }

    public List<UserResponse> getAllUsers() {
        return enrichUsers(userRepository.findAllActive());
    }

    @Transactional
    public void toggleStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (user.getDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        checkAuthority(null, user);
        
        // Toggle between ACTIVE and LOCKED
        if (user.getStatus() == UserStatus.ACTIVE) {
            lockUser(userId);
        } else {
            unlockUser(userId);
        }
    }

    @Transactional
    public void updateRole(String userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (user.getDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        
        // Validate role
        try {
            Role newRole = Role.valueOf(roleName);
            checkAuthority(newRole, user);

            user.setRole(newRole);
            userRepository.save(user);

            // Invalidate sessions when role changes for security (force re-login with new permissions)
            sessionCommandService.terminateAllSessionsForUser(userId, false, null);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ROLE);
        }
    }

    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (user.getDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        checkAuthority(null, user);
        
        // Check if user has orders
        Long orderCount = userRepository.countOrdersByUserId(userId);
        if (orderCount > 0) {
            throw new AppException(ErrorCode.USER_HAS_ORDERS);
        }
        
        // Soft delete
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        user.setStatus(UserStatus.LOCKED);
        userRepository.save(user);
        
        // Invalidate all sessions immediately on delete
        sessionCommandService.terminateAllSessionsForUser(userId, false, null);
    }

    @Transactional
    public void lockUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (user.getDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        checkAuthority(null, user);
        
        user.setStatus(UserStatus.LOCKED);
        user.setActive(false);
        userRepository.save(user);
        
        // CRITICAL: Immediately terminate all active sessions in Redis
        sessionCommandService.terminateAllSessionsForUser(userId, false, null);
        log.info("Terminated all sessions for locked user ID: {}", userId);
    }

    @Transactional
    public void unlockUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (user.getDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        
        user.setStatus(UserStatus.ACTIVE);
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(String userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getDeleted()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        checkAuthority(null, user);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Security: Invalidate all sessions so user must log in with new password
        sessionCommandService.terminateAllSessionsForUser(userId, false, null);
        log.info("Admin reset password for user ID: {}. All sessions terminated.", userId);
    }

    private Specification<User> createSpecification(UserFilterRequest filter) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            
            // Exclude deleted users
            predicates.add(cb.equal(root.get("deleted"), false));
            
            // Search by name or email
            if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
                String searchPattern = "%" + filter.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("fullName")), searchPattern),
                    cb.like(cb.lower(root.get("email")), searchPattern)
                ));
            }
            
            // Filter by role
            if (filter.getRole() != null && !filter.getRole().isEmpty()) {
                try {
                    Role role = Role.valueOf(filter.getRole());
                    predicates.add(cb.equal(root.get("role"), role));
                } catch (IllegalArgumentException ignored) {}
            }
            
            // Filter by status
            if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
                try {
                    UserStatus status = UserStatus.valueOf(filter.getStatus());
                    predicates.add(cb.equal(root.get("status"), status));
                } catch (IllegalArgumentException ignored) {}
            }
            
            // Filter by email verified
            if (filter.getEmailVerified() != null) {
                predicates.add(cb.equal(root.get("emailVerified"), filter.getEmailVerified()));
            }
            
            // Filter by 2FA enabled
            if (filter.getTwoFactorEnabled() != null) {
                predicates.add(cb.equal(root.get("twoFactorEnabled"), filter.getTwoFactorEnabled()));
            }
            
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Pageable createPageable(UserFilterRequest filter) {
        int page = filter.getPage() != null ? filter.getPage() : 0;
        int size = filter.getSize() != null ? filter.getSize() : 10;
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";
        String sortDirection = filter.getSortDirection() != null ? filter.getSortDirection() : "DESC";
        
        Sort sort = sortDirection.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        return PageRequest.of(page, size, sort);
    }

    private void checkAuthority(Role targetNewRole, User targetUser) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return;

        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isSuperAdmin) {
            // Admin cannot create/assign ADMIN or SUPER_ADMIN
            if (targetNewRole != null && (targetNewRole == Role.ROLE_ADMIN || targetNewRole == Role.ROLE_SUPER_ADMIN)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            // Admin cannot modify a SUPER_ADMIN user
            if (targetUser != null && targetUser.getRole() == Role.ROLE_SUPER_ADMIN) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }
    }

    private List<UserResponse> enrichUsers(List<User> users) {
        if (users == null || users.isEmpty()) {
            return List.of();
        }

        List<String> userIds = users.stream().map(User::getId).toList();
        java.util.Map<String, Long> orderCountMap = userRepository.countOrdersByUserIds(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).longValue()
                ));
        java.util.Map<String, Double> spentMap = userRepository.calculateTotalSpentByUserIds(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> row[1] != null ? ((Number) row[1]).doubleValue() : 0D
                ));

        return users.stream().map(user -> UserResponse.builder()
                .id(user.getId())
                .username(user.getEmail())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatar(user.getAvatarUrl())
                .enabled(user.isActive())
                .roles(user.getRole() != null ? Set.of(user.getRole().name()) : Set.of())
                .createdAt(user.getCreatedAt())
                .status(user.getStatus() != null ? user.getStatus().name() : UserStatus.ACTIVE.name())
                .emailVerified(user.getEmailVerified())
                .totalOrders(orderCountMap.getOrDefault(user.getId(), 0L))
                .totalSpent(spentMap.getOrDefault(user.getId(), 0D))
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .build()).toList();
    }
}

