# Tài liệu Chức năng Hệ thống Tech Store v2

Tài liệu này tổng hợp chi tiết các chức năng hiện có của hệ thống Tech Store v2, bao gồm các thành phần Frontend, BFF và Backend.

---

## 🏗️ Kiến trúc Hệ thống
Hệ thống được thiết kế theo mô hình **BFF (Backend-For-Frontend)**:
- **Frontend:** React + Redux Toolkit + Tailwind CSS.
- **BFF (NestJS):** Proxy Gateway + Redis Caching + Security Session.
- **Backend (Spring Boot):** RESTful API + PostgreSQL + Spring Security JWT.

---

## 👤 1. Chức năng dành cho Khách hàng (Storefront)

### 🛒 Mua sắm & Sản phẩm
- **Xem danh sách sản phẩm:** Hỗ trợ phân trang, lọc theo danh mục, thương hiệu và khoảng giá.
- **Tìm kiếm thông minh:** Tìm kiếm sản phẩm theo tên/SKU với công nghệ Debounce (giảm thiểu request thừa).
- **Chi tiết sản phẩm:** Xem thông số kỹ thuật, hình ảnh, giá cả và các biến thể (màu sắc, dung lượng).
- **So sánh sản phẩm:** Cho phép so sánh thông số giữa nhiều thiết bị công nghệ.
- **Sản phẩm yêu thích (Wishlist):** Lưu lại các sản phẩm quan tâm để mua sau.

### 💳 Giỏ hàng & Thanh toán
- **Quản lý giỏ hàng:** Thêm/sửa/xóa sản phẩm, cập nhật số lượng trực tiếp.
- **Thanh toán (Checkout):** Quy trình đặt hàng nhiều bước, nhập địa chỉ và ghi chú.
- **Tích hợp thanh toán:** Hỗ trợ các phương thức thanh toán trực tuyến (VNPAY/Momo) và COD.
- **Mã giảm giá (Coupons):** Áp dụng các mã khuyến mãi khi thanh toán.

### 👤 Quản lý Tài khoản
- **Đăng ký / Đăng nhập:** Hệ thống xác thực bảo mật với JWT và Session Cookie.
- **Hồ sơ cá nhân:** Cập nhật thông tin, địa chỉ và ảnh đại diện.
- **Lịch sử đơn hàng:** Theo dõi trạng thái các đơn hàng đã đặt (Chờ duyệt, Đang giao, Hoàn thành, Đã hủy).

---

## 🛡️ 2. Chức năng dành cho Quản trị (Admin Dashboard)

### 📦 Quản lý Sản phẩm & Kho
- **Quản lý danh mục/thương hiệu:** Cấu trúc cây danh mục linh hoạt.
- **Quản lý biến thể:** Quản lý chi tiết từng SKU, giá vốn, giá bán và hình ảnh riêng cho từng màu sắc/dung lượng.
- **Quản lý Kho hàng (Inventory):**
    - Kiểm kê tồn kho thực tế.
    - Nhập hàng (Import).
    - Nhật ký biến động kho (Transaction History).
    - Cảnh báo sản phẩm sắp hết hàng (Low stock alert).

### 📑 Quản lý Đơn hàng
- **Xử lý đơn hàng:** Tiếp nhận, phê duyệt và chuyển trạng thái đơn hàng.
- **Hủy đơn:** Xử lý các yêu cầu hủy đơn từ khách hàng.

### 📊 Báo cáo & Phân tích
- **Dashboard thống kê:** Biểu đồ doanh thu, số lượng đơn hàng theo ngày/tháng.
- **Phân tích tài chính:** Tính toán tổng giá trị kho hàng, biên lợi nhuận trên từng mã hàng.
- **Báo cáo sản phẩm:** Thống kê các sản phẩm bán chạy nhất.

---

## 🤖 3. Chức năng Nâng cao & Kỹ thuật

### 🔌 BFF & Hiệu năng
- **Redis Caching:** Lưu trữ tạm thời các request GET (Sản phẩm, Danh mục) giúp tốc độ phản hồi cực nhanh (~100ms).
- **Auto Proxy:** Tự động chuyển tiếp yêu cầu từ Frontend sang Backend mà không lộ địa chỉ backend thật.
- **Case Conversion:** Tự động chuyển đổi dữ liệu giữa `camelCase` (Frontend) và `snake_case` (Backend).

### 📱 Trải nghiệm người dùng
- **PWA (Progressive Web App):** Cho phép cài đặt ứng dụng vào điện thoại và hoạt động một phần khi offline.
- **Dark Mode:** Hỗ trợ giao diện tối/sáng tự động theo hệ điều hành.
- **AI Chatbot:** Tích hợp trợ lý ảo hỗ trợ khách hàng 24/7 (ChatWidget).
- **Blockchain/NFT:** Tích hợp ví Orbis và quản lý NFT cho các bộ sưu tập đặc biệt.

---

## 📜 Cam kết chất lượng
Hệ thống được phát triển với tinh thần **Clean Code**, dễ dàng bảo trì và mở rộng thêm các tính năng như Livestream, Hệ thống thành viên (Loyalty) trong tương lai.
