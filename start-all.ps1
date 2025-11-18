#!/usr/bin/env powershell
# Run all services for Restaurant Management System

Write-Host "🚀 Starting all services..." -ForegroundColor Green

# Kill all node processes first
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null

Start-Sleep 2

# Start Gateway
Write-Host "`n📍 Starting Gateway (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Restaurant-Management-System\gateway'; npm start" -WindowStyle Normal

Start-Sleep 2

# Start Menu Service
Write-Host "📍 Starting Menu Service (port 3002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Restaurant-Management-System\services\menu-service'; npm run dev" -WindowStyle Normal

Start-Sleep 2

# Start Order Service
Write-Host "📍 Starting Order Service (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Restaurant-Management-System\services\order-service'; npm run dev" -WindowStyle Normal

Start-Sleep 2

# Start Customer Service
Write-Host "📍 Starting Customer Service (port 3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Restaurant-Management-System\services\customer-service'; npm run dev" -WindowStyle Normal

Start-Sleep 2

# Start Frontend
Write-Host "📍 Starting Frontend (port 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\Restaurant-Management-System\Frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "`n🌐 Open browser: http://localhost:8080" -ForegroundColor Green
Write-Host "`n📊 Services:" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "  - Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "  - Menu Service: http://localhost:3002" -ForegroundColor White
Write-Host "  - Order Service: http://localhost:3001" -ForegroundColor White
Write-Host "  - Customer Service: http://localhost:3003" -ForegroundColor White
