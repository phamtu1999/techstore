package com.techstore.exception;

import com.techstore.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AsyncRequestTimeoutException.class)
    public ResponseEntity<ApiResponse<?>> handleAsyncRequestTimeoutException(AsyncRequestTimeoutException e, HttpServletRequest request) {
        log.warn("Async request timeout at {}: {}", request.getRequestURI(), e.getMessage());
        return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.builder()
                        .code(503)
                        .message("Request timed out. Please try again.")
                        .build());
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<?>> handlingRuntimeException(Exception exception, HttpServletRequest request) {
        log.error("Unhandled exception at {}: ", request.getRequestURI(), exception);
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(exception.getMessage())
                        .build());
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handlingBadCredentialsException(BadCredentialsException exception) {
        ErrorCode errorCode = ErrorCode.INVALID_CREDENTIALS;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handlingIllegalArgumentException(IllegalArgumentException exception) {
        log.warn("Illegal argument: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_REQUEST_FIELD;
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(exception.getMessage() != null && !exception.getMessage().isBlank()
                                ? exception.getMessage()
                                : errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handlingHttpMessageNotReadableException(org.springframework.http.converter.HttpMessageNotReadableException exception) {
        log.warn("Message not readable: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_REQUEST_FIELD;
        String message = "Dữ liệu không hợp lệ: " + (exception.getCause() != null ? exception.getCause().getMessage() : exception.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(message)
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError() != null ? exception.getFieldError().getDefaultMessage() : null;

        ErrorCode errorCode = ErrorCode.INVALID_REQUEST_FIELD;
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        if (enumKey != null && !enumKey.isBlank()) {
            try {
                errorCode = ErrorCode.valueOf(enumKey);
            } catch (java.lang.IllegalArgumentException e) {
                // fall back to INVALID_REQUEST_FIELD
            }
        }

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.<Object>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .result(errors)
                        .build());
    }
    @ExceptionHandler(value = org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handlingDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException exception) {
        log.warn("Data integrity violation: {}", exception.getMessage());
        String message = "Lỗi ràng buộc dữ liệu hoặc trùng lặp mã (SKU/Slug)";
        
        String detail = exception.getRootCause() != null ? exception.getRootCause().getMessage() : exception.getMessage();
        if (detail != null) {
            String detailLower = detail.toLowerCase();
            if (detailLower.contains("sku") || detailLower.contains("idx_variant_sku") || detailLower.contains("uk_variant_sku")) {
                message = "Mã SKU này đã tồn tại ở một sản phẩm khác. Vui lòng kiểm tra lại.";
            } else if (detailLower.contains("slug") || detailLower.contains("idx_product_slug") || detailLower.contains("uk_product_slug")) {
                message = "Đường dẫn (Slug) này đã tồn tại. Vui lòng đổi tên sản phẩm hoặc chỉnh sửa slug.";
            }
        }

        return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                .body(ApiResponse.<Object>builder()
                        .code(409)
                        .message(message)
                        .build());
    }
}
