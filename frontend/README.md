# 🎨 FRONTEND CLIENTS (WEB & MOBILE)
>
> **Môn học:** Phát Triển Phần Mềm Hướng Đối Tượng (OOAD / PTPMHĐT)  
> **Thành phần:** Toàn bộ giao diện tương tác người dùng (Client-Side)  

---

## 📂 CẤU TRÚC THƯ MỤC FRONTEND

```text
frontend/
├── web_app/               # Ứng dụng Web Đa Cổng (HTML5, Vanilla CSS Glassmorphism, ES6 JS)
│   ├── index.html         # Cổng Khách Hàng: Đặt lịch, ma trận sân thời gian thực, combo nước/vợt/cầu, vé QR
│   ├── style.css          # Hệ thống giao diện thể thao Dark Mode, Glassmorphism & Micro-animations
│   ├── app.js             # Logic giỏ hàng, đặt cọc giữ chỗ, phân quyền người dùng
│   ├── shared.js          # Hub điều hướng dùng chung giữa 3 cổng
│   ├── logo.png           # Logo biểu trưng hệ thống
│   │
│   ├── owner/             # Cổng Đối Tác Chủ Sân
│   │   ├── index.html     # Bảng điều khiển quản lý sân, quét mã QR khách đến sân, thống kê ca
│   │   ├── owner.js       # Đồng bộ dữ liệu sân thời gian thực
│   │   └── owner.css      # Giao diện chủ sân
│   │
│   └── admin/             # Cổng Quản Trị Viên Hệ Thống
│       ├── index.html     # Phân quyền tài khoản (User/Owner/Admin), quản lý cụm sân, doanh thu
│       ├── admin.js       # Logic CRUD tài khoản & sân
│       └── admin.css      # Giao diện quản trị
│
└── mobile_app/            # Ứng dụng Di Động (Dự kiến phát triển theo TaskList)
    └── README.md          # Kế hoạch & Kiến trúc Mobile Client
```
