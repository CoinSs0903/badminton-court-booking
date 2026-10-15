package com.badminton.model;

/**
 * Lớp đại diện cho Khung giờ của từng sân cầu lông trong 1 ngày cụ thể.
 * Trạng thái: AVAILABLE (Còn trống), BOOKED (Đã đặt), HELD (Đang giữ chỗ)
 */
public class TimeSlot {
    private String slotId;     // Ví dụ: COURT1_2026-10-13_17:00
    private String courtId;
    private String date;       // YYYY-MM-DD
    private String startTime;  // 17:00
    private String endTime;    // 18:00
    private boolean isPeakHour;// true nếu khung giờ vàng (17:00 - 21:00)
    private double price;      // Giá áp dụng sau khi tính phụ thu giờ vàng
    private String status;     // AVAILABLE, BOOKED, HELD

    public TimeSlot() {}

    public TimeSlot(String slotId, String courtId, String date, String startTime, String endTime, boolean isPeakHour, double price, String status) {
        this.slotId = slotId;
        this.courtId = courtId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isPeakHour = isPeakHour;
        this.price = price;
        this.status = status;
    }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getCourtId() { return courtId; }
    public void setCourtId(String courtId) { this.courtId = courtId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public boolean isPeakHour() { return isPeakHour; }
    public void setPeakHour(boolean peakHour) { isPeakHour = peakHour; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String toJson() {
        return String.format(
            "{\"slotId\":\"%s\",\"courtId\":\"%s\",\"date\":\"%s\",\"startTime\":\"%s\",\"endTime\":\"%s\",\"isPeakHour\":%b,\"price\":%.0f,\"status\":\"%s\"}",
            slotId, courtId, date, startTime, endTime, isPeakHour, price, status
        );
    }
}
