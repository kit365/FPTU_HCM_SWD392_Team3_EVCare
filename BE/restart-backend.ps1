# PowerShell script to restart backend and recreate dashboard data

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🔄 RESTART BACKEND + TẠO LẠI DATA" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "📍 BƯỚC 1: Stop backend cũ (nếu có)..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*evcare*" -or $_.CommandLine -like "*evcare*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Backend cũ đã dừng`n" -ForegroundColor Green

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
Write-Host "📍 BƯỚC 2: Start backend mới..." -ForegroundColor Yellow
Write-Host "   (Backend sẽ tự động tạo data)`n" -ForegroundColor White

Write-Host "🔍 XEM LOG - Phải thấy:" -ForegroundColor Cyan
Write-Host "   🚀 'Initializing roles and sample users (811 total)...'" -ForegroundColor Magenta
Write-Host "   ✅ 'Created 20 STAFF users'" -ForegroundColor Green
Write-Host "   ✅ 'Created 750 CUSTOMER users'" -ForegroundColor Green
Write-Host "   ✅ 'Created 40 TECHNICIAN users'" -ForegroundColor Green
Write-Host "   🚀 'Initializing dashboard sample data...'" -ForegroundColor Magenta
Write-Host "   ✅ 'Created 625 appointments with 100 customers'" -ForegroundColor Green
Write-Host "   ✅ 'Created 625 payments'`n" -ForegroundColor Green

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
Write-Host "⏱️  Đợi khoảng 30-60 giây để backend khởi động...`n" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "🚀 Starting backend now...`n" -ForegroundColor Green

# Start backend
& .\mvnw.cmd spring-boot:run

