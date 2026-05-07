# Danh sách Chức năng Admin - Tech Store

Tài liệu này liệt kê tất cả các chức năng dành cho quản trị viên và nhân viên trong hệ thống Tech Store.

## 1. Tổng quan (Dashboard)
- **Thống kê nhanh**: Xem tổng doanh thu, số lượng đơn hàng, số lượng khách hàng và sản phẩm.
- **Biểu đồ tăng trưởng**: Theo dõi doanh thu theo ngày/tháng/năm.
- **Trạng thái hệ thống**: Giám sát các chỉ số vận hành cơ bản.

## 2. Quản lý Sản phẩm (Product Management)
### Chức năng chính:
- **Danh sách sản phẩm**: Xem, tìm kiếm và lọc sản phẩm theo nhiều tiêu chí.
- **Thêm/Sửa sản phẩm**: Cấu hình thông tin chi tiết, giá bán, hình ảnh và SKU.
- **Quản lý biến thể**: Quản lý các phiên bản sản phẩm (màu sắc, dung lượng, v.v.).
- **Xóa/Lưu trữ**: Loại bỏ hoặc tạm ẩn sản phẩm khỏi cửa hàng.

### Phân loại:
- **Danh mục (Categories)**: Quản lý phân loại sản phẩm theo cấp bậc.
- **Thương hiệu (Brands)**: Quản lý danh sách thương hiệu và nhà sản xuất.

*Quyền hạn: STAFF (chỉ xem/sửa sản phẩm), ADMIN, SUPER_ADMIN.*

## 3. Quản lý Bán hàng (Sales Management)
### Đơn hàng (Orders):
- **Xử lý đơn hàng**: Tiếp nhận đơn hàng mới và chuyển trạng thái xử lý.
- **Cập nhật trạng thái**: Chờ xử lý -> Đang đóng gói -> Đang giao -> Đã giao -> Đã hủy -> Đã đánh giá.
- **Lịch sử đơn hàng**: Theo dõi dòng thời gian thay đổi của từng đơn hàng.
- **Chi tiết đơn hàng**: Xem thông tin khách hàng, địa chỉ giao hàng và danh sách sản phẩm đã mua.

### Mã giảm giá (Coupons):
- **Tạo mã mới**: Thiết lập mã giảm giá theo số tiền cố định hoặc phần trăm.
- **Điều kiện áp dụng**: Hạn sử dụng, giá trị đơn hàng tối thiểu, số lần sử dụng tối đa.

*Quyền hạn: STAFF (Đơn hàng), MANAGER (Mã giảm giá), ADMIN, SUPER_ADMIN.*

## 4. Kho & Vận hành (Inventory)
- **Quản lý tồn kho**: Cập nhật số lượng sản phẩm trong kho.
- **Nhập/Xuất kho**: Theo dõi lịch sử thay đổi số lượng hàng hóa.
- **Cảnh báo hết hàng**: Hệ thống tự động báo cáo các sản phẩm có số lượng dưới mức an toàn.

*Quyền hạn: STAFF, ADMIN, SUPER_ADMIN.*

## 5. Báo cáo & Nhật ký (Reports & Logs)
- **Analytics**: Báo cáo chuyên sâu về doanh thu, sản phẩm bán chạy nhất và tỷ lệ chuyển đổi.
- **Nhật ký hệ thống (Audit Logs)**: Ghi lại mọi hành động nhạy cảm của người dùng admin để phục vụ hậu kiểm.
- **Xuất dữ liệu**: Hỗ trợ xuất các báo cáo ra file Excel/CSV.

*Quyền hạn: ADMIN (Analytics), SUPER_ADMIN (Logs).*

## 6. Hệ thống & Người dùng (System & Users)
- **Quản lý người dùng**: Danh sách thành viên, thay đổi vai trò (Role), khóa hoặc kích hoạt tài khoản.
- **Cấu hình hệ thống (Settings)**:
  - Thông tin cửa hàng (Tên, Email, SĐT, Địa chỉ).
  - Cấu hình SEO và Meta tags.
  - Tùy chỉnh giao diện (Giao diện tối/sáng).
- **Sao lưu & Khôi phục (Backup)**: Tạo các bản sao lưu cơ sở dữ liệu và khôi phục khi cần thiết.

*Quyền hạn: ADMIN, SUPER_ADMIN.*

## 7. Tính năng Nâng cao
- **Livestream**: Quản lý các buổi phát trực tiếp để quảng bá và bán sản phẩm.
- **Quản lý File**: Thư viện phương tiện tập trung để quản lý hình ảnh và video trên toàn hệ thống.

*Quyền hạn: STAFF, ADMIN, SUPER_ADMIN.*
