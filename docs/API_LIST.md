# 🚀 Techstore - Danh Sách API Endpoints

Hệ thống API của Techstore được xây dựng trên chuẩn **RESTful** với tiền tố mặc định là `/api/v1`.

## 🔐 Xác Thực & Bảo Mật (Authentication)

| Endpoint | Method | Mô tả | Role |
|:---|:---:|:---|:---|
| `/api/v1/auth/register` | `POST` | Đăng ký tài khoản mới | Public |
| `/api/v1/auth/login` | `POST` | Đăng nhập hệ thống (trả về JWT) | Public |
| `/api/v1/auth/refresh` | `POST` | Làm mới Access Token bằng Refresh Token | Public |
| `/api/v1/auth/logout` | `POST` | Đăng xuất và hủy token | ✅ User |
| `/api/v1/auth/introspect` | `POST` | Kiểm tra tính hợp lệ của token | ✅ User |

## 📦 Sản Phẩm & Danh Mục (Public Catalog)

| Endpoint | Method | Mô tả | Role |
|:---|:---:|:---|:---|
| `/api/v1/products` | `GET` | Tìm kiếm và liệt kê sản phẩm (phân trang, lọc) | Public |
| `/api/v1/products/{slug}` | `GET` | Xem chi tiết sản phẩm qua Slug | Public |
| `/api/v1/categories` | `GET` | Lấy danh sách danh mục (phân cấp) | Public |
| `/api/v1/brands` | `GET` | Lấy danh sách thương hiệu | Public |

## 🛒 Đơn Hàng & Giỏ Hàng (User Operations)

| Endpoint | Method | Mô tả | Role |
|:---|:---:|:---|:---|
| `/api/v1/cart` | `GET` | Lấy nội dung giỏ hàng hiện tại | ✅ User |
| `/api/v1/cart/add` | `POST` | Thêm sản phẩm vào giỏ | ✅ User |
| `/api/v1/cart/update` | `PUT` | Cập nhật số lượng sản phẩm | ✅ User |
| `/api/v1/orders/checkout` | `POST` | Tạo đơn hàng mới (Thanh toán) | ✅ User |
| `/api/v1/orders/my-orders` | `GET` | Xem lịch sử đơn hàng của cá nhân | ✅ User |
| `/api/v1/orders/{id}` | `GET` | Xem chi tiết đơn hàng | ✅ User |
| `/api/v1/wishlist` | `GET` | Lấy danh sách sản phẩm yêu thích | ✅ User |

## 💳 Thanh Toán (Payments)

| Endpoint | Method | Mô tả | Role |
|:---|:---:|:---|:---|
| `/api/v1/payments/vnpay-url` | `GET` | Lấy link thanh toán VNPay cho đơn hàng | ✅ User |
| `/api/v1/payments/vnpay-ipn` | `GET` | Callback xử lý kết quả từ VNPay | Public |

## 🛠️ Quản Trị Hệ Thống (Admin APIs)

Tất cả các API này yêu cầu quyền `ADMIN` hoặc `SUPER_ADMIN`.

| Endpoint | Method | Mô tả |
|:---|:---:|:---|
| `/api/v1/admin/products` | `POST/PUT/DELETE` | Quản lý sản phẩm (thêm, sửa, xóa) |
| `/api/v1/admin/users` | `GET/PUT` | Quản lý người dùng, phân quyền, khóa tài khoản |
| `/api/v1/admin/security/settings`| `GET/PUT` | Cấu hình bảo mật hệ thống (2FA, Password Policy) |
| `/api/v1/admin/security/sessions`| `GET/DELETE` | Quản lý các phiên đăng nhập đang hoạt động |
| `/api/v1/admin/backups` | `GET/POST` | Quản lý sao lưu và phục hồi dữ liệu |
| `/api/v1/admin/analytics` | `GET` | Thống kê doanh thu, KPI và báo cáo |

---
*Lưu ý: Để biết chi tiết về Request Body và Response, vui lòng tham khảo mã nguồn trong thư mục `backend/src/main/java/com/techstore/controller`.*
