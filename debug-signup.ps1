# Accurack Signup System Debug Checker
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " ACCURACK SIGNUP SYSTEM DEBUG CHECKER" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Frontend Port
Write-Host "[1/5] Checking Frontend Port..." -ForegroundColor Yellow
$frontendPort = Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Host "✅ Frontend is running on port 5175" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend not detected on port 5175" -ForegroundColor Red
}

# Check Backend Port
Write-Host ""
Write-Host "[2/5] Checking Backend Port..." -ForegroundColor Yellow
$backendPort = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "✅ Backend is running on port 4000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend not detected on port 4000" -ForegroundColor Red
    Write-Host "   → Please start your backend server" -ForegroundColor Yellow
}

# Check Environment File
Write-Host ""
Write-Host "[3/5] Checking Environment File..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $apiUrl = Get-Content .env | Select-String "VITE_API_URL"
    Write-Host "   → $apiUrl" -ForegroundColor Gray
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "   → Run: Copy-Item .env.example .env" -ForegroundColor Yellow
}

# Test API Connection
Write-Host ""
Write-Host "[4/5] Testing API Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/v1/auth/create-client-with-admin" -Method HEAD -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ API endpoint is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot reach API endpoint" -ForegroundColor Red
    Write-Host "   → Check if backend is running" -ForegroundColor Yellow
    Write-Host "   → Verify CORS configuration" -ForegroundColor Yellow
}

# Suggestions
Write-Host ""
Write-Host "[5/5] Quick Fix Suggestions..." -ForegroundColor Yellow
Write-Host ""
Write-Host "If you're seeing CORS errors:" -ForegroundColor Cyan
Write-Host "1. Add 'http://localhost:5175' to backend CORS config"
Write-Host "2. Restart backend server"
Write-Host "3. Clear browser cache"
Write-Host "4. Try signup again"
Write-Host ""
Write-Host "For detailed instructions, see: CORS_FIX_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " DEBUG CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Read-Host "Press Enter to continue"
