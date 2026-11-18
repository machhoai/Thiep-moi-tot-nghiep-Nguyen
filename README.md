# Thiệp mời tốt nghiệp Mỹ Nguyên

Thiệp mời và trang quản trị viết bằng Next.js App Router, TypeScript, GSAP và SQLite. Nội dung khởi tạo lấy từ thiết kế đính kèm. Lịch tháng và bộ đếm ngược cập nhật theo ngày, giờ tổ chức trong admin, theo giờ Việt Nam.

## Chạy trên máy

Yêu cầu Node.js 22.13 trở lên.

```powershell
npm ci
npm run dev
```

- Thiệp mời ở [http://localhost:3000](http://localhost:3000).
- Trang quản trị ở [http://localhost:3000/admin](http://localhost:3000/admin). Dùng giá trị `ADMIN_PASSWORD` trong `.env.local` để đăng nhập.
- Nếu chạy từ một bản sao mới, tạo `.env.local` từ `.env.example`. Đặt mật khẩu dài ít nhất 12 ký tự và tạo khóa phiên ngẫu nhiên bằng lệnh `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Điền kết quả vào `ADMIN_SESSION_SECRET` rồi khởi động lại máy chủ.

## Quản lý thiệp

- **Phản hồi** hiển thị khách mời, lựa chọn tham dự, lời chúc, thời điểm gửi và số lượng theo lựa chọn.
- **Nội dung** chỉnh sửa tên, ngày giờ, địa điểm, lịch trình, thư và lời chào cuối. Nhập lịch trình mỗi hoạt động một dòng, ví dụ `14:30 | Chụp ảnh kỷ niệm`.
- **Hình ảnh** thay ảnh bìa, thêm hoặc xóa ảnh album. Admin nhận ảnh JPG, PNG hoặc WebP tối đa 8 MB rồi chuyển sang WebP.

## Ảnh và dữ liệu

- `public/assets/images/` chứa ảnh bìa, ảnh trường và album mặc định được cắt từ bản thiết kế. Có thể thay ảnh mặc định bằng bản gốc cùng đường dẫn nếu có file độ phân giải cao hơn.
- `data/invitation.sqlite` được tạo khi chạy lần đầu. SQLite lưu nội dung, album, ảnh tải lên và phản hồi. Có thể chỉ định thư mục dữ liệu qua `DATA_DIR`. Dùng cơ chế backup SQLite hoặc dừng ứng dụng trước khi sao lưu thư mục dữ liệu.
- Kiểm tra bản production bằng `npm run build` và chạy bằng `npm start`. Khi triển khai, dùng máy chủ Node.js có ổ đĩa ghi được và lưu bền vững cho `DATA_DIR`, HTTPS cho phiên quản trị và biến môi trường riêng cho production.
