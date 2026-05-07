# TechStore v2 - Hướng dẫn Kiểm thử Giao diện (UI Testing Guide)

Tài liệu này cung cấp các kịch bản kiểm thử (test scenarios) chi tiết cho tất cả các luồng chức năng trên giao diện người dùng của TechStore v2.

---

## 1. Luồng Người dùng (Customer Flow)

### 1.1. Trang chủ & Tìm kiếm
- [ ] **Hiển thị sản phẩm:** Đảm bảo danh sách sản phẩm mới nhất, sản phẩm nổi bật hiển thị đúng hình ảnh, giá và tên.
- [ ] **Tìm kiếm:** Nhập tên sản phẩm vào thanh tìm kiếm. Kết quả trả về phải khớp với từ khóa.
- [ ] **Lọc & Sắp xếp:** Sử dụng bộ lọc theo danh mục, giá cả và sắp xếp theo giá tăng/giảm dần.

### 1.2. Xem Sản phẩm & Biến thể
- [ ] **Chi tiết sản phẩm:** Nhấp vào một sản phẩm, kiểm tra mô tả, hình ảnh và các thông số kỹ thuật.
- [ ] **Chọn biến thể:** Chọn các tùy chọn như Màu sắc, Dung lượng (nếu có). Giá và số lượng tồn kho phải cập nhật tương ứng.
- [ ] **Đánh giá:** Gửi bình luận và đánh giá sao (yêu cầu đăng nhập).

### 1.3. Giỏ hàng & Thanh toán
- [ ] **Thêm vào giỏ:** Thêm sản phẩm từ trang danh sách hoặc trang chi tiết. Giỏ hàng phải cập nhật số lượng ngay lập tức.
- [ ] **Quản lý giỏ hàng:** Tăng/giảm số lượng, xóa sản phẩm khỏi giỏ.
- [ ] **Luồng thanh toán:**
    1. Nhập thông tin giao hàng (Họ tên, Địa chỉ, Số điện thoại).
    2. Chọn phương thức thanh toán (COD, Chuyển khoản).
    3. Kiểm tra mã giảm giá (nếu có).
    4. Xác nhận đơn hàng.
- [ ] **Trạng thái đơn hàng:** Kiểm tra đơn hàng vừa đặt trong mục "Lịch sử đơn hàng".

---

## 2. Luồng Tài khoản (Account Flow)

### 2.1. Đăng ký & Đăng nhập
- [ ] **Đăng ký:** Tạo tài khoản mới với email hợp lệ. Kiểm tra xác thực email (nếu bật).
- [ ] **Đăng nhập:** Đăng nhập bằng email/mật khẩu. Thử trường hợp sai mật khẩu để kiểm tra thông báo lỗi.
- [ ] **Quên mật khẩu:** Sử dụng chức năng đặt lại mật khẩu qua email.

### 2.2. Bảo mật & Hồ sơ
- [ ] **Thông tin cá nhân:** Cập nhật họ tên, số điện thoại, ảnh đại diện.
- [ ] **Đổi mật khẩu:** Thay đổi mật khẩu hiện tại.
- [ ] **Xác thực 2 yếu tố (2FA):** 
    - Bật 2FA bằng ứng dụng (Google Authenticator).
    - Thử đăng nhập lại và nhập mã OTP.
    - Tắt 2FA.

---

## 3. Luồng Quản trị (Admin Flow)

### 3.1. Quản lý Sản phẩm & Danh mục
- [ ] **Danh mục:** Thêm, sửa, xóa danh mục sản phẩm.
- [ ] **Sản phẩm:** 
    - Tạo sản phẩm mới với nhiều biến thể và hình ảnh.
    - Chỉnh sửa thông tin sản phẩm và cập nhật kho hàng.
    - Xóa sản phẩm (Soft delete).

### 3.2. Quản lý Đơn hàng
- [ ] **Danh sách đơn hàng:** Xem tất cả đơn hàng từ khách hàng.
- [ ] **Cập nhật trạng thái:** Chuyển trạng thái đơn hàng (Chờ xác nhận -> Đang xử lý -> Đang giao -> Hoàn thành/Hủy).
- [ ] **In hóa đơn:** Kiểm tra tính năng xuất/in thông tin đơn hàng.

### 3.3. Quản lý Người dùng & Bảo mật
- [ ] **Danh sách người dùng:** Tìm kiếm và lọc người dùng.
- [ ] **Khóa/Mở khóa:** Thử khóa một tài khoản người dùng và kiểm tra xem họ có đăng nhập được không.
- [ ] **Quản lý Phiên (Sessions):** 
    - Xem các phiên đang hoạt động của người dùng.
    - Ngắt một phiên cụ thể hoặc ngắt tất cả các phiên.
- [ ] **Lịch sử đăng nhập:** Xem log đăng nhập, lọc theo trạng thái và xuất báo cáo CSV.

### 3.4. Hệ thống & Sao lưu
- [ ] **Cài đặt bảo mật:** Điều chỉnh cấu hình (thời gian hết hạn token, giới hạn đăng nhập sai).
- [ ] **Sao lưu (Backup):** 
    - Tạo bản sao lưu thủ công.
    - Kiểm tra danh sách bản sao lưu trên Cloudinary.
    - Tải xuống bản sao lưu.

---

## 4. Kiểm thử Hiệu năng & Đáp ứng (Responsive)

- [ ] **Responsive Design:** Kiểm tra giao diện trên Mobile, Tablet và Desktop (sử dụng Chrome DevTools).
- [ ] **Tốc độ tải trang:** Đảm bảo trang chủ và trang sản phẩm tải dưới 2 giây.
- [ ] **Trạng thái Loading:** Kiểm tra các hiệu ứng skeleton/spinner khi dữ liệu đang được tải.

---

## 5. Danh sách Kiểm tra trước khi Release (Checklist)

1. [ ] Không có lỗi Console (F12) trên tất cả các trang chính.
2. [ ] Tất cả các liên kết (Links) đều hoạt động, không có lỗi 404.
3. [ ] Các nút chức năng (Submit, Add to cart) không bị bấm đúp (Double-click issues).
4. [ ] Form validation hoạt động đúng (Email đúng định dạng, các trường bắt buộc không để trống).
