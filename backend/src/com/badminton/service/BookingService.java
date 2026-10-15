package com.badminton.service;

import com.badminton.model.*;
import com.badminton.repository.DataStore;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Lớp nghiệp vụ cốt lõi xử lý Đặt Sân Cầu Lông (BookingService).
 * Đảm bảo tính nhất quán (ACID-like transaction) khi khách hàng giữ chỗ & đặt slot.
 */
public class BookingService {
    private final DataStore dataStore = DataStore.getInstance();

    public synchronized Booking createBooking(
            String customerName,
            String customerPhone,
            String customerEmail,
            String courtId,
            String date,
            List<String> slotIds,
            List<String> serviceItemIds,
            String paymentMethod) throws Exception {

        Court court = dataStore.getCourtById(courtId);
        if (court == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin sân cầu lông!");
        }

        if (slotIds == null || slotIds.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 khung giờ chơi!");
        }

        // 1. Kiểm tra tính khả dụng của từng slot
        List<TimeSlot> selectedSlots = new ArrayList<TimeSlot>();
        for (String slotId : slotIds) {
            TimeSlot slot = dataStore.getSlotById(slotId);
            if (slot == null) {
                throw new IllegalArgumentException("Khung giờ không hợp lệ: " + slotId);
            }
            if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
                throw new IllegalStateException("Khung giờ " + slot.getStartTime() + " - " + slot.getEndTime() + " đã có người đặt!");
            }
            selectedSlots.add(slot);
        }

        // 2. Tính tiền sân
        double courtFee = 0;
        for (TimeSlot s : selectedSlots) {
            courtFee += s.getPrice();
        }

        // 3. Tính tiền dịch vụ & phụ kiện
        double serviceFee = 0;
        List<String> serviceNames = new ArrayList<String>();
        if (serviceItemIds != null) {
            for (String sId : serviceItemIds) {
                for (ServiceItem item : dataStore.getServices()) {
                    if (item.getId().equalsIgnoreCase(sId)) {
                        serviceFee += item.getUnitPrice();
                        serviceNames.add(item.getName());
                        break;
                    }
                }
            }
        }

        double totalAmount = courtFee + serviceFee;

        // 4. Khóa slot (Cập nhật sang BOOKED)
        for (TimeSlot s : selectedSlots) {
            s.setStatus("BOOKED");
        }

        // 5. Tạo đơn đặt mới
        String randomSuffix = String.format("%04d", new Random().nextInt(10000));
        String dateCompact = date.replace("-", "").substring(2);
        String bookingCode = "BDM-" + dateCompact + "-" + randomSuffix;

        Customer customer = new Customer(customerName, customerPhone, customerEmail);
        Booking booking = new Booking(bookingCode, customer, courtId, court.getName(), date);
        booking.setSlots(selectedSlots);
        booking.setServiceNames(serviceNames);
        booking.setCourtFee(courtFee);
        booking.setServiceFee(serviceFee);
        booking.setTotalAmount(totalAmount);
        booking.setPaymentMethod(paymentMethod != null ? paymentMethod : "QR_VNPAY");
        booking.setPaymentStatus("PAID");
        booking.setStatus("CONFIRMED");

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        booking.setCreatedAt(sdf.format(new Date()));

        dataStore.addBooking(booking);

        return booking;
    }

    public synchronized boolean checkIn(String bookingCode) {
        Booking booking = dataStore.getBookingByCode(bookingCode);
        if (booking != null && "CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("CHECKED_IN");
            return true;
        }
        return false;
    }

    public synchronized boolean cancelBooking(String bookingCode) {
        Booking booking = dataStore.getBookingByCode(bookingCode);
        if (booking != null && !"CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("CANCELLED");
            // Nhả lại các slot sân về trạng thái AVAILABLE
            for (TimeSlot slot : booking.getSlots()) {
                TimeSlot stored = dataStore.getSlotById(slot.getSlotId());
                if (stored != null) {
                    stored.setStatus("AVAILABLE");
                }
            }
            return true;
        }
        return false;
    }
}
