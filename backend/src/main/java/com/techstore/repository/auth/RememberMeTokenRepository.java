package com.techstore.repository.auth;

import com.techstore.entity.auth.RememberMeToken;
import com.techstore.entity.user.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RememberMeTokenRepository extends JpaRepository<RememberMeToken, String> {
    
    /**
     * Find a remember-me token by its token value
     */
    Optional<RememberMeToken> findByTokenValue(String tokenValue);
    
    /**
     * Find all remember-me tokens for a specific user
     */
    List<RememberMeToken> findByUser(User user);
    
    /**
     * Find all remember-me tokens by user ID
     */
    List<RememberMeToken> findByUserId(String userId);
    
    /**
     * Delete all expired tokens (cleanup operation)
     */
    @Modifying
    @Query("DELETE FROM RememberMeToken t WHERE t.expirationTimestamp < :currentTime")
    void deleteExpiredTokens(@Param("currentTime") Instant currentTime);
    
    /**
     * Find all expired tokens (for reporting/auditing before deletion)
     */
    List<RememberMeToken> findByExpirationTimestampBefore(Instant currentTime);
}
