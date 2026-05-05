package com.techstore.security;

import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitingAspect {

    private final RateLimiterService rateLimiterService;

    @Around("@annotation(rateLimiter)")
    public Object limit(ProceedingJoinPoint joinPoint, RateLimiter rateLimiter) throws Throwable {
        String name = rateLimiter.name();
        int capacity = rateLimiter.capacity();
        
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String clientIp = getClientIp(request);
        
        String key = name + ":" + clientIp;
        
        if (!rateLimiterService.isAllowed(key, capacity)) {
            throw new AppException(ErrorCode.TOO_MANY_REQUESTS);
        }
        
        return joinPoint.proceed();
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
