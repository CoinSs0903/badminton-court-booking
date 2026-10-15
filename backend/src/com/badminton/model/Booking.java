package com.badminton.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Lớp đại diện cho Đơn Đặt Sân Cầu Lông (Booking).
 * Chứa thông tin khách hàng, sân, các khung giờ đã chọn, phụ kiện và tổng tiền.
 */
public class Booking {
    private String bookingCode; // Ví dụ: BDM-20261013-8942
    private Customer customer;
    private String courtId;
    private String courtName;
    private String date;
    private List<TimeSlot> slots = new ArrayList<TimeSlot>();
    private List<String> serviceNames = new ArrayList<String>();
    private double courtFee;
    private double serviceFee;
    private double totalAmount;
    private String paymentMethod; // QR_VNPAY, MOMO, TIEN_MAT
    private String paymentStatus; // PAID, PENDING
    private String status;        // CONFIRMED, CHECKED_IN, CANCELLED
    private String createdAt;

    public Booking() {}

    public Booking(String bookingCode, Customer customer, String courtId, String courtName, String date) {
        this.bookingCode = bookingCode;
        this.customer = customer;
        this.courtId = courtId;
        this.courtName = courtName;
        this.date = date;
    }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getCourtId() { return courtId; }
    public void setCourtId(String courtId) { this.courtId = courtId; }

    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public List<TimeSlot> getSlots() { return slots; }
    public void setSlots(List<TimeSlot> slots) { this.slots = slots; }

    public List<String> getServiceNames() { return serviceNames; }
    public void setServiceNames(List<String> serviceNames) { this.serviceNames = serviceNames; }

    public double getCourtFee() { return courtFee; }
    public void setCourtFee(double courtFee) { this.courtFee = courtFee; }

    public double getServiceFee() { return serviceFee; }
    public void setServiceFee(double serviceFee) { this.serviceFee = serviceFee; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String toJson() {
        StringBuilder slotsJson = new StringBuilder("[");
        for (int i = 0; i < slots.size(); i++) {
            if (i > 0) slotsJson.append(",");
            slotsJson.append(slots.get(i).toJson());
        }
        slotsJson.append("]");

        StringBuilder servicesJson = new StringBuilder("[");
        for (int i = 0; i < serviceNames.size(); i++) {
            if (i > 0) servicesJson.append(",");
            servicesJson.append("\"").append(escape(serviceNames.get(i))).append("\"");
        }
        servicesJson.append("]");

        return String.format(
            "{\"bookingCode\":\"%s\",\"customer\":%s,\"courtId\":\"%s\",\"courtName\":\"%s\",\"date\":\"%s\"," +
            "\"slots\":%s,\"serviceNames\":%s,\"courtFee\":%.0f,\"serviceFee\":%.0f,\"totalAmount\":%.0f," +
            "\"paymentMethod\":\"%s\",\"paymentStatus\":\"%s\",\"status\":\"%s\",\"createdAt\":\"%s\"}",
            bookingCode,
            customer != null ? customer.toJson() : "{}",
            courtId,
            escape(courtName),
            date,
            slotsJson.toString(),
            servicesJson.toString(),
            courtFee,
            serviceFee,
            totalAmount,
            escape(paymentMethod),
            paymentStatus,
            status,
            createdAt
        );
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
