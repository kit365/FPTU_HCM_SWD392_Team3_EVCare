# Script để kiểm tra tokens trong Redis
# Usage: .\check-redis-tokens.ps1 <user_id>

param(
    [Parameter(Mandatory=$false)]
    [string]$userId
)

Write-Host "=== Checking Redis Tokens ===" -ForegroundColor Cyan

if ($userId) {
    Write-Host "`nChecking tokens for userId: $userId" -ForegroundColor Yellow
    
    # Check Access Token
    Write-Host "`n[Access Token]" -ForegroundColor Green
    docker exec evcare-redis redis-cli GET "access_token:$userId"
    
    # Check Refresh Token
    Write-Host "`n[Refresh Token]" -ForegroundColor Green
    docker exec evcare-redis redis-cli GET "refresh_token:$userId"
    
    # Check TTL (Time To Live)
    Write-Host "`n[Access Token TTL (seconds)]" -ForegroundColor Green
    docker exec evcare-redis redis-cli TTL "access_token:$userId"
    
    Write-Host "`n[Refresh Token TTL (seconds)]" -ForegroundColor Green
    docker exec evcare-redis redis-cli TTL "refresh_token:$userId"
} else {
    Write-Host "`nListing all token keys in Redis:" -ForegroundColor Yellow
    
    # List all access tokens
    Write-Host "`n[All Access Tokens]" -ForegroundColor Green
    docker exec evcare-redis redis-cli KEYS "access_token:*"
    
    # List all refresh tokens
    Write-Host "`n[All Refresh Tokens]" -ForegroundColor Green
    docker exec evcare-redis redis-cli KEYS "refresh_token:*"
    
    Write-Host "`nUsage: .\check-redis-tokens.ps1 <user_id>" -ForegroundColor Cyan
    Write-Host "Example: .\check-redis-tokens.ps1 550e8400-e29b-41d4-a716-446655440000" -ForegroundColor Cyan
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan


