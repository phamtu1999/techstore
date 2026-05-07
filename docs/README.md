# Tech Store - Tài liệu tổng hợp dự án

Tài liệu này tổng hợp nhanh cấu trúc và chức năng chính của dự án **Tech Store** dựa trên mã nguồn hiện có.

## 1. Tổng quan

Tech Store là một hệ thống thương mại điện tử cho sản phẩm công nghệ, tổ chức theo 3 khối chính:

- `frontend`: giao diện người dùng với React + Vite
- `backend`: API nghiệp vụ chính với Spring Boot
- `bff`: lớp trung gian BFF dùng NestJS

Ngoài ra dự án còn có cấu hình Docker, CI/CD và các tài nguyên triển khai.

## 2. Công nghệ chính

### Frontend
- React 18
- Vite
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Framer Motion
- Recharts
- Three.js / React Three Fiber cho các hiệu ứng 3D
- Axios cho gọi API

### Backend
- Java 17
- Spring Boot 3.2.x
- Spring Security
- Spring Data JPA
- WebSocket
- Redis
- PostgreSQL
- Spring WebFlux cho các tác vụ HTTP bất đồng bộ
- Actuator, Mail, Prometheus metrics

### BFF
- NestJS
- TypeScript
- Kiến trúc proxy / transform / auth service

## 3. Cấu trúc thư mục cấp cao

### `frontend`
Chứa toàn bộ giao diện và trạng thái client.

- `src/pages`: các trang chính như Home, Products, Cart, Checkout, Admin...
- `src/components`: component tái sử dụng cho UI, dashboard, admin, chat, checkout...
- `src/api`: lớp gọi API theo từng domain
- `src/store`: Redux slices cho auth, cart, products, orders, wishlist, analytics...
- `src/styles`: style toàn cục và theme
- `public`: tài nguyên tĩnh

### `backend`
Chứa toàn bộ API và nghiệp vụ.

- `controller`: định nghĩa endpoint theo domain
- `service`: xử lý nghiệp vụ
- `repository`: truy cập dữ liệu
- `entity`: mô hình database
- `dto`: dữ liệu vào/ra giữa các tầng
- `security`, `config`: bảo mật và cấu hình ứng dụng
- `src/main/resources/db/migration`: migration SQL
- `src/test`: test unit và integration

### `bff`
Lớp trung gian phục vụ proxy, transform dữ liệu và xử lý auth phía trung gian.

## 4. Các module nghiệp vụ chính

### 4.1 Sản phẩm
- Quản lý sản phẩm, biến thể, hình ảnh, thuộc tính
- Trang public hiển thị danh sách, chi tiết, bộ lọc, gợi ý
- Trang admin cho CRUD, lọc, cập nhật trạng thái

### 4.2 Giỏ hàng và thanh toán
- Quản lý cart và cart item
- Checkout, mã giảm giá, thanh toán, kết quả thanh toán
- Tích hợp VNPay thông qua cấu hình riêng

### 4.3 Đơn hàng
- Tạo đơn hàng, lịch sử đơn, quản lý trạng thái
- Admin có màn hình thống kê, in hóa đơn, lọc đơn

### 4.4 Người dùng và xác thực
- Đăng ký, đăng nhập, quên mật khẩu, đổi mật khẩu
- JWT, OAuth2, remember-me, 2FA, quản lý session
- Hồ sơ cá nhân, địa chỉ, wishlist

### 4.5 Thông báo và chat
- Notification realtime / trung tâm thông báo
- Chat hỗ trợ khách hàng và livestream
- WebSocket được dùng cho các tương tác realtime

### 4.6 Khuyến mãi và loyalty
- Coupon, flash sale, điểm thưởng / loyalty
- Quản trị mã giảm giá và ưu đãi

### 4.7 Kho, backup, log, settings
- Quản lý nhập/xuất kho, phiếu nhập, giao dịch kho
- Sao lưu dữ liệu, lịch backup
- Cấu hình hệ thống, maintenance mode, log hệ thống, export lịch sử đăng nhập

### 4.8 Analytics
- Dashboard tổng quan
- Sản phẩm bán chạy, KPI, insight, biểu đồ doanh thu
- Recommendation service cho gợi ý sản phẩm

## 5. Luồng xử lý tổng quát

1. Frontend gọi API qua lớp `src/api`.
2. BFF hoặc Backend tiếp nhận request tùy luồng triển khai.
3. Controller nhận request và chuyển cho service.
4. Service xử lý nghiệp vụ, truy vấn repository.
5. Repository thao tác với database.
6. DTO được trả về client dưới dạng JSON.

## 6. Các file cấu hình quan trọng

- `docker-compose.yml`: dựng môi trường dịch vụ
- `README.md`: mô tả tổng quan dự án
- `frontend/vite.config.js`: cấu hình frontend build/dev
- `backend/src/main/resources/application.yml`: cấu hình backend runtime
- `backend/pom.xml`: dependency và build backend
- `bff/package.json`: dependency và script BFF
- `.github/workflows/maven.yml`: workflow CI

## 7. Kiểm thử

Backend có nhiều lớp test:
- unit test cho service
- controller test
- integration test cho auth, cart, order, inventory, admin

BFF cũng có test cơ bản bằng Jest/E2E.

## 8. Nhận xét nhanh

Dự án có độ bao phủ chức năng khá rộng, đặc biệt ở các mảng:
- thương mại điện tử đầy đủ luồng mua hàng
- quản trị hệ thống
- realtime chat / livestream
- bảo mật và theo dõi phiên
- backup, log, analytics, recommendation

Nếu cần, có thể chia tiếp tài liệu trong thư mục `docs` thành từng file chuyên đề để dễ bảo trì.
