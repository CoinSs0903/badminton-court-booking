package com.badminton.strategy;

import com.badminton.model.Court;
import com.badminton.model.TimeSlot;
import java.util.List;

/**
 * Interface áp dụng Strategy Pattern cho việc tính giá sân và dịch vụ.
 * Cho phép linh hoạt mở rộng bảng giá (ngày lễ, giờ cao điểm, khách VIP).
 */
public interface PricingStrategy {
    double calculateSlotPrice(Court court, String startTime, String endTime, boolean isWeekend);
    double calculateTotal(List<TimeSlot> slots, double serviceTotal);
}
