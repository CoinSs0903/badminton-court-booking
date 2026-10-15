package com.badminton.server;

import com.badminton.model.*;
import com.badminton.repository.DataStore;
import com.badminton.service.BookingService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URLDecoder;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Điều hướng và xử lý toàn bộ RESTful API cho ứng dụng Đặt Sân Cầu Lông.
 */
public class ApiHandler implements HttpHandler {
    private final DataStore dataStore = DataStore.getInstance();
    private final BookingService bookingService = new BookingService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        if (path != null && path.startsWith("/datlichsport")) {
            path = path.substring("/datlichsport".length());
        }

        // Cấu hình CORS để tiện test
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            if (path == null) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Invalid Path\"}");
                return;
            }

            if (path.equals("/api/courts") && "GET".equalsIgnoreCase(method)) {
                handleGetCourts(exchange);
            } else if (path.equals("/api/slots") && "GET".equalsIgnoreCase(method)) {
                handleGetSlots(exchange);
            } else if (path.equals("/api/services") && "GET".equalsIgnoreCase(method)) {
                handleGetServices(exchange);
            } else if (path.equals("/api/bookings") && "GET".equalsIgnoreCase(method)) {
                handleGetBookings(exchange);
            } else if (path.equals("/api/book") && "POST".equalsIgnoreCase(method)) {
                handlePostBook(exchange);
            } else if (path.equals("/api/checkin") && "POST".equalsIgnoreCase(method)) {
                handleCheckIn(exchange);
            } else if (path.equals("/api/cancel") && "POST".equalsIgnoreCase(method)) {
                handleCancelBooking(exchange);
            } else if (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(method)) {
                handleLogin(exchange);
            } else if (path.equals("/api/auth/register") && "POST".equalsIgnoreCase(method)) {
                handleRegisterCustomer(exchange);
            } else if (path.equals("/api/admin/owners") && "GET".equalsIgnoreCase(method)) {
                handleGetOwners(exchange);
            } else if (path.equals("/api/admin/customers") && "GET".equalsIgnoreCase(method)) {
                handleGetCustomers(exchange);
            } else if (path.equals("/api/admin/create-owner") && "POST".equalsIgnoreCase(method)) {
                handleCreateOwner(exchange);
            } else if (path.equals("/api/owner/toggle-court") && "POST".equalsIgnoreCase(method)) {
                handleToggleCourt(exchange);
            } else {
                sendJsonResponse(exchange, 404, "{\"error\":\"API Not Found\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendJsonResponse(exchange, 500, "{\"error\":\"" + escape(e.getMessage()) + "\"}");
        }
    }

    private void handleGetCourts(HttpExchange exchange) throws IOException {
        List<Court> courts = dataStore.getCourts();
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < courts.size(); i++) {
            if (i > 0) json.append(",");
            json.append(courts.get(i).toJson());
        }
        json.append("]");
        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handleGetSlots(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String courtId = query.get("courtId");
        String date = query.get("date");

        if (courtId == null || courtId.isEmpty()) courtId = "C1";
        if (date == null || date.isEmpty()) date = dataStore.getTodayDate();

        List<TimeSlot> slots = dataStore.getSlots(courtId, date);
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < slots.size(); i++) {
            if (i > 0) json.append(",");
            json.append(slots.get(i).toJson());
        }
        json.append("]");
        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handleGetServices(HttpExchange exchange) throws IOException {
        List<ServiceItem> services = dataStore.getServices();
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < services.size(); i++) {
            if (i > 0) json.append(",");
            json.append(services.get(i).toJson());
        }
        json.append("]");
        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handleGetBookings(HttpExchange exchange) throws IOException {
        List<Booking> bookings = dataStore.getBookings();
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < bookings.size(); i++) {
            if (i > 0) json.append(",");
            json.append(bookings.get(i).toJson());
        }
        json.append("]");
        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handlePostBook(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        
        // Trích xuất các trường từ JSON Body
        String customerName = extractJsonString(body, "customerName");
        String customerPhone = extractJsonString(body, "customerPhone");
        String customerEmail = extractJsonString(body, "customerEmail");
        String courtId = extractJsonString(body, "courtId");
        String date = extractJsonString(body, "date");
        String paymentMethod = extractJsonString(body, "paymentMethod");

        List<String> slotIds = extractJsonArray(body, "slotIds");
        List<String> serviceIds = extractJsonArray(body, "serviceIds");

        if (customerName.isEmpty()) customerName = "Khách Hàng";
        if (customerPhone.isEmpty()) customerPhone = "0900000000";
        if (date.isEmpty()) date = dataStore.getTodayDate();

        try {
            Booking booking = bookingService.createBooking(
                customerName, customerPhone, customerEmail,
                courtId, date, slotIds, serviceIds, paymentMethod
            );
            sendJsonResponse(exchange, 200, "{\"success\":true,\"booking\":" + booking.toJson() + "}");
        } catch (Exception ex) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"" + escape(ex.getMessage()) + "\"}");
        }
    }

    private void handleCheckIn(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String code = query.get("code");
        if (code == null) {
            String body = readRequestBody(exchange);
            code = extractJsonString(body, "code");
        }

        boolean ok = bookingService.checkIn(code);
        if (ok) {
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Check-in vào sân thành công!\"}");
        } else {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Mã đặt sân không hợp lệ hoặc đã check-in!\"}");
        }
    }

    private void handleCancelBooking(HttpExchange exchange) throws IOException {
        Map<String, String> query = parseQuery(exchange.getRequestURI().getRawQuery());
        String code = query.get("code");
        if (code == null) {
            String body = readRequestBody(exchange);
            code = extractJsonString(body, "code");
        }

        boolean ok = bookingService.cancelBooking(code);
        if (ok) {
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Hủy đơn đặt sân thành công. Đã giải phóng slot!\"}");
        } else {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Không thể hủy đơn đặt sân này!\"}");
        }
    }

    private void handleLogin(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        String username = extractJsonString(body, "username");
        String password = extractJsonString(body, "password");

        User user = dataStore.authenticate(username, password);
        if (user != null) {
            sendJsonResponse(exchange, 200, "{\"success\":true,\"user\":" + user.toJson() + "}");
        } else {
            sendJsonResponse(exchange, 401, "{\"success\":false,\"message\":\"Sai tên đăng nhập hoặc mật khẩu!\"}");
        }
    }

    private void handleRegisterCustomer(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        String username = extractJsonString(body, "username");
        String password = extractJsonString(body, "password");
        String fullName = extractJsonString(body, "fullName");
        String phone = extractJsonString(body, "phone");
        String email = extractJsonString(body, "email");

        if (username.isEmpty() || password.isEmpty() || fullName.isEmpty() || phone.isEmpty()) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Vui lòng điền đầy đủ họ tên, số điện thoại, tên đăng nhập và mật khẩu!\"}");
            return;
        }

        try {
            User user = dataStore.registerCustomer(username, password, fullName, phone, email);
            sendJsonResponse(exchange, 200, "{\"success\":true,\"user\":" + user.toJson() + ",\"message\":\"Đăng ký tài khoản thành viên thành công!\"}");
        } catch (Exception ex) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"" + escape(ex.getMessage()) + "\"}");
        }
    }

    private void handleGetCustomers(HttpExchange exchange) throws IOException {
        List<User> customers = dataStore.getCustomers();
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < customers.size(); i++) {
            if (i > 0) json.append(",");
            json.append(customers.get(i).toJson());
        }
        json.append("]");
        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handleGetOwners(HttpExchange exchange) throws IOException {
        List<User> owners = dataStore.getOwners();
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < owners.size(); i++) {
            if (i > 0) json.append(",");
            json.append(owners.get(i).toJson());
        }
        json.append("]");
        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handleCreateOwner(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        String username = extractJsonString(body, "username");
        String password = extractJsonString(body, "password");
        String fullName = extractJsonString(body, "fullName");
        String phone = extractJsonString(body, "phone");
        String email = extractJsonString(body, "email");
        String managedCourtIds = extractJsonString(body, "managedCourtIds");

        if (username.isEmpty() || password.isEmpty() || fullName.isEmpty()) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên!\"}");
            return;
        }

        try {
            User owner = dataStore.createOwner(username, password, fullName, phone, email, managedCourtIds);
            sendJsonResponse(exchange, 200, "{\"success\":true,\"owner\":" + owner.toJson() + ",\"message\":\"Tạo tài khoản chủ sân thành công!\"}");
        } catch (Exception ex) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"" + escape(ex.getMessage()) + "\"}");
        }
    }

    private void handleToggleCourt(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        String courtId = extractJsonString(body, "courtId");
        if (courtId.isEmpty()) {
            Map<String, String> q = parseQuery(exchange.getRequestURI().getRawQuery());
            courtId = q.get("courtId");
        }

        boolean ok = dataStore.toggleCourtStatus(courtId);
        if (ok) {
            Court c = dataStore.getCourtById(courtId);
            String newStatus = c != null ? c.getStatus() : "UNKNOWN";
            sendJsonResponse(exchange, 200, "{\"success\":true,\"courtId\":\"" + courtId + "\",\"newStatus\":\"" + newStatus + "\"}");
        } else {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Không tìm thấy sân!\"}");
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    private Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> map = new HashMap<String, String>();
        if (rawQuery == null || rawQuery.isEmpty()) return map;
        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            try {
                if (idx > 0) {
                    String k = URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                    String v = URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                    map.put(k, v);
                } else {
                    map.put(URLDecoder.decode(pair, "UTF-8"), "");
                }
            } catch (Exception ignored) {}
        }
        return map;
    }

    private String extractJsonString(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "";
    }

    private List<String> extractJsonArray(String json, String key) {
        List<String> list = new ArrayList<String>();
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\\[([^\\]]*)\\]");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String items = matcher.group(1);
            Matcher itemMatcher = Pattern.compile("\"([^\"]*)\"").matcher(items);
            while (itemMatcher.find()) {
                list.add(itemMatcher.group(1));
            }
        }
        return list;
    }

    private void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
