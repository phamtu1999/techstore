package com.techstore.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST_FIELD(1001, "Trường dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_PRODUCT_ID(1002, "Mã sản phẩm không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_CATEGORY_ID(1003, "Mã danh mục không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_ROLE(1004, "Vai trò không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1005, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1006, "Tên đăng nhập phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1007, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1008, "Tài khoản không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1009, "Chưa xác thực người dùng", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1010, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1011, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    INVALID_DOB(1012, "Độ tuổi của bạn phải ít nhất {min}", HttpStatus.BAD_REQUEST),
    ENTITY_NOT_FOUND(1013, "Không tìm thấy dữ liệu yêu cầu", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(1014, "Số lượng tồn kho không đủ", HttpStatus.BAD_REQUEST),
    COUPON_INVALID(1015, "Mã giảm giá không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(1016, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    DUPLICATE_ORDER(1017, "Đơn hàng đã được xử lý", HttpStatus.CONFLICT),
    ORDER_CANCELLATION_NOT_ALLOWED(1018, "Không thể hủy đơn hàng ở trạng thái hiện tại", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_PRODUCTS(1019, "Không thể xóa danh mục đang có sản phẩm", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_CHILDREN(1020, "Không thể xóa danh mục đang có danh mục con", HttpStatus.BAD_REQUEST),
    USER_HAS_ORDERS(1021, "Không thể xóa người dùng đang có đơn hàng. Người dùng có {count} đơn hàng.", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_UPDATE(1022, "Trạng thái đơn hàng không hợp lệ cho hành động này", HttpStatus.BAD_REQUEST),
    COUPON_ALREADY_EXISTS(1023, "Mã giảm giá đã tồn tại", HttpStatus.BAD_REQUEST),
    COUPON_NOT_FOUND(1024, "Không tìm thấy mã giảm giá", HttpStatus.NOT_FOUND),
    TOO_MANY_REQUESTS(1025, "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.", HttpStatus.TOO_MANY_REQUESTS),
    SLUG_ALREADY_EXISTS(1026, "Đường dẫn sản phẩm (Slug) đã tồn tại", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_CONFIRMED(1027, "Đơn hàng đã được xác nhận thanh toán trước đó", HttpStatus.OK),
    INVALID_PAYMENT_AMOUNT(1028, "Số tiền thanh toán không khớp với đơn hàng", HttpStatus.BAD_REQUEST),
    BACKUP_FAILED(1029, "Sao lưu dữ liệu thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    RESTORE_FAILED(1030, "Phục hồi dữ liệu thất bại", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
