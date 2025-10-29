# PowerShell script to fetch dashboard stats

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🔄 FETCH DASHBOARD STATS" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

try {
    # Step 1: Login
    Write-Host "📍 BƯỚC 1: Đăng nhập admin..." -ForegroundColor Yellow
    
    $loginBody = @{
        userInformation = "admin@evcare.com"
        password = "Admin@123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login/admin" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if (-not $loginData.success) {
        Write-Host "❌ Login thất bại: $($loginData.message)" -ForegroundColor Red
        exit 1
    }
    
    $token = $loginData.data.token
    Write-Host "✅ Login thành công!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0,30))...`n" -ForegroundColor Gray
    
    # Step 2: Fetch Dashboard Stats
    Write-Host "📍 BƯỚC 2: Fetch dashboard stats..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/dashboard/stats" -Method GET -Headers $headers -UseBasicParsing
    
    $statsData = $statsResponse.Content | ConvertFrom-Json
    
    if (-not $statsData.success) {
        Write-Host "❌ Fetch thất bại: $($statsData.message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Fetch thành công!`n" -ForegroundColor Green
    
    # Step 3: Display Results
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "📊 KẾT QUẢ DASHBOARD STATS" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
    
    $stats = $statsData.data
    
    Write-Host "👥 NGƯỜI DÙNG:" -ForegroundColor Cyan
    Write-Host "   📊 Tổng khách hàng: $($stats.totalCustomers)" -ForegroundColor White
    Write-Host "   ✅ Khách hàng hoạt động: $($stats.activeCustomers)" -ForegroundColor Green
    Write-Host "   📊 Tổng nhân viên: $($stats.totalStaff)" -ForegroundColor White
    Write-Host "   📊 Tổng kỹ thuật viên: $($stats.totalTechnicians)`n" -ForegroundColor White
    
    Write-Host "🚗 XE:" -ForegroundColor Cyan
    Write-Host "   📊 Tổng số xe: $($stats.totalVehicles)" -ForegroundColor White
    Write-Host "   ✅ Xe hoạt động: $($stats.activeVehicles)`n" -ForegroundColor Green
    
    Write-Host "📅 LỊCH HẸN:" -ForegroundColor Cyan
    Write-Host "   📊 Tổng lịch hẹn: $($stats.totalAppointments)" -ForegroundColor White
    Write-Host "   📈 Lịch hẹn tháng này: $($stats.appointmentsThisMonth)" -ForegroundColor Magenta
    Write-Host "   📈 Lịch hẹn tháng trước: $($stats.appointmentsLastMonth)" -ForegroundColor Gray
    Write-Host "   ⏳ Chờ xác nhận: $($stats.pendingAppointments)" -ForegroundColor Yellow
    Write-Host "   ✅ Đã xác nhận: $($stats.confirmedAppointments)" -ForegroundColor Green
    Write-Host "   ✅ Hoàn thành: $($stats.completedAppointments)" -ForegroundColor Green
    Write-Host "   ❌ Đã hủy: $($stats.cancelledAppointments)`n" -ForegroundColor Red
    
    Write-Host "💰 DOANH THU:" -ForegroundColor Cyan
    $revenue = "{0:N0}" -f $stats.monthlyRevenue
    Write-Host "   💵 Doanh thu tháng này: $revenue VNĐ`n" -ForegroundColor Green
    
    Write-Host "📊 TỶ LỆ TĂNG TRƯỞNG:" -ForegroundColor Cyan
    Write-Host "   📈 Khách hàng: $($stats.customerGrowthRate)%" -ForegroundColor White
    Write-Host "   📈 Lịch hẹn: $($stats.appointmentGrowthRate)%`n" -ForegroundColor White
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
    
    # Step 4: Check if data is empty
    if ($stats.totalCustomers -eq 0 -and $stats.totalStaff -eq 0) {
        Write-Host "⚠️  CẢNH BÁO: DATABASE TRỐNG!" -ForegroundColor Red
        Write-Host "   → Cần restart backend để tạo data" -ForegroundColor Yellow
        Write-Host "   → Chạy: .\restart-backend.ps1`n" -ForegroundColor Cyan
    } else {
        Write-Host "✅ DATABASE CÓ DATA!" -ForegroundColor Green
        Write-Host "   → Frontend có thể fetch API thành công" -ForegroundColor White
        Write-Host "   → Nếu Dashboard vẫn hiển thị 0 → Vấn đề là Token`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ LỖI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Chi tiết: $($_.Exception)" -ForegroundColor Gray
    
    if ($_.Exception.Message -like "*401*") {
        Write-Host "`n   → Lỗi authentication" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*500*") {
        Write-Host "`n   → Backend lỗi, xem log backend" -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*refused*") {
        Write-Host "`n   → Backend không chạy!" -ForegroundColor Yellow
        Write-Host "   → Start backend: .\mvnw.cmd spring-boot:run" -ForegroundColor Cyan
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

