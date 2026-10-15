package com.badminton.strategy;

import com.badminton.model.Court;
import com.badminton.model.TimeSlot;
import java.util.List;

/**
 * Cài đặt thuật toán tính giá sân cầu lông:
 * - Khung giờ thường (06:00 - 17:00, 21:00 - 22:00): Giá cơ sở (basePrice)
 * - Khung giờ cao điểm (17:00 - 21:00): Giá cơ sở + 25,000 VND / giờ
 * - Phụ thu cuối tuần: +15,000 VND / giờ nếu là thứ 7 hoặc Chủ Nhật
 */
public class BadmintonPricingStrategy implements PricingStrategy {

    @Override
    public double calculateSlotPrice(Court court, String startTime, String endTime, boolean isWeekend) {
        double price = court.getBasePrice();

        // Kiểm tra giờ cao điểm: Từ 17:00 đến 21:00
        int hour = 0;
        try {
            hour = Integer.parseInt(startTime.split(":")[0]);
        } catch (Exception ignored) {}

        if (hour >= 17 && hour < 21) {
            price += 25000.0; // Phụ thu giờ vàng cầu lông
        }

        if (isWeekend) {
            price += 15000.0; // Phụ thu cuối tuần
        }

        return price;
    }

    @Override
    public double calculateTotal(List<TimeSlot> slots, double serviceTotal) {
        double courtSum = 0;
        if (slots != null) {
            for (TimeSlot s : slots) {
                courtSum += s.getPrice();
            }
        }
        return courtSum + serviceTotal;
    }
}
