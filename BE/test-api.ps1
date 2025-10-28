# Simple script to test dashboard API

Write-Host "`n🔄 FETCH DASHBOARD API...`n" -ForegroundColor Cyan

# Login
$loginBody = '{"userInformation":"admin@evcare.com","password":"Admin@123"}'
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login/admin" -Method POST -Body $loginBody -ContentType "application/json"

if ($login.success) {
    Write-Host "✅ Login OK`n" -ForegroundColor Green
    
    # Fetch Stats
    $headers = @{ "Authorization" = "Bearer $($login.data.token)" }
    $stats = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dashboard/stats" -Method GET -Headers $headers
    
    if ($stats.success) {
        Write-Host "✅ Fetch OK`n" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "📊 DASHBOARD DATA:`n" -ForegroundColor Yellow
        Write-Host "   Customers: $($stats.data.totalCustomers)" -ForegroundColor White
        Write-Host "   Staff: $($stats.data.totalStaff)" -ForegroundColor White
        Write-Host "   Technicians: $($stats.data.totalTechnicians)" -ForegroundColor White
        Write-Host "   Vehicles: $($stats.data.totalVehicles)" -ForegroundColor White
        Write-Host "   Appointments: $($stats.data.totalAppointments)" -ForegroundColor White
        Write-Host "   Revenue: $($stats.data.monthlyRevenue) VNĐ`n" -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
        
        if ($stats.data.totalCustomers -eq 0) {
            Write-Host "⚠️  DATABASE TRỐNG - Cần restart backend!`n" -ForegroundColor Red
        } else {
            Write-Host "✅ DATABASE CÓ DATA!`n" -ForegroundColor Green
        }
    }
}

