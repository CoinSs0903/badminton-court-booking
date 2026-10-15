package com.badminton.model;

/**
 * Lớp đại diện cho Khách hàng đặt sân.
 */
public class Customer {

    private String fullName;
    private String phone;
    private String email;

    public Customer() {
    }

    public Customer(String fullName, String phone, String email) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String toJson() {
        return String.format(
                "{\"fullName\":\"%s\",\"phone\":\"%s\",\"email\":\"%s\"}",
                escape(fullName), escape(phone), escape(email)
        );
    }

    private String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\"", "\\\"");
    }
}
