# 🏸 PROJECT 2: ỨNG DỤNG ĐẶT LỊCH SÂN THỂ THAO (PHASE 1: CẦU LÔNG)
## Bảng Phân Công & Danh Sách Công Việc (Task List)

> **Môn học:** Phát Triển Phần Mềm Hướng Đối Tượng (OOAD / PTPMHĐT)  
> **Chủ đề:** Hệ thống đặt lịch sân thể thao trực tuyến - Khởi đầu với **Sân Cầu Lông (Badminton Court Booking)**, thiết kế theo kiến trúc hướng đối tượng mở rộng cho các môn thể thao khác (Bóng đá, Pickleball, Tennis...).  
> **Ngày cập nhật:** 13/10/2026  
> **Trạng thái:** 🔴 Chưa bắt đầu

---

## 🎯 1. BÀI TOÁN & NGHIỆP VỤ CỐT LÕI (CẦU LÔNG)
- **Người dùng (Khách đặt sân):**
  - Tìm kiếm sân cầu lông theo vị trí (quận/huyện), mức giá, đánh giá.
  - Xem sơ đồ sân trực quan theo thời gian thực (Sân 1, Sân 2,... trạng thái: Còn trống / Đã đặt / Đang bảo trì).
  - Chọn khung giờ (Slot theo ca: ví dụ 17:00 - 18:00, 18:00 - 19:00, giờ vàng / giờ thường).
  - Đặt lịch vãng lai (theo ngày) hoặc lịch cố định theo tháng (đặc thù cầu lông).
  - Thuê vợt, mua cầu lông, nước uống kèm theo đơn đặt sân.
  - Thanh toán online (QR Momo / VNPAY / Ngân hàng) hoặc đặt cọc giữ chỗ.
  - Nhận vé đặt sân (Mã QR check-in tại sân).
  - Đánh giá chất lượng sân (sàn thảm, ánh sáng, độ thoáng, nhân viên).

- **Chủ sân / Quản lý cụm sân (Yard Manager):**
  - Quản lý danh sách sân con, thiết lập bảng giá theo khung giờ (Peak/Off-peak).
  - Bật/tắt trạng thái sân, khoá sân bảo trì.
  - Quét mã QR check-in khách đến sân.
  - Bán dịch vụ phụ trợ tại chỗ (nước, cầu, thuê giày/vợt).
  - Thống kê doanh thu, tỷ lệ lấp đầy sân theo ngày/tuần/tháng.

---

## 📋 PHASE 1: Phân Tích Yêu Cầu Nghiệp Vụ (Requirements Analysis)

| # | Mã Task | Tên công việc chi tiết | Sản phẩm bàn giao | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|-------------------|-----------|------------|----------|
| 1.1 | REQ-01 | Khảo sát quy trình đặt sân cầu lông thực tế (đặt vãng lai, lịch cố định, chính sách hủy sân/cọc) | Báo cáo nghiệp vụ khảo sát | | ⬜ Chưa làm | |
| 1.2 | REQ-02 | Lập danh sách yêu cầu chức năng (FR) cho 3 actor: Khách hàng, Chủ sân, Quản trị hệ thống | Bảng Functional Requirements | | ⬜ Chưa làm | |
| 1.3 | REQ-03 | Lập danh sách yêu cầu phi chức năng (NFR): Tốc độ xử lý concurrent booking (chống trùng lịch cùng 1 slot), bảo mật thanh toán | Bảng NFR | | ⬜ Chưa làm | |
| 1.4 | REQ-04 | Viết tài liệu đặc tả yêu cầu phần mềm (SRS Document - Software Requirement Specification) | File SRS_Document.docx/.pdf | | ⬜ Chưa làm | |
| 1.5 | REQ-05 | Xây dựng User Persona (Người chơi phong trào, Người quản lý sân, Người tìm kèo giao lưu) | Persona Sheets | | ⬜ Chưa làm | |

---

## 📐 PHASE 2: Phân Tích & Thiết Kế Hướng Đối Tượng (OOAD & Architecture)

| # | Mã Task | Tên công việc chi tiết | Sản phẩm bàn giao | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|-------------------|-----------|------------|----------|
| 2.1 | OOD-01 | Xây dựng sơ đồ Use Case tổng quát và Use Case chi tiết (Đặt sân, Thanh toán, Check-in, Hủy lịch) | Use Case Diagram + Specs | | ⬜ Chưa làm | |
| 2.2 | OOD-02 | Thiết kế Sơ đồ Lớp phân tích (Domain Model / Conceptual Class Diagram): `Sport`, `Facility`, `BadmintonCourt`, `TimeSlot`, `Booking`, `Payment`, `ServiceItem` | Class Diagram (Domain) | | ⬜ Chưa làm | |
| 2.3 | OOD-03 | Thiết kế Sơ đồ Tuần tự (Sequence Diagram): Kịch bản Tìm sân & Lock slot tạm thời, Kịch bản Thanh toán & Xác nhận đặt sân | Sequence Diagrams | | ⬜ Chưa làm | |
| 2.4 | OOD-04 | Thiết kế Sơ đồ Trạng thái (State Machine Diagram): Vòng đời của một đơn đặt sân `Pending -> Held -> Confirmed -> CheckedIn -> Completed / Cancelled` | State Machine Diagram | | ⬜ Chưa làm | |
| 2.5 | OOD-05 | Ứng dụng Design Patterns (Strategy: tính giá giờ vàng/giờ thường; Factory: sinh loại sân/môn thể thao; Observer: thông báo lịch đặt) | Tài liệu kiến trúc mẫu thiết kế | | ⬜ Chưa làm | |
| 2.6 | OOD-06 | Thiết kế CSDL quan hệ (ERD - Physical & Logical Data Model) | ERD Diagram + Script SQL | | ⬜ Chưa làm | |
| 2.7 | OOD-07 | Thiết kế đặc tả RESTful API cho Mobile App (Swagger/Postman Collection) | API Documentation | | ⬜ Chưa làm | |

---

## 🎨 PHASE 3: Thiết Kế UI/UX (Mobile App Figma)

| # | Mã Task | Tên công việc chi tiết | Màn hình / Thành phần | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|----------------------|-----------|------------|----------|
| 3.1 | UI-01 | Wireframe luồng đặt sân (User Flow & Lo-fi Wireframes) | Flowchart & Low-fi | | ⬜ Chưa làm | |
| 3.2 | UI-02 | Thiết kế Design System: Palette màu thể thao (Xanh mint / Cam năng động), Typography, Badge trạng thái sân | UI Kit | | ⬜ Chưa làm | |
| 3.3 | UI-03 | Thiết kế màn hình Khám phá sân & Bộ lọc (Bộ lọc theo quận, mặt thảm Yonex/Enlio, có máy lạnh/đèn chống chói) | Screen: Home & Filter | | ⬜ Chưa làm | |
| 3.4 | UI-04 | Thiết kế màn hình Ma trận chọn giờ (Time Slot Grid & Court Map) trực quan theo thời gian thực | Screen: Court Schedule Grid | | ⬜ Chưa làm | |
| 3.5 | UI-05 | Thiết kế màn hình Chọn dịch vụ mua kèm (Nước suối, cầu ống, thuê vợt) & Giỏ hàng | Screen: Add-on Services | | ⬜ Chưa làm | |
| 3.6 | UI-06 | Thiết kế màn hình Checkout, QR Code Thanh toán & Vé điện tử Check-in | Screen: Payment & E-Ticket | | ⬜ Chưa làm | |
| 3.7 | UI-07 | Thiết kế màn hình Lịch sử đặt sân & Chi tiết đơn đặt, Hủy / Đổi giờ | Screen: Booking History | | ⬜ Chưa làm | |
| 3.8 | UI-08 | Hoàn thiện Prototype tương tác trên Figma | Figma Interactive Link | | ⬜ Chưa làm | |

---

## 💻 PHASE 4: Lập Trình Frontend Mobile App (Flutter / React Native / Android)

| # | Mã Task | Tên công việc chi tiết | Thành phần / Module | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|--------------------|-----------|------------|----------|
| 4.1 | APP-01 | Khởi tạo dự án Mobile, cấu hình Navigation, Theme, State Management (Bloc/Provider/Redux) | Base Project Setup | | ⬜ Chưa làm | |
| 4.2 | APP-02 | Module Auth: Đăng nhập/Đăng ký qua SĐT/Google, Quên mật khẩu | Auth Screens | | ⬜ Chưa làm | |
| 4.3 | APP-03 | Module Trang chủ: Banner khuyến mãi, danh sách sân cầu lông gần bạn (GPS/Location) | Home Page & Location | | ⬜ Chưa làm | |
| 4.4 | APP-04 | Module Chi tiết sân: Thư viện ảnh sân, tiện ích (chỗ để xe, phòng tắm, căn tin), đánh giá | Court Detail View | | ⬜ Chưa làm | |
| 4.5 | APP-05 | **Module Ma trận đặt lịch (Core):** Chọn ngày -> Chọn sân -> Chọn khung giờ (Slot booking matrix), khóa tạm thời 10 phút | Interactive Booking Matrix | | ⬜ Chưa làm | |
| 4.6 | APP-06 | Module Dịch vụ đi kèm: Thêm cầu lông, đồ uống vào hóa đơn | Add-on Selection View | | ⬜ Chưa làm | |
| 4.7 | APP-07 | Module Thanh toán: Tích hợp hiển thị VietQR / Cổng thanh toán / Ví điện tử | Payment View | | ⬜ Chưa làm | |
| 4.8 | APP-08 | Module Vé đặt sân: Hiển thị mã QR Check-in, thông tin sân, nút chỉ đường Google Maps | E-Ticket & Maps Integration | | ⬜ Chưa làm | |
| 4.9 | APP-09 | Module Quản lý lịch đặt của tôi: Tab Sắp diễn ra / Đã hoàn thành / Đã hủy | My Bookings View | | ⬜ Chưa làm | |
| 4.10 | APP-10 | Module Thông báo: Push notification nhắc nhở trước giờ chơi 1 tiếng | Local & Push Notifications | | ⬜ Chưa làm | |

---

## ⚙️ PHASE 5: Lập Trình Backend & Cơ Sở Dữ Liệu

| # | Mã Task | Tên công việc chi tiết | Thành phần / Module | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|--------------------|-----------|------------|----------|
| 5.1 | BE-01 | Khởi tạo Backend service, ORM, cấu hình database (PostgreSQL/MySQL/MongoDB) | Base Server Architecture | | ⬜ Chưa làm | |
| 5.2 | BE-02 | API Quản lý cụm sân và sân con (CRUD Sân cầu lông, bảng giá giờ cao điểm/thấp điểm) | Facility & Court Service | | ⬜ Chưa làm | |
| 5.3 | BE-03 | **API Quản lý Slot & Giải quyết Concurrent Booking** (Cơ chế Lock Slot tránh 2 người cùng đặt 1 sân 1 giờ) | Concurrency & Slot Engine | | ⬜ Chưa làm | |
| 5.4 | BE-04 | API Đặt sân & Tính tổng tiền (Tiền sân + Tiền giờ vàng + Tiền dịch vụ phát sinh) | Booking & Pricing Service | | ⬜ Chưa làm | |
| 5.5 | BE-05 | API Thanh toán (Webhook callback từ cổng thanh toán / xác thực QR chuyển khoản) | Payment Gateway Webhook | | ⬜ Chưa làm | |
| 5.6 | BE-06 | API Quét mã QR Check-in (Dành cho chủ sân xác nhận khách đã đến) | Check-in Service | | ⬜ Chưa làm | |
| 5.7 | BE-07 | Background Job: Tự động nhả Slot nếu khách không thanh toán trong 10 phút; Gửi thông báo nhắc giờ | Cronjobs / Worker | | ⬜ Chưa làm | |

---

## 🧪 PHASE 6: Kiểm Thử & Tối Ưu (Testing & QA)

| # | Mã Task | Tên công việc chi tiết | Loại kiểm thử | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|---------------|-----------|------------|----------|
| 6.1 | TEST-01 | Unit Test các hàm tính tiền sân cầu lông và logic kiểm tra trùng lịch | Unit Testing | | ⬜ Chưa làm | |
| 6.2 | TEST-02 | Test kịch bản 2 người cùng bấm đặt 1 slot sân trong cùng 1 giây | Concurrency / Race Condition | | ⬜ Chưa làm | |
| 6.3 | TEST-03 | Kiểm thử luồng đặt sân end-to-end từ mobile app đến thanh toán thành công | Integration Testing | | ⬜ Chưa làm | |
| 6.4 | TEST-04 | Kiểm thử giao diện hiển thị trên các kích thước màn hình Android & iOS | Responsive UI Test | | ⬜ Chưa làm | |
| 6.5 | TEST-05 | Kiểm thử bảo mật API (JWT token, phân quyền chủ sân vs khách chơi) | Security Testing | | ⬜ Chưa làm | |
| 6.6 | TEST-06 | Fix lỗi, tối ưu tốc độ tải danh sách sân và sơ đồ slot | Bug Fixing & Optimization | | ⬜ Chưa làm | |

---

## 🚀 PHASE 7: Đóng Gói, Triển Khai & Báo Cáo Môn Học (Delivery)

| # | Mã Task | Tên công việc chi tiết | Sản phẩm bàn giao | Phụ trách | Trạng thái | Deadline |
|---|---------|------------------------|-------------------|-----------|------------|----------|
| 7.1 | REL-01 | Deploy Backend API lên Cloud (Render / Railway / AWS / VPS) | Live Server URL | | ⬜ Chưa làm | |
| 7.2 | REL-02 | Build bản cài đặt Mobile App (file `.apk` cho Android) | Release APK File | | ⬜ Chưa làm | |
| 7.3 | DOC-01 | Hoàn thiện Báo cáo Đồ án PTPMHĐT (Đặc tả OOAD, Sơ đồ UML, Kiến trúc, Kết quả) | Báo cáo môn học Word/PDF | | ⬜ Chưa làm | |
| 7.4 | DOC-02 | Chuẩn bị Slide thuyết trình & Kịch bản bảo vệ đồ án | Slide PowerPoint | | ⬜ Chưa làm | |
| 7.5 | DOC-03 | Quay video demo kịch bản đặt sân cầu lông thực tế trên app | Video Demo mp4 | | ⬜ Chưa làm | |

---

## 📈 Tiến Độ Tổng Thể

```
[Phase 1: 5 tasks] ──> [Phase 2: 7 tasks] ──> [Phase 3: 8 tasks] ──> [Phase 4: 10 tasks]
                                                                              │
[Phase 7: 5 tasks] <── [Phase 6: 6 tasks] <── [Phase 5: 7 tasks] <────────────┘
```

- **Tổng số công việc:** 48 tasks chuyên sâu theo đúng nghiệp vụ ứng dụng đặt sân cầu lông & hướng đối tượng.
- **Quy tắc cập nhật trạng thái:**
  - ⬜ **Chưa làm**
  - 🔄 **Đang thực hiện**
  - ✅ **Đã hoàn thành**
