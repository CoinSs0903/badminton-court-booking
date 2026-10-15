package com.badminton.repository;

import com.badminton.model.*;
import com.badminton.strategy.BadmintonPricingStrategy;
import com.badminton.strategy.PricingStrategy;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Lớp lưu trữ dữ liệu trong bộ nhớ (In-Memory Repository),
 * quản lý Courts, TimeSlots, Services và Bookings đồng bộ luồng (Thread-Safe).
 */
public class DataStore {
    private static DataStore instance;

    private final List<Court> courts = new CopyOnWriteArrayList<Court>();
    private final List<ServiceItem> services = new CopyOnWriteArrayList<ServiceItem>();
    private final Map<String, TimeSlot> slotMap = new ConcurrentHashMap<String, TimeSlot>(); // key: slotId
    private final List<Booking> bookings = new CopyOnWriteArrayList<Booking>();
    private final List<User> users = new CopyOnWriteArrayList<User>();

    private final PricingStrategy pricingStrategy = new BadmintonPricingStrategy();

    private DataStore() {
        initSampleData();
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    private void initSampleData() {
        // 0. Danh sách Tài khoản theo 3 Vai trò (ADMIN, OWNER, USER)
        users.add(new User("U1", "admin", "admin123", "Quản Trị Viên", "0901111111", "admin@datlichsport.vn", "ADMIN", "", "2026-10-10 08:00:00"));
        users.add(new User("U2", "owner1", "owner123", "Nguyễn Văn Đạt", "0902222222", "dat.owner@badminton.vn", "OWNER", "C1,C2,C3,C4,C5", "2026-10-11 09:30:00"));
        users.add(new User("U3", "owner2", "owner123", "Lê Hoàng Phúc", "0903333333", "phuc.owner@badminton.vn", "OWNER", "C6,C7,C8,C9,C10,C11", "2026-10-12 14:15:00"));
        users.add(new User("U4", "user", "user123", "Trần Anh Tuấn", "0908123456", "tuan.tuan@gmail.com", "USER", "", "2026-10-13 10:00:00"));

        // 1. Danh sách Sân Cầu Lông (đa dạng tỉnh thành & loại sân cho quy trình 5 bước)
        // TP. Hồ Chí Minh
        courts.add(new Court("C1", "Sân 1 (VIP - Thảm Yonex BWF)", "Thảm Yonex Tiêu Chuẩn Quốc Tế BWF", "Hệ thống đèn LED chống lóa 350 Lux", 120000.0, "ACTIVE",
            "TP. Hồ Chí Minh", "Quận 10", "Cụm Sân Cầu Lông Kỳ Hòa Arena", "VIP", "238 Đường 3/2, Phường 12, Quận 10, TP.HCM"));
        courts.add(new Court("C2", "Sân 2 (Pro - Thảm Enlio Đỏ)", "Thảm Enlio Vân Kim Cương Chống Trượt", "Đèn chiếu sáng chuyên nghiệp 300 Lux", 100000.0, "ACTIVE",
            "TP. Hồ Chí Minh", "Quận 10", "Cụm Sân Cầu Lông Kỳ Hòa Arena", "PRO", "238 Đường 3/2, Phường 12, Quận 10, TP.HCM"));
        courts.add(new Court("C3", "Sân 3 (Thảm PVC Xanh Lá)", "Thảm PVC Dày 5.0mm Giảm Chấn Cực Tốt", "Đèn vòm trần dịu mắt 280 Lux", 90000.0, "ACTIVE",
            "TP. Hồ Chí Minh", "Quận Bình Thạnh", "Sân Cầu Lông Lan Anh Bình Thạnh", "STANDARD", "285 Nơ Trang Long, Phường 13, Bình Thạnh, TP.HCM"));
        courts.add(new Court("C4", "Sân 4 (Thảm PVC Tiêu Chuẩn)", "Thảm Thi Đấu Phong Trào Cao Cấp", "Đèn chiếu sáng chuẩn sân đôi", 90000.0, "ACTIVE",
            "TP. Hồ Chí Minh", "Quận Bình Thạnh", "Sân Cầu Lông Lan Anh Bình Thạnh", "STANDARD", "285 Nơ Trang Long, Phường 13, Bình Thạnh, TP.HCM"));
        courts.add(new Court("C5", "Sân 5 (VIP - Yonex Super Court)", "Thảm Yonex Chuyên Nghiệp 5 Lớp", "Đèn LED thi đấu không bóng mờ 380 Lux", 130000.0, "ACTIVE",
            "TP. Hồ Chí Minh", "Quận 11", "Nhà Thi Đấu Thể Thao Phú Thọ", "VIP", "219 Lý Thường Kiệt, Phường 15, Quận 11, TP.HCM"));

        // Hà Nội
        courts.add(new Court("C6", "Sân Cầu Giấy 1 (VIP - Yonex Champion)", "Thảm Yonex BWF Chống Lóa", "Đèn LED máng công nghệ mới 350 Lux", 125000.0, "ACTIVE",
            "Hà Nội", "Quận Cầu Giấy", "Cụm Sân Cầu Lông Cầu Giấy Arena", "VIP", "35 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội"));
        courts.add(new Court("C7", "Sân Ba Đình 2 (Pro - Enlio Tour)", "Thảm Enlio Vân Cát Cao Cấp", "Hệ thống đèn LED âm trần 320 Lux", 110000.0, "ACTIVE",
            "Hà Nội", "Quận Ba Đình", "Trung Tâm Thể Thao Ba Đình", "PRO", "115 Quán Thánh, Ba Đình, Hà Nội"));
        courts.add(new Court("C8", "Sân Đống Đa 3 (Thảm PVC Tiêu Chuẩn)", "Thảm PVC Thi Đấu Thể Thao", "Đèn vòm góc rộng 290 Lux", 95000.0, "ACTIVE",
            "Hà Nội", "Quận Đống Đa", "CLB Cầu Lông Đống Đa Sport", "STANDARD", "79 Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội"));

        // Đà Nẵng
        courts.add(new Court("C9", "Sân Hải Châu 1 (VIP - Thảm Yonex BWF)", "Thảm Yonex BWF Quốc Tế", "Đèn LED treo cao tiêu chuẩn 350 Lux", 115000.0, "ACTIVE",
            "Đà Nẵng", "Quận Hải Châu", "Cung Thể Thao Tiên Sơn Đà Nẵng", "VIP", "01 Phan Đăng Lưu, Hòa Cường Bắc, Hải Châu, Đà Nẵng"));
        courts.add(new Court("C10", "Sân Sơn Trà 2 (Pro - Thảm Enlio Đỏ)", "Thảm Enlio Chống Trượt Bám Chân", "Đèn chiếu sáng chuyên nghiệp 300 Lux", 95000.0, "ACTIVE",
            "Đà Nẵng", "Quận Sơn Trà", "CLB Cầu Lông Biển Đông Sơn Trà", "PRO", "12 Võ Văn Kiệt, An Hải Đông, Sơn Trà, Đà Nẵng"));

        // Bình Dương
        courts.add(new Court("C11", "Sân Dĩ An 1 (Pro - Thảm Enlio Xanh)", "Thảm Enlio Vân Kim Cương", "Đèn pha thể thao chống chói 300 Lux", 90000.0, "ACTIVE",
            "Bình Dương", "TP. Dĩ An", "Trung Tâm TDTT Dĩ An", "PRO", "Đường số 9, TTHC Dĩ An, Bình Dương"));

        // 2. Danh sách Dịch vụ / Phụ kiện
        services.add(new ServiceItem("S1", "Ống cầu Thành Công (12 quả)", "SHUTTLECOCK", 240000.0, "Ống", "shuttlecock"));
        services.add(new ServiceItem("S2", "Ống cầu Ba Sao đỏ (12 quả)", "SHUTTLECOCK", 210000.0, "Ống", "shuttlecock"));
        services.add(new ServiceItem("S3", "Thuê vợt Yonex Astrox 88D Play", "RENTAL", 35000.0, "Cây / Trận", "racket"));
        services.add(new ServiceItem("S4", "Thuê vợt Lining Tectonic 7", "RENTAL", 30000.0, "Cây / Trận", "racket"));
        services.add(new ServiceItem("S5", "Nước bù khoáng Revive chanh muối", "BEVERAGE", 15000.0, "Chai", "bottle"));
        services.add(new ServiceItem("S6", "Nước Pocari Sweat 500ml", "BEVERAGE", 20000.0, "Chai", "bottle"));
        services.add(new ServiceItem("S7", "Nước suối tinh khiết Aquafina 500ml", "BEVERAGE", 10000.0, "Chai", "water"));
        services.add(new ServiceItem("S8", "Quấn cán vợt VS chính hãng (bao quấn)", "ACCESSORY", 20000.0, "Cái", "grip"));

        // 3. Khởi tạo slots cho ngày hôm nay và ngày mai
        String today = getTodayDate();
        generateSlotsForDate(today);

        // 4. Tạo một đơn đặt mẫu demo
        initDemoBooking(today);
    }

    private void initDemoBooking(String date) {
        TimeSlot slot1 = getOrCreateSlot("C1", date, "18:00", "19:00");
        slot1.setStatus("BOOKED");
        TimeSlot slot2 = getOrCreateSlot("C1", date, "19:00", "20:00");
        slot2.setStatus("BOOKED");

        Booking sampleBooking = new Booking("BDM-261013-DEMO", 
            new Customer("Nguyễn Văn Hùng", "0908123456", "hung.badminton@gmail.com"),
            "C1", "Sân 1 (VIP - Thảm Yonex BWF)", date);

        sampleBooking.getSlots().add(slot1);
        sampleBooking.getSlots().add(slot2);
        sampleBooking.getServiceNames().add("Ống cầu Thành Công (12 quả)");
        sampleBooking.getServiceNames().add("Nước Pocari Sweat 500ml (x2)");
        sampleBooking.setCourtFee(slot1.getPrice() + slot2.getPrice());
        sampleBooking.setServiceFee(280000.0);
        sampleBooking.setTotalAmount(sampleBooking.getCourtFee() + sampleBooking.getServiceFee());
        sampleBooking.setPaymentMethod("QR_VNPAY");
        sampleBooking.setPaymentStatus("PAID");
        sampleBooking.setStatus("CONFIRMED");
        sampleBooking.setCreatedAt("2026-10-13 10:30:00");

        bookings.add(sampleBooking);
    }

    public String getTodayDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(new Date());
    }

    public synchronized void generateSlotsForDate(String date) {
        String[] hours = {
            "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
            "20:00", "21:00"
        };

        for (Court court : courts) {
            for (int i = 0; i < hours.length; i++) {
                String startTime = hours[i];
                int nextHour = Integer.parseInt(startTime.split(":")[0]) + 1;
                String endTime = String.format("%02d:00", nextHour);
                String slotId = String.format("%s_%s_%s", court.getId(), date, startTime);

                if (!slotMap.containsKey(slotId)) {
                    int startH = Integer.parseInt(startTime.split(":")[0]);
                    boolean isPeak = (startH >= 17 && startH < 21);
                    double price = pricingStrategy.calculateSlotPrice(court, startTime, endTime, false);

                    TimeSlot slot = new TimeSlot(slotId, court.getId(), date, startTime, endTime, isPeak, price, "AVAILABLE");
                    slotMap.put(slotId, slot);
                }
            }
        }
    }

    public TimeSlot getOrCreateSlot(String courtId, String date, String startTime, String endTime) {
        String slotId = String.format("%s_%s_%s", courtId, date, startTime);
        TimeSlot slot = slotMap.get(slotId);
        if (slot == null) {
            Court court = getCourtById(courtId);
            double price = court != null ? court.getBasePrice() : 100000.0;
            slot = new TimeSlot(slotId, courtId, date, startTime, endTime, false, price, "AVAILABLE");
            slotMap.put(slotId, slot);
        }
        return slot;
    }

    public List<Court> getCourts() { return courts; }

    public Court getCourtById(String id) {
        for (Court c : courts) {
            if (c.getId().equalsIgnoreCase(id)) return c;
        }
        return null;
    }

    public List<ServiceItem> getServices() { return services; }

    public List<TimeSlot> getSlots(String courtId, String date) {
        generateSlotsForDate(date);
        List<TimeSlot> result = new ArrayList<TimeSlot>();
        for (TimeSlot slot : slotMap.values()) {
            if (slot.getCourtId().equalsIgnoreCase(courtId) && slot.getDate().equals(date)) {
                result.add(slot);
            }
        }
        // Sắp xếp theo giờ tăng dần
        Collections.sort(result, new Comparator<TimeSlot>() {
            @Override
            public int compare(TimeSlot a, TimeSlot b) {
                return a.getStartTime().compareTo(b.getStartTime());
            }
        });
        return result;
    }

    public TimeSlot getSlotById(String slotId) {
        return slotMap.get(slotId);
    }

    public void addBooking(Booking booking) {
        bookings.add(0, booking); // Thêm vào đầu danh sách
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public Booking getBookingByCode(String code) {
        for (Booking b : bookings) {
            if (b.getBookingCode().equalsIgnoreCase(code)) return b;
        }
        return null;
    }

    public List<User> getUsers() {
        return users;
    }

    public List<User> getOwners() {
        List<User> owners = new ArrayList<User>();
        for (User u : users) {
            if ("OWNER".equalsIgnoreCase(u.getRole())) {
                owners.add(u);
            }
        }
        return owners;
    }

    public User authenticate(String username, String password) {
        for (User u : users) {
            if (u.getUsername().equalsIgnoreCase(username) && u.getPassword().equals(password)) {
                return u;
            }
        }
        return null;
    }

    public List<User> getCustomers() {
        List<User> customers = new ArrayList<User>();
        for (User u : users) {
            if ("USER".equalsIgnoreCase(u.getRole())) {
                customers.add(u);
            }
        }
        return customers;
    }

    public synchronized User registerCustomer(String username, String password, String fullName, String phone, String email) throws Exception {
        for (User u : users) {
            if (u.getUsername().equalsIgnoreCase(username)) {
                throw new IllegalArgumentException("Tên đăng nhập '" + username + "' đã được sử dụng!");
            }
        }
        String id = "U" + (users.size() + 1);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        User newCustomer = new User(id, username, password, fullName, phone, email, "USER", "", sdf.format(new Date()));
        users.add(newCustomer);
        return newCustomer;
    }

    public synchronized User createOwner(String username, String password, String fullName, String phone, String email, String managedCourtIds) throws Exception {
        for (User u : users) {
            if (u.getUsername().equalsIgnoreCase(username)) {
                throw new IllegalArgumentException("Tên đăng nhập '" + username + "' đã tồn tại!");
            }
        }
        String id = "U" + (users.size() + 1);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        User newOwner = new User(id, username, password, fullName, phone, email, "OWNER", managedCourtIds, sdf.format(new Date()));
        users.add(newOwner);
        return newOwner;
    }

    public synchronized boolean toggleCourtStatus(String courtId) {
        Court c = getCourtById(courtId);
        if (c != null) {
            if ("ACTIVE".equalsIgnoreCase(c.getStatus())) {
                c.setStatus("MAINTENANCE");
            } else {
                c.setStatus("ACTIVE");
            }
            return true;
        }
        return false;
    }
}
