package com.badminton.model;

/**
 * Lớp đại diện cho Tài Khoản Người Dùng trong hệ thống.
 * Phân quyền 3 vai trò (RBAC):
 * - ADMIN: Quản trị viên cấp cao (Tạo và cấp quyền tài khoản cho Chủ Sân).
 * - OWNER: Chủ sân (Quản lý các sân được gán, duyệt đơn, check-in, xem doanh thu).
 * - USER: Khách hàng (Tìm sân, đặt lịch, thanh toán, xem vé).
 */
public class User {
    private String id;
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private String email;
    private String role; // ADMIN, OWNER, USER
    private String managedCourtIds; // Ví dụ: "C1,C2" (Dành cho Chủ Sân)
    private String createdAt;

    public User() {}

    public User(String id, String username, String password, String fullName, String phone, String email, String role, String managedCourtIds, String createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.role = role;
        this.managedCourtIds = managedCourtIds;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getManagedCourtIds() { return managedCourtIds; }
    public void setManagedCourtIds(String managedCourtIds) { this.managedCourtIds = managedCourtIds; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String toJson() {
        return String.format(
            "{\"id\":\"%s\",\"username\":\"%s\",\"fullName\":\"%s\",\"phone\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"managedCourtIds\":\"%s\",\"createdAt\":\"%s\"}",
            id, escape(username), escape(fullName), escape(phone), escape(email), role, escape(managedCourtIds != null ? managedCourtIds : ""), createdAt
        );
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
