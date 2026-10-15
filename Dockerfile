# Sử dụng Eclipse Temurin JDK 17 chính thức (chuẩn LTS của Eclipse Adoptium)
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy toàn bộ mã nguồn Backend và Frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Chuyển vào thư mục backend và biên dịch tất cả file mã nguồn Java
WORKDIR /app/backend
RUN mkdir -p bin && find src -name "*.java" > sources.txt && javac -encoding UTF-8 -d bin @sources.txt && rm sources.txt

# Khai báo cổng mặc định
EXPOSE 8088

# Lệnh chạy máy chủ Java (tự động nhận biến môi trường PORT từ Render)
CMD ["java", "-cp", "bin", "com.badminton.server.BadmintonHttpServer"]
