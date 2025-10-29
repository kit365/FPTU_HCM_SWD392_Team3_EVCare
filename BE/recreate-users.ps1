# PowerShell script to clean build and recreate users
# This forces Maven to recompile all classes

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🔄 CLEAN BUILD & RECREATE 811 USERS" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "📍 BƯỚC 1: Cleaning Maven cache..." -ForegroundColor Cyan
& .\mvnw.cmd clean

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Maven cache cleaned successfully!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to clean Maven cache.`n" -ForegroundColor Red
    exit 1
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
Write-Host "📍 BƯỚC 2: Starting backend (will recompile & create 756 users)..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

Write-Host "🔍 XEM LOG SAU ĐÂY - Phải thấy:`n" -ForegroundColor Yellow
Write-Host "   🗑️  'Found 4 old users. Deleting...'" -ForegroundColor Cyan
Write-Host "   🚀 'Initializing roles and sample users (756 total)...'" -ForegroundColor Magenta
Write-Host "   ✅ 'Created 10 STAFF users'" -ForegroundColor Green
Write-Host "   ✅ 'Created 730 CUSTOMER users' ⬆️⬆️⬆️" -ForegroundColor Green
Write-Host "   ✅ 'Created 15 TECHNICIAN users'" -ForegroundColor Green
Write-Host "   🎉 'Total: 1 Admin, 10 Staff, 730 Customers, 15 Technicians = 756 users'`n" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

& .\mvnw.cmd spring-boot:run

