# 🏸 HỆ THỐNG QUẢN LÝ & ĐẶT SÂN CẦU LÔNG (BADMINTON BOOKING SYSTEM)

> **Môn học:** Phát Triển Phần Mềm Hướng Đối Tượng (OOAD / PTPMHĐT)  
> **Tác giả:** CoinSs0903  
> **Ngôn ngữ & Công nghệ:** Java SE (Standard Edition 17), REST API, HTML5/CSS3/JavaScript (Single Page Application - SPA), Docker  

---

## 🌟 TỔNG QUAN HỆ THỐNG

Ứng dụng quản lý và đặt sân cầu lông trực tuyến tích hợp đầy đủ 3 phân hệ người dùng theo mô hình hướng đối tượng:
1. **Khách hàng (User):** Xem danh sách sân theo thời gian thực, lọc theo tiêu chuẩn (thảm BWF, đèn chiếu sáng, sân trong nhà/ngoài trời), chọn khung giờ (TimeSlot), đặt sân kèm các dịch vụ phụ trợ (thuê vợt, ống cầu, nước giải khát), thanh toán và nhận mã QR Check-in.
2. **Chủ sân (Owner):** Theo dõi lịch đặt sân, duyệt đơn, khóa khung giờ để bảo trì sân hoặc tiếp nhận khách trực tiếp.
3. **Quản trị viên (Admin):** Quản lý toàn bộ danh sách sân, thống kê doanh thu, quản lý tài khoản người dùng và thiết lập bảng giá.

---

## 🏛️ KIẾN TRÚC HƯỚNG ĐỐI TƯỢNG (OOP DESIGN PATTERNS)

Hệ thống được thiết kế theo các nguyên lý phân tích hướng đối tượng (OOAD) và áp dụng các mẫu thiết kế:
- **Singleton Pattern:** Quản lý kho dữ liệu `DataStore` dùng chung, đảm bảo tính nhất quán dữ liệu thời gian thực giữa Web Khách hàng, Chủ sân và Quản trị viên.
- **Strategy Pattern:** `PricingStrategy` và `BadmintonPricingStrategy` linh hoạt tính toán phụ thu theo khung giờ cao điểm (Peak-hour) và cuối tuần.
- **Thread-Safety & Multi-threading:** `BookingService` sử dụng cơ chế đồng bộ hóa luồng (`synchronized`) để chống đặt trùng slot (Race Condition) khi nhiều khách hàng cùng bấm đặt một lúc.
- **Phân tách trách nhiệm (Separation of Concerns):** Phân chia rõ ràng các tầng `model`, `repository`, `service`, `strategy` và `server`.

---

## 👥 TÀI KHOẢN TRUY CẬP MẪU

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Khách hàng (User)** | `user` | `user123` | Đặt sân, xem lịch sử, check-in QR |
| **Chủ sân (Owner)** | `owner` | `owner123` | Quản lý sân, duyệt đơn, bảo trì slot |
| **Quản trị viên (Admin)** | `admin` | `admin123` | Quản lý hệ thống, doanh thu, phân quyền |

---

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

### Cách 1: Chạy trực tiếp trên máy tính (Local)
1. Đảm bảo máy tính đã cài đặt **Java JDK 8+** (khuyên dùng JDK 17).
2. Nhấp đúp vào file `run_all.bat` (hoặc chạy lệnh trong terminal):
   ```bash
   run_all.bat
   ```
3. Mở trình duyệt và truy cập:
   - **Giao diện Khách hàng:** `http://localhost:8088/`
   - **Giao diện Chủ sân:** `http://localhost:8088/owner`
   - **Giao diện Quản trị viên:** `http://localhost:8088/admin`

---

### Cách 2: Chạy bằng Docker
```bash
docker build -t badminton-booking .
docker run -p 8088:8088 badminton-booking
```

---

### Cách 3: Triển khai 24/7 lên Render.com (Miễn phí)
1. Đăng nhập vào [Render.com](https://render.com) bằng tài khoản GitHub.
2. Chọn **New +** > **Web Service**.
3. Chọn kho lưu trữ `badminton-court-booking`.
4. Render sẽ tự động nhận diện `Dockerfile` và triển khai.
5. Ứng dụng sẽ có link công khai trực tuyến 24/7.
