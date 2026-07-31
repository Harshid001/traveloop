param(
  [string]$Env = "production"
)

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting Traveloop in $Env mode..." -ForegroundColor Cyan

Set-Location "$root\traveloop\BACKEND"

if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  Write-Host "Installing PM2 globally..." -ForegroundColor Yellow
  npm install -g pm2
}

if (-not (Test-Path "logs")) {
  New-Item -ItemType Directory -Path "logs" | Out-Null
}

$pm2File = "ecosystem.config.js"
pm2 delete traveloop-api 2>$null
pm2 start $pm2File --env $Env
pm2 save

Write-Host "Setting up PM2 to start on boot..." -ForegroundColor Yellow
pm2 startup | Invoke-Expression 2>$null

Write-Host ""
Write-Host "Traveloop API is running:" -ForegroundColor Green
pm2 status
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "  pm2 status         — view running processes"
Write-Host "  pm2 logs           — tail all logs"
Write-Host "  pm2 reload all     — zero-downtime restart"
Write-Host "  pm2 stop all       — stop all processes"
Write-Host "  pm2 restart all    — hard restart all processes"