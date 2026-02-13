# CareerFlow AI - Start Script

Write-Host "🚀 Starting CareerFlow AI..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Error: backend\.env file not found!" -ForegroundColor Red
    Write-Host "Please create backend\.env file with your Gemini API key" -ForegroundColor Yellow
    Write-Host "See QUICK_START.md for instructions" -ForegroundColor Yellow
    exit 1
}

# Check for Gemini API key
$envContent = Get-Content "backend\.env" -Raw
if ($envContent -match "your_gemini_api_key_here") {
    Write-Host "⚠️  Warning: Please update your Gemini API key in backend\.env" -ForegroundColor Yellow
    Write-Host "Get your API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
