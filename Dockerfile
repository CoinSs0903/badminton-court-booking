# Image Java JDK chuẩn nhẹ
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy mã nguồn Backend & Frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Chuyển vào backend và biên dịch toàn bộ Java source
WORKDIR /app/backend
RUN mkdir -p bin && javac -encoding UTF-8 -d bin -sourcepath src src/com/badminton/server/BadmintonHttpServer.java

# Khai báo cổng
EXPOSE 8088

# Lệnh chạy server (tự nhận diện cổng $PORT trên Cloud)
CMD ["java", "-cp", "bin", "com.badminton.server.BadmintonHttpServer"]
