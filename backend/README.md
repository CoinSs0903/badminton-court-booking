# ⚙️ BACKEND REST API SERVER (JAVA SE)
>
> **Môn học:** Phát Triển Phần Mềm Hướng Đối Tượng (OOAD / PTPMHĐT)  
> **Ngôn ngữ:** Java SE (Standard Edition 8+)  
> **Cổng dịch vụ:** `http://localhost:8088`  

---

## 🏛️ KIẾN TRÚC HƯỚNG ĐỐI TƯỢNG (OOP)

Mã nguồn nằm trong gói `src/com/badminton/` gồm 5 tầng phân tách rõ ràng:

1. **`model/` (Thực thể hướng đối tượng):**
   - `Court`: Thực thể sân cầu lông (thảm BWF, đèn chiếu sáng, trạng thái).
   - `TimeSlot`: Khung giờ đặt (Slot 1 giờ, trạng thái AVAILABLE / BOOKED / MAINTENANCE).
   - `Booking`: Đơn đặt sân (thông tin khách, danh sách slot, tiện ích phụ trợ, tổng tiền, mã QR check-in).
   - `User`: Tài khoản người dùng phân quyền 3 vai trò (ADMIN, OWNER, USER).
   - `ServiceItem`: Dịch vụ phụ trợ (thuê vợt, ống cầu, nước giải khát, quấn cán).

2. **`repository/` (Kho lưu trữ dữ liệu):**
   - `DataStore`: Mẫu thiết kế **Singleton Pattern** quản lý dữ liệu in-memory, đồng bộ thời gian thực giữa Web Khách hàng, Chủ sân và Quản trị viên.

3. **`service/` (Nghiệp vụ & An toàn đa luồng):**
   - `BookingService`: Xử lý nghiệp vụ đặt sân, khóa slot đồng thời (`synchronized`), hủy sân và check-in QR.

4. **`strategy/` (Mẫu thiết kế Chiến lược - Strategy Pattern):**
   - `PricingStrategy`: Giao diện tính toán giá sân linh hoạt.
   - `BadmintonPricingStrategy`: Cài đặt thuật toán phụ thu giờ cao điểm (Peak-hour) và cuối tuần.

5. **`server/` (Máy chủ HTTP & REST API):**
   - `BadmintonHttpServer`: Máy chủ HTTP đa luồng (`Executors.newFixedThreadPool(16)`).
   - `ApiHandler`: Bộ định tuyến REST API (JSON).
   - `StaticFileHandler`: Bộ phân giải tài nguyên tĩnh (HTML/CSS/JS) cho Front-end.

---

## 🛠️ HƯỚNG DẪN BIÊN DỊCH & CHẠY THỦ CÔNG

```bash
# Biên dịch
javac -encoding UTF-8 -d bin -sourcepath src src/com/badminton/server/BadmintonHttpServer.java

# Chạy máy chủ
java -cp bin com.badminton.server.BadmintonHttpServer 8088
```

Hoặc nhấp đúp vào `run_backend.bat`.
