# 📝 Nhật Ký Lỗi & Khắc Phục (Error Log)

## 📅 Ngày: 04/05/2026
### 🔴 Lỗi: `Could not resolve placeholder 'JWT_SECRET_KEY'`

**Chi tiết lỗi:**
Khi chạy lệnh `mvn spring-boot:run`, ứng dụng bị crash với lỗi:
`Caused by: java.lang.IllegalArgumentException: Could not resolve placeholder 'JWT_SECRET_KEY' in value "${JWT_SECRET_KEY}"`

**Nguyên nhân:**
Spring Boot không tự động nạp tệp `.env` từ thư mục gốc của dự án khi lệnh được thực thi bên trong thư mục con `backend/`.

**Cách khắc phục:**
1. **Cách 1 (Nhanh nhất):** Chạy lệnh kèm theo biến môi trường trực tiếp trong terminal:
   ```powershell
   $env:JWT_SECRET_KEY="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"; mvn spring-boot:run
   ```
2. **Cách 2 (Khuyên dùng):** Cài đặt tiện ích mở rộng như **"Env-Pane"** trong VS Code hoặc sử dụng lệnh nạp `.env` trước khi chạy.
3. **Cách 3 (Dành cho Dev):** Copy nội dung tệp `.env` vào một tệp mới tên là `.env` đặt trực tiếp bên trong thư mục `backend/`.


## 📅 Ngày: 04/05/2026
### 🔴 Lỗi: `Connection to localhost:5432 refused`

**Chi tiết lỗi:**
Ứng dụng báo lỗi không thể kết nối tới Database tại `localhost:5432`.

**Nguyên nhân:**
Các biến `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PORT`... chưa được nạp vào môi trường terminal nên Spring Boot sử dụng giá trị mặc định (`localhost:5432`).

**Cách khắc phục:**
Sử dụng lệnh PowerShell (v3) để nạp biến một cách chính xác nhất:
```powershell
Get-Content ..\.env | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object { $name, $value = $_.Split('=', 2); Set-Content "env:$($name.Trim())" ($value.Trim()) }; mvn spring-boot:run
```
 
 ## 📅 Ngày: 04/05/2026
 ### 🟢 Chuyển đổi: Di chuyển từ Cloudinary sang Supabase Storage
 
 **Mục tiêu:** Gỡ bỏ phụ thuộc vào Cloudinary để sửa lỗi startup và tập trung hạ tầng vào Supabase.
 
 **Các thay đổi đã thực hiện:**
 1. **Kiến trúc:** Tạo interface `StorageService` để trừu tượng hóa logic lưu trữ.
 2. **Tích hợp:** Triển khai `SupabaseStorageService` sử dụng `WebClient` gọi REST API của Supabase Storage.
 3. **Refactor:** Cập nhật `UploadService` và hệ thống `Backup` (sao lưu DB) sang sử dụng Supabase.
 4. **Dọn dẹp:** Xóa bỏ `CloudinaryConfig.java` và `CloudinaryAdapter.java`.
 
 **Kết quả:** 
 - Ứng dụng khởi động ổn định (đã sửa lỗi `BeanCreationException`).
 - Đã kiểm tra biên dịch bằng `mvn clean compile` thành công.
 
 **Lưu ý quan trọng:** Cần đảm bảo `SUPABASE_SERVICE_ROLE_KEY` trong tệp `.env` là chính xác để tính năng upload hoạt động.
