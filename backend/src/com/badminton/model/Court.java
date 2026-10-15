package com.badminton.model;

/**
 * Lớp đại diện cho Sân Cầu Lông trong hệ thống.
 * Áp dụng nguyên lý Hướng đối tượng: Đóng gói (Encapsulation).
 * Bổ sung thông tin địa chỉ (Tỉnh/Thành, Quận/Huyện, Tên cụm sân, Loại sân)
 * phục vụ quy trình nghiệp vụ tìm kiếm và đặt sân 5 bước.
 */
public class Court {
    private String id;
    private String name;
    private String floorType;    // Thảm Yonex BWF, Thảm Enlio Pro, Thảm PVC cao cấp
    private String lighting;     // Đèn LED chống chói 300-350 Lux
    private double basePrice;    // Giá cơ bản/giờ (VND)
    private String status;       // ACTIVE, MAINTENANCE
    private String province;     // TP. Hồ Chí Minh, Hà Nội, Đà Nẵng, Bình Dương
    private String district;     // Quận 10, Quận Bình Thạnh, Cầu Giấy, Hải Châu...
    private String facilityName; // Cụm Sân Cầu Lông Kỳ Hòa Arena, Cầu Giấy Arena...
    private String courtType;    // VIP, PRO, STANDARD
    private String address;      // Địa chỉ chi tiết số nhà, tên đường

    public Court() {}

    public Court(String id, String name, String floorType, String lighting, double basePrice, String status) {
        this(id, name, floorType, lighting, basePrice, status, "TP. Hồ Chí Minh", "Quận 10", "Cụm Sân Cầu Lông Kỳ Hòa", "VIP", "238 Đường 3/2, Quận 10, TP.HCM");
    }

    public Court(String id, String name, String floorType, String lighting, double basePrice, String status,
                 String province, String district, String facilityName, String courtType, String address) {
        this.id = id;
        this.name = name;
        this.floorType = floorType;
        this.lighting = lighting;
        this.basePrice = basePrice;
        this.status = status;
        this.province = province;
        this.district = district;
        this.facilityName = facilityName;
        this.courtType = courtType;
        this.address = address;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFloorType() { return floorType; }
    public void setFloorType(String floorType) { this.floorType = floorType; }

    public String getLighting() { return lighting; }
    public void setLighting(String lighting) { this.lighting = lighting; }

    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getCourtType() { return courtType; }
    public void setCourtType(String courtType) { this.courtType = courtType; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String toJson() {
        return String.format(
            "{\"id\":\"%s\",\"name\":\"%s\",\"floorType\":\"%s\",\"lighting\":\"%s\",\"basePrice\":%.0f,\"status\":\"%s\",\"province\":\"%s\",\"district\":\"%s\",\"facilityName\":\"%s\",\"courtType\":\"%s\",\"address\":\"%s\"}",
            id, escape(name), escape(floorType), escape(lighting), basePrice, status,
            escape(province), escape(district), escape(facilityName), escape(courtType), escape(address)
        );
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
