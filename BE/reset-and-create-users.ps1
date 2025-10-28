# PowerShell script to reset database users and restart backend
# This will delete all existing users and recreate with sample data

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🔄 RESET USERS & CREATE SAMPLE DATA" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

# Database configuration (update if needed)
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "evcare_db"
$dbUser = "postgres"
$dbPassword = "1234"

Write-Host "⚠️  WARNING: This will DELETE all existing users!" -ForegroundColor Red
Write-Host "   New users will be created:" -ForegroundColor Yellow
Write-Host "   - 1 Admin" -ForegroundColor Cyan
Write-Host "   - 10 Staff" -ForegroundColor Cyan
Write-Host "   - 30 Customers" -ForegroundColor Cyan
Write-Host "   - 15 Technicians`n" -ForegroundColor Cyan

$confirmation = Read-Host "Do you want to continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "`n❌ Operation cancelled.`n" -ForegroundColor Red
    exit
}

Write-Host "`n🗑️  Deleting existing users from database..." -ForegroundColor Yellow

# SQL commands to delete users and roles
$sqlCommands = @"
-- Delete all users
TRUNCATE TABLE users CASCADE;

-- Delete all roles (will be recreated)
TRUNCATE TABLE roles CASCADE;
"@

# Execute SQL using psql
$env:PGPASSWORD = $dbPassword
$sqlCommands | & "psql" -h $dbHost -p $dbPort -U $dbUser -d $dbName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database users deleted successfully!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to delete users. Make sure PostgreSQL is running and credentials are correct.`n" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting backend to create new sample users...`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

# Start backend (assuming you're in BE directory)
& .\mvnw.cmd spring-boot:run

Write-Host "`n✅ Backend started! Sample users will be created automatically.`n" -ForegroundColor Green
Write-Host "📝 Default login credentials:" -ForegroundColor Cyan
Write-Host "   Admin:      admin123A / Admin@123" -ForegroundColor White
Write-Host "   Staff:      staff123A / Staff@123" -ForegroundColor White
Write-Host "   Customer:   customer123A / @Customer123" -ForegroundColor White
Write-Host "   Technician: technician123A / @Technician123`n" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

