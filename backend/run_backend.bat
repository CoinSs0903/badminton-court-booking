@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [1/2] Dang bien dich Backend Java (PTPMHDT - Project 2)...
if not exist "bin" mkdir bin
javac -encoding UTF-8 -d bin -sourcepath src src\com\badminton\server\BadmintonHttpServer.java
if %errorlevel% neq 0 (
    echo [LOI] Bien dich that bai!
    pause
    exit /b %errorlevel%
)
echo [2/2] Dang khoi dong Badminton Server tai http://localhost:8088 ...
java -cp bin com.badminton.server.BadmintonHttpServer 8088
pause
