@echo off
echo.
echo ==========================================
echo  ACCURACK SIGNUP SYSTEM DEBUG CHECKER
echo ==========================================
echo.

echo [1/5] Checking Frontend Port...
for /f "tokens=*" %%i in ('netstat -an ^| findstr :5175') do (
    echo ✅ Frontend is running on port 5175
    goto :check_backend
)
echo ❌ Frontend not detected on port 5175

:check_backend
echo.
echo [2/5] Checking Backend Port...
for /f "tokens=*" %%i in ('netstat -an ^| findstr :4000') do (
    echo ✅ Backend is running on port 4000
    goto :check_env
)
echo ❌ Backend not detected on port 4000
echo    → Please start your backend server

:check_env
echo.
echo [3/5] Checking Environment File...
if exist ".env" (
    echo ✅ .env file exists
    echo    → API URL: 
    findstr "VITE_API_URL" .env
) else (
    echo ❌ .env file not found
    echo    → Run: copy .env.example .env
)

echo.
echo [4/5] Testing API Connection...
curl -s -I http://localhost:4000/api/v1/auth/create-client-with-admin > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ API endpoint is accessible
) else (
    echo ❌ Cannot reach API endpoint
    echo    → Check if backend is running
    echo    → Verify CORS configuration
)

echo.
echo [5/5] Quick Fix Suggestions...
echo.
echo If you're seeing CORS errors:
echo 1. Add 'http://localhost:5175' to backend CORS config
echo 2. Restart backend server
echo 3. Clear browser cache
echo 4. Try signup again
echo.
echo For detailed instructions, see: CORS_FIX_GUIDE.md
echo.
echo ==========================================
echo  DEBUG CHECK COMPLETE
echo ==========================================

pause
