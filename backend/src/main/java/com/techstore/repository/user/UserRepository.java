package com.techstore.repository.user;

import com.techstore.entity.user.Role;
import com.techstore.entity.user.User;
import com.techstore.entity.user.UserStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    // Find users excluding deleted ones
    @Query("SELECT u FROM User u WHERE u.deleted = false")
    List<User> findAllActive();
    
    @Query("SELECT u FROM User u WHERE u.deleted = false")
    Page<User> findAllActive(Pageable pageable);
    
    // Filter by role
    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.role = :role")
    Page<User> findByRole(@Param("role") Role role, Pageable pageable);
    
    // Filter by status
    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.status = :status")
    Page<User> findByStatus(@Param("status") UserStatus status, Pageable pageable);
    
    // Search by name or email
    @Query("SELECT u FROM User u WHERE u.deleted = false AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
    
    // Count total orders for a user
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    Long countOrdersByUserId(@Param("userId") String userId);
    
    // Calculate total spent by user
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :userId AND o.status = 'DELIVERED'")
    Double calculateTotalSpentByUserId(@Param("userId") String userId);

    @Query("SELECT o.user.id AS userId, COUNT(o) AS totalOrders FROM Order o WHERE o.user.id IN :userIds GROUP BY o.user.id")
    List<Object[]> countOrdersByUserIds(@Param("userIds") List<String> userIds);

    @Query("SELECT o.user.id AS userId, COALESCE(SUM(o.totalAmount), 0) AS totalSpent FROM Order o WHERE o.user.id IN :userIds AND o.status = 'DELIVERED' GROUP BY o.user.id")
    List<Object[]> calculateTotalSpentByUserIds(@Param("userIds") List<String> userIds);
}

