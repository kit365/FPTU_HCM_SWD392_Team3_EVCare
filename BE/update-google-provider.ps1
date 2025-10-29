# PowerShell script to update Google provider for existing users
# Usage: .\update-google-provider.ps1

Write-Host "=== Update Google Provider for Users ===" -ForegroundColor Cyan

# Thay đổi email của user cần update
$userEmail = "phuocnguyenhuu2510@gmail.com"

Write-Host "`nUpdating provider to 'GOOGLE' for user: $userEmail" -ForegroundColor Yellow

# Chạy SQL update trong MySQL container
docker exec evcare-mysql mysql -u root -proot evcare -e "
UPDATE users 
SET provider = 'GOOGLE' 
WHERE email = '$userEmail' 
  AND is_deleted = false;
"

Write-Host "`n[✓] Update completed!" -ForegroundColor Green

# Kiểm tra kết quả
Write-Host "`nVerifying update..." -ForegroundColor Yellow
docker exec evcare-mysql mysql -u root -proot evcare -e "
SELECT user_id, username, email, full_name, provider 
FROM users 
WHERE email = '$userEmail';
" -t

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Refresh frontend page to see the updated statistics!" -ForegroundColor Green


