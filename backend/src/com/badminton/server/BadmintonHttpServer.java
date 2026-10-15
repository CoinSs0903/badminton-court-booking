package com.badminton.server;

import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * Lớp khởi động Web Server phục vụ ứng dụng Đặt Sân Cầu Lông.
 * Sử dụng thuần Java SE (com.sun.net.httpserver.HttpServer), không phụ thuộc thư viện ngoài.
 */
public class BadmintonHttpServer {
    public static final int DEFAULT_PORT = 8088;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        
        // Hỗ trợ tự động nhận cổng từ biến môi trường của các dịch vụ Cloud (Render, Railway, Heroku, v.v.)
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (NumberFormatException ignored) {}
        } else if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        }

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // Tìm thư mục frontend (Hỗ trợ cấu trúc frontend/web_app)
            File currentDir = new File(".").getCanonicalFile();
            File[] candidateDirs = new File[] {
                new File(currentDir, "../frontend/web_app"), // Khi chạy từ PROJECT_2/backend
                new File(currentDir, "frontend/web_app"),    // Khi chạy từ thư mục gốc PROJECT_2
                new File(currentDir, "public"),              // Khi chạy trực tiếp tại web_app
                new File(currentDir, "../web_app/public"),
                new File(currentDir, "web_app/public")
            };

            File publicDir = null;
            for (File candidate : candidateDirs) {
                if (candidate.exists() && candidate.isDirectory()) {
                    publicDir = candidate.getCanonicalFile();
                    break;
                }
            }
            if (publicDir == null) {
                publicDir = currentDir;
            }

            System.out.println("==========================================================");
            System.out.println(" 🏸 HỆ THỐNG ĐẶT LỊCH SÂN CẦU LÔNG CHUYÊN NGHIỆP");
            System.out.println(" 🏫 Môn học: Phát Triển Phần Mềm Hướng Đối Tượng (OOAD)");
            System.out.println("==========================================================");
            System.out.println("  🏸 Web Khách Hàng (User)   : http://localhost:" + port + "/");
            System.out.println("  🏸 Link User Trực Tiếp     : http://localhost:" + port + "/user");
            System.out.println("  🏢 Web Chủ Sân (Owner)     : http://localhost:" + port + "/owner");
            System.out.println("  👑 Web Quản Trị (Admin)    : http://localhost:" + port + "/admin");
            System.out.println("  📂 Thư mục frontend        : " + publicDir.getAbsolutePath());
            System.out.println("  📡 REST API                : http://localhost:" + port + "/api/courts");
            System.out.println("==========================================================");
            System.out.println(" [!] Máy chủ đang chạy... Nhấn Ctrl+C để dừng.");

            // Đăng ký Handlers
            server.createContext("/datlichsport/api", new ApiHandler());
            server.createContext("/api", new ApiHandler());
            server.createContext("/", new StaticFileHandler(publicDir));

            // Cấu hình Thread Pool để xử lý đa luồng đồng thời
            server.setExecutor(Executors.newFixedThreadPool(16));
            server.start();

        } catch (Exception e) {
            System.err.println("❌ Lỗi khi khởi động server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
