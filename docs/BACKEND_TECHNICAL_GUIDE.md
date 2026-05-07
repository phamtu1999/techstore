# 📘 BACKEND TECHNICAL GUIDE - TECH STORE V2

Tài liệu này cung cấp cái nhìn chi tiết nhất về logic nghiệp vụ và cấu trúc của từng module trong hệ thống Backend.

---

## 🔐 1. Module Bảo Mật & Xác Thực (Auth & Security)

Hệ thống sử dụng cơ chế **Stateless Authentication** dựa trên **JWT (JSON Web Token)**.

- **`JwtService.java`**: Chịu trách nhiệm tạo (generate) mã Token sau khi khách hàng đăng nhập thành công. Nó chứa các thuật toán mã hóa để "gói" thông tin User Email và Quyền hạn (Roles) vào một chuỗi ký tự an toàn.
- **`AuthService.java`**: Chứa logic "Hợp đồng lao động" của người dùng:
  - `register`: Mã hóa mật khẩu bằng BCrypt trước khi lưu vào DB.
  - `authenticate`: Kiểm tra mật khẩu và cấp Token.
- **`SecuritySettingsService.java`**: Cho phép Admin cấu hình các tính năng bảo mật như: Tắt/Mở đăng ký, giới hạn số lần đăng nhập sai, hoặc cấu hình chính sách mật khẩu.

---

## 🛒 2. Module Đơn Hàng & Thanh Toán (Order & Payment)

Đây là module phức tạp nhất, nắm giữ "dòng tiền" của hệ thống.

- **`Order.java` (Entity)**: Lưu trữ trạng thái đơn hàng thông qua Enum `OrderStatus`. 
  - Nghiệp vụ: Trạng thái không thể nhảy từ `PENDING` sang `DELIVERED` ngay mà phải đi qua các bước như `CONFIRMED`, `SHIPPING`.
- **`PaymentService.java`**: Tích hợp cổng thanh toán **VNPay**. 
  - Logic: Hệ thống sẽ tạo một `paymentUrl`, khách hàng sang trang VNPay thanh toán, sau đó VNPay gọi ngược lại hệ thống qua một URL `callback`. Hệ thống sẽ kiểm tra chữ ký (signature) để xác nhận tiền đã vào tài khoản chưa trước khi cập nhật đơn hàng thành `PAID`.
- **`CartService.java`**: Quản lý giỏ hàng trong Database nhưng có cơ chế đồng bộ thông minh giúp kết hợp với giỏ hàng offline (localStorage) khi khách hàng đăng nhập.

---

## 🛍️ 3. Module Sản Phẩm & Biến Thể (Product & Inventory)

Tư duy thiết kế theo hướng "Customizable Products".

- **`Product.java` & `ProductVariant.java`**: Một sản phẩm (ví dụ iPhone 15) có thể có nhiều biến thể (128GB, 256GB - Màu Xanh, Màu Titan). 
  - Khác biệt: Mỗi biến thể có giá (`price`) và số lượng kho (`stock`) riêng biệt.
- **`ProductAttribute.java`**: Lưu trữ các thông số kỹ thuật (Ram, Chip, Màn hình). Điều này cho phép khách hàng lọc sản phẩm theo cấu hình một cách chuyên sâu.
- **`CategoryService.java`**: Quản lý danh mục theo cấu trúc cây (Tree Structure). Tức là một danh mục "Laptop" có thể chứa "Laptop Gaming", "Laptop Văn Phòng".

---

## 🤖 4. Module Trợ Lý AI Chatbot

Xử lý ngôn ngữ tự nhiên cơ bản và phản hồi thông minh.

- **`ChatService.java`**: Đóng vai trò là "Tổng đài viên ảo".
  - **Keyword Mapping**: Nó không chỉ tìm từ khóa mà còn ánh xạ (map) trạng thái đơn hàng sang ngôn ngữ tự nhiên. (Ví dụ: Trình trạng `SHIPPING` trong DB sẽ được nói với khách là "Đơn hàng đang trên đường đến với bạn").
  - **Product Linking**: Chatbot có khả năng sinh ra các đường dẫn (links) trực tiếp đến trang sản phẩm nếu nó tìm thấy kết quả phù hợp, giúp tăng tỷ lệ chuyển đổi.

---

## 🎥 5. Module Livestream (Bán hàng trực tiếp)

Tính năng hiện đại bậc nhất của Tech Store v2.

- **`Livestream.java`**: Lưu trữ thông tin về phiên live đang diễn ra, liên kết với ID của video (thường từ YouTube/Facebook).
- **`LivestreamService.java`**: Quản lý danh sách sản phẩm được ghim (pinned) trong phiên live. Khi Admin ghim một sản phẩm, nó sẽ được đẩy lên đầu giao diện người dùng để khách có thể mua ngay mà không cần rời phiên live.

---

## 🔔 6. Module Thông Báo (Notifications)

- **`NotificationService.java`**: Hệ thống sẽ tự động bắn thông báo khi:
  - Có đơn hàng mới (Admin nhận).
  - Trạng thái đơn hàng thay đổi (Khách nhận).
  - Có đánh giá mới hoặc livestream sắp diễn ra.
- **Logic Múi Giờ**: Toàn bộ mốc thời gian được lưu dưới dạng `Instant` (UTC) và được `BackendApplication` cấu hình mặc định là `Asia/Ho_Chi_Minh` để hiển thị chuẩn xác nhất cho thị trường Việt Nam.

---

## 🛠️ Quy Trình Phối Hợp

Khi một sự kiện xảy ra (Ví dụ: Khách đặt hàng):
1. `OrderService` tạo đơn hàng.
2. `NotificationService` nhận tín hiệu và tạo thông báo.
3. `EmailService` (nếu có) gửi mail xác nhận.
4. `LivestreamService` có thể cập nhật lại số lượng hàng khuyến mãi nếu sản phẩm đó đang trong phiên Live.

---
*Tài liệu này được biên soạn bởi Antigravity để hỗ trợ quản trị hệ thống Tech Store v2.*
