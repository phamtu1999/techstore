# Tóm tắt chi tiết từng phần của dự án Tech Store

## 1. Tổng quan dự án
Tech Store là một nền tảng thương mại điện tử bán sản phẩm công nghệ, linh kiện và phụ kiện, được tổ chức theo mô hình đa tầng với 3 phần chính:

- `frontend`: giao diện người dùng và trang quản trị.
- `backend`: xử lý nghiệp vụ, bảo mật, dữ liệu và tích hợp dịch vụ.
- `bff`: lớp trung gian proxy/API gateway nhẹ để chuẩn hóa giao tiếp giữa frontend và backend.

Dự án có phạm vi khá rộng: mua hàng, giỏ hàng, thanh toán, đơn hàng, đánh giá, wishlist, thông báo, livestream/chat, analytics, inventory, backup, settings và các tính năng quản trị hệ thống.

---

## 2. Phần Frontend

### 2.1 Công nghệ và mục tiêu
Frontend được xây dựng bằng React + Vite, kết hợp Redux Toolkit để quản lý trạng thái, React Router để điều hướng, Tailwind CSS để styling, cùng nhiều thư viện hỗ trợ trải nghiệm giao diện như Framer Motion, Recharts, SweetAlert2, Three.js và các gói 3D viewer.

Mục tiêu của frontend là:

- Cung cấp trải nghiệm mua sắm mượt mà cho người dùng.
- Tách bạch rõ giao diện khách hàng và giao diện quản trị.
- Tái sử dụng component tối đa để dễ bảo trì.
- Đồng bộ dữ liệu với backend qua các lớp API riêng cho từng domain.

### 2.2 Cấu trúc thư mục chính

#### `src/pages`
Chứa các trang theo luồng nghiệp vụ:

- Trang khách hàng: home, products, product detail, cart, checkout, orders, profile, wishlist, notifications, compare, livestream.
- Trang auth: login, register, forgot password, reset password.
- Trang admin: dashboard, products, orders, users, inventory, analytics, settings, coupons, logs, brands, categories, security settings, livestreams.

Mỗi trang thường là điểm ghép các component nhỏ hơn, giữ logic UI ở mức trang và đẩy nghiệp vụ xuống component hoặc store/API.

#### `src/components`
Chứa các thành phần giao diện tái sử dụng:

- Thành phần layout: header, sidebar, layout tổng, scroll-to-top.
- Thành phần home: hero banner, flash sale, features.
- Thành phần sản phẩm: product card, product skeleton, wishlist button, 3D viewer.
- Thành phần đơn hàng: order list, order detail modal, review modal, invoice print.
- Thành phần admin: stats card, table, pagination, search filter, dashboard widgets, product form modal, inventory rows.
- Thành phần chat/thông báo: chat widget, notification dropdown.
- Thành phần profile, checkout, review, toast, compare bar, theme toggle.

Điểm đáng chú ý là frontend không chỉ là một SPA đơn thuần mà còn có nhiều vùng UI phức tạp phục vụ vận hành nội bộ.

#### `src/api`
Đây là lớp giao tiếp với backend. Mỗi file API thường gắn với một domain:

- `auth.js`, `users.js`, `products.js`, `cart.js`, `orders.js`, `payments.js`
- `reviews.js`, `wishlist.js`, `notifications.js`, `analytics.js`
- `livestream.js`, `chat.js`, `settings.js`, `logs.js`, `securityAPI.js`
- `files.js`, `backups.js`, `recommendations.js`, `categories.js`, `brands.js`, `coupons.js`, `profile.js`, `loyalty.js`

Cách tổ chức này giúp frontend có lớp trung gian rõ ràng, hạn chế việc gọi API trực tiếp rải rác trong component.

#### `src/store`
Redux slices được tách theo domain như:

- `auth`, `cart`, `wishlist`, `orders`, `products`
- `notifications`, `analytics`, `recommendations`, `livestream`, `reviews`, `comparison`

Điều này cho thấy frontend có nhiều trạng thái dùng chung giữa nhiều màn hình, đặc biệt là giỏ hàng, tài khoản, thông báo và dữ liệu sản phẩm.

#### `src/hooks`, `src/utils`, `src/styles`
- `hooks`: debounce, theme, chat.
- `utils`: axios instance, lỗi API, helper UI, fallback ảnh.
- `styles`: stylesheet chung, theme, custom admin orders CSS.

### 2.3 Điểm nổi bật ở frontend

- Có phân tách khách hàng và admin khá rõ.
- Có hỗ trợ dark/light theme.
- Có trải nghiệm nâng cao như compare bar, 3D product viewer, livestream, chat widget, toast, modal, lazy image.
- Có các thành phần quản trị phong phú để theo dõi đơn hàng, tồn kho, người dùng, thống kê và nhật ký.
- Có khả năng mở rộng tốt nhờ cấu trúc component + slice + API theo domain.

---

## 3. Phần Backend

### 3.1 Công nghệ và mục tiêu
Backend được xây dựng bằng Spring Boot 3.2.x, dùng Java 17, Spring Security, Spring Data JPA, WebSocket, Redis, OAuth2 client, WebFlux, Actuator, Mail, AOP và các thư viện hỗ trợ xử lý nghiệp vụ như POI, CSV, Bucket4j, Cloudinary, Caffeine, JJWT.

Mục tiêu của backend là:

- Cung cấp REST API và một số endpoint realtime.
- Xử lý toàn bộ nghiệp vụ thương mại điện tử.
- Đảm bảo bảo mật, phân quyền, rate limiting và logging.
- Hỗ trợ các chức năng admin, báo cáo, vận hành và tiện ích hệ thống.

### 3.2 Kiến trúc lớp
Backend đi theo cấu trúc quen thuộc:

- `controller`: nhận request từ client.
- `service`: chứa nghiệp vụ chính.
- `repository`: truy cập dữ liệu.
- `entity`: mô hình dữ liệu ánh xạ DB.
- `dto`: dữ liệu truyền qua API.
- `config`, `security`, `exception`, `utils`: cấu hình và hạ tầng dùng chung.

Cấu trúc này cho thấy backend được tổ chức khá chặt chẽ, phù hợp với một hệ thống có nhiều chức năng nghiệp vụ.

### 3.3 Các module nghiệp vụ chính

#### Auth và bảo mật
Bao gồm:

- đăng nhập, đăng ký, quên mật khẩu, đổi mật khẩu
- JWT authentication
- OAuth2
- 2FA / security settings
- session management, login history, remember-me token
- rate limiting cho public API

Đây là một trong những phần quan trọng nhất của hệ thống vì vừa phục vụ khách hàng vừa phục vụ quản trị viên.

#### Sản phẩm, danh mục, thương hiệu
Các module này xử lý:

- CRUD sản phẩm, biến thể, ảnh, thuộc tính
- lọc, tìm kiếm, phân trang, truy vấn danh sách hiển thị
- quản lý category/brand
- admin product form, product admin service, product query service

Phần sản phẩm có vẻ là trung tâm của dự án, vì nhiều module khác xoay quanh dữ liệu sản phẩm.

#### Giỏ hàng và đơn hàng
Bao gồm:

- cart service/controller/repository
- checkout request/response
- order command/query service
- coupon validation
- order history, reorder, invoice, order status

Đây là luồng chuyển đổi từ hành vi mua sắm sang doanh thu, nên được thiết kế thành nhiều lớp nghiệp vụ riêng biệt.

#### Thanh toán
- payment controller/service/repository
- payment result, payment status, payment method
- tích hợp VnPay utils và config

Phần này cho thấy hệ thống hỗ trợ thanh toán điện tử và có thể mở rộng sang nhiều phương thức khác.

#### Review, wishlist, loyalty, notification
- review service/controller/repository
- wishlist service/controller/repository
- loyalty service và transaction
- notification service/controller/repository
- email service

Nhóm chức năng này tăng tính tương tác và giữ chân khách hàng.

#### Inventory và quản trị kho
- inventory service, command/query service, transaction service
- receipt, transaction, stock history
- admin inventory pages và rows

Phần này phù hợp với mô hình bán hàng thực tế, nơi tồn kho cần được theo dõi chặt chẽ.

#### Backup, settings, logs, maintenance
- backup scheduler/service/controller/repository
- store settings service/controller/repository
- system logs, maintenance, file upload, excel export
- admin logs, settings, broadcast notification

Đây là nhóm tính năng vận hành hệ thống, thường xuất hiện ở các hệ thống lớn hoặc có nhu cầu quản trị nội bộ.

#### Chat, livestream, analytics, recommendation
- chat controller/service
- livestream controller/service/repository
- analytics controller/service
- recommendation controller/service
- websocket config

Đây là nhóm tính năng nâng cao, giúp hệ thống có thêm tương tác realtime, phân tích kinh doanh và gợi ý sản phẩm.

### 3.4 Dữ liệu và mô hình miền
Backend có nhiều entity/dto/repository cho các domain:

- user, role, address, profile, security settings
- product, product image, variant, attribute, specification
- order, order item, order history, coupon
- cart, cart item
- inventory receipt, inventory transaction
- payment, payment status/method
- review, review image
- notification
- wishlist
- flash sale
- backup, system log
- livestream, chat message

Điều này cho thấy hệ thống được mô hình hóa khá sát với nghiệp vụ thực tế của một cửa hàng công nghệ.

### 3.5 Bảo mật và hạ tầng
Backend có nhiều lớp bảo vệ và hạ tầng hỗ trợ:

- JWT filter và security config
- public API rate limiting
- logging aspect và rate limiting aspect
- Redis config cho cache/session/limiting
- WebSocket config
- application config và VnPay config
- global exception handler

Các thành phần này giúp hệ thống ổn định hơn khi vận hành thực tế.

### 3.6 Kiểm thử
Backend có cả unit test và integration test cho nhiều module:

- auth
- product
- cart
- order
- inventory
- admin
- user service

Điều này là dấu hiệu tốt vì các nghiệp vụ thương mại điện tử thường dễ phát sinh lỗi khi thay đổi.

---

## 4. Phần BFF

### 4.1 Vai trò
Thư mục `bff` là một lớp backend-for-frontend bằng NestJS. Vai trò chính của nó là:

- Nhận request từ frontend.
- Điều phối hoặc chuẩn hóa dữ liệu trước khi đi tới backend chính.
- Tách bớt logic tích hợp khỏi frontend.
- Có thể đóng vai trò proxy hoặc lớp trung gian cho một số luồng API.

### 4.2 Cấu trúc chính
Có các thành phần đáng chú ý:

- `auth`: module/service/controller cho xác thực.
- `proxy`: module/service/controller cho chuyển tiếp request.
- `common`: utility và transform/interceptor.
- `app.module.ts`, `main.ts` để khởi động ứng dụng.

BFF không lớn bằng backend chính nhưng đóng vai trò quan trọng trong việc chuẩn hóa API và tổ chức tích hợp.

---

## 5. Hạ tầng triển khai và DevOps

### 5.1 Docker và môi trường chạy
Dự án có `docker-compose.yml`, cho thấy hệ thống được thiết kế để chạy đồng bộ nhiều thành phần:

- frontend
- backend
- cơ sở dữ liệu
- Redis hoặc các dịch vụ hỗ trợ khác nếu có

### 5.2 CI/CD và kiểm thử tự động
Có workflow GitHub Actions cho Maven, chứng tỏ backend có khả năng được kiểm tra tự động khi có thay đổi.

### 5.3 Cấu hình build theo từng phần
- Frontend có `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `nginx.conf`.
- Backend có `pom.xml`, `application.yml`, migration SQL.
- BFF có `package.json`, `nest-cli.json`, `tsconfig`.

Điều này cho thấy dự án được tách riêng môi trường build cho từng service.

---

## 6. Dòng nghiệp vụ tổng quát của hệ thống

Một luồng điển hình trong dự án có thể hiểu như sau:

1. Người dùng thao tác trên frontend.
2. Frontend gọi API qua lớp `src/api`.
3. Request đi qua BFF nếu cần chuẩn hóa hoặc proxy.
4. Backend controller nhận request.
5. Service xử lý nghiệp vụ, kiểm tra bảo mật và làm việc với repository.
6. Repository truy xuất dữ liệu từ database.
7. Backend trả DTO về frontend.
8. Frontend render dữ liệu và cập nhật state nếu cần.

Luồng này áp dụng cho các nghiệp vụ như đăng nhập, xem sản phẩm, thêm giỏ hàng, thanh toán, xem đơn hàng, đánh giá, quản lý kho và admin dashboard.

---

## 7. Đánh giá tổng quan

### Điểm mạnh
- Phạm vi chức năng rất rộng, gần như bao phủ đầy đủ một hệ thống ecommerce hoàn chỉnh.
- Tổ chức mã theo module tương đối rõ ràng.
- Có đầy đủ phần khách hàng, admin, vận hành và báo cáo.
- Có các tính năng nâng cao như livestream, chat, recommendation, backup, settings, logs.
- Có test và cấu hình hạ tầng khá đầy đủ.

### Điểm cần lưu ý
- Dự án lớn nên mức độ phức tạp cao, cần tài liệu hóa tốt để tránh khó bảo trì.
- Nhiều module nghiệp vụ đồng nghĩa với việc cần chuẩn hóa naming, DTO, và luồng xử lý giữa frontend/backend/BFF.
- Nếu mở rộng thêm, nên tiếp tục duy trì tách domain rõ ràng để tránh phình to component hoặc service.

---

## 8. Kết luận
Tech Store là một dự án ecommerce quy mô khá lớn, có kiến trúc ba lớp rõ ràng giữa frontend, backend và BFF. Hệ thống không chỉ phục vụ mua bán cơ bản mà còn có nhiều năng lực nâng cao như quản trị kho, thanh toán, bảo mật, livestream, thông báo, phân tích dữ liệu và backup hệ thống.

Tổng thể, đây là một nền tảng được xây dựng theo hướng có thể vận hành thực tế và mở rộng trong tương lai.
