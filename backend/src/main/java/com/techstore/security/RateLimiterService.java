package com.techstore.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class RateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final long WINDOW_SECONDS = 60;

    public boolean isAllowed(String key, int maxAttempts) {
        try {
            String redisKey = "rate_limit:" + key;
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(WINDOW_SECONDS));
            }
            return count != null && count <= maxAttempts;
        } catch (Exception e) {
            // ⚠️ Redis không khả dụng → cho phép request đi qua (fail-open)
            log.warn("⚠️ Redis unavailable for rate limiting, allowing request: {}", e.getMessage());
            return true;
        }
    }
}
