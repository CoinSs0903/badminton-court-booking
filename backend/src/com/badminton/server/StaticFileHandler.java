package com.badminton.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URI;
import java.nio.file.Files;

/**
 * Phục vụ các file tĩnh (HTML, CSS, JS, hình ảnh) cho giao diện Web.
 */
public class StaticFileHandler implements HttpHandler {
    private final File publicDir;

    public StaticFileHandler(File publicDir) {
        this.publicDir = publicDir;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        URI uri = exchange.getRequestURI();
        String path = uri.getPath();

        if (path == null || path.isEmpty()) {
            path = "/";
        }

        // 1. Tương thích ngược với tiền tố /datlichsport
        if (path.startsWith("/datlichsport")) {
            path = path.substring("/datlichsport".length());
            if (path.isEmpty()) path = "/";
        }

        // 2. Định tuyến trực tiếp cho Web Khách Hàng (User)
        // Cho phép truy cập qua /, /user, /user/, /khachhang, /customer
        if (path.equals("/") || "/user".equalsIgnoreCase(path) || "/user/".equalsIgnoreCase(path)
                || "/khachhang".equalsIgnoreCase(path) || "/customer".equalsIgnoreCase(path)) {
            path = "/index.html";
        }

        File file = new File(publicDir, path.replace('/', File.separatorChar));

        // Bảo vệ chống Path Traversal
        if (!file.getCanonicalPath().startsWith(publicDir.getCanonicalPath())) {
            sendResponse(exchange, 403, "Access Denied", "text/plain; charset=UTF-8");
            return;
        }

        // Nếu là thư mục nhưng chưa có dấu '/' ở cuối -> chuyển hướng thêm '/' để file tĩnh chạy đúng
        if (file.isDirectory()) {
            if (!uri.getPath().endsWith("/")) {
                String target = uri.getPath() + "/";
                if (uri.getRawQuery() != null) {
                    target += "?" + uri.getRawQuery();
                }
                exchange.getResponseHeaders().set("Location", target);
                exchange.sendResponseHeaders(302, -1);
                return;
            }
            File indexInDir = new File(file, "index.html");
            if (indexInDir.exists()) {
                file = indexInDir;
            }
        }

        // Nếu file không tồn tại
        if (!file.exists()) {
            // Nếu yêu cầu file tài nguyên tĩnh có đuôi (.css, .js, .png...) -> trả 404 thực tế
            if (path.contains(".")) {
                sendResponse(exchange, 404, "File Not Found", "text/plain; charset=UTF-8");
                return;
            }
            // Mặc định fallback về index.html cho SPA
            file = new File(publicDir, "index.html");
            if (!file.exists()) {
                sendResponse(exchange, 404, "File Not Found", "text/plain; charset=UTF-8");
                return;
            }
        }

        String mimeType = getMimeType(file.getName());
        byte[] bytes = Files.readAllBytes(file.toPath());

        exchange.getResponseHeaders().set("Content-Type", mimeType);
        exchange.getResponseHeaders().set("Cache-Control", "no-cache, no-store, must-revalidate");
        exchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String getMimeType(String filename) {
        if (filename.endsWith(".html")) return "text/html; charset=UTF-8";
        if (filename.endsWith(".css")) return "text/css; charset=UTF-8";
        if (filename.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (filename.endsWith(".json")) return "application/json; charset=UTF-8";
        if (filename.endsWith(".png")) return "image/png";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
        if (filename.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private void sendResponse(HttpExchange exchange, int status, String body, String contentType) throws IOException {
        byte[] bytes = body.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
