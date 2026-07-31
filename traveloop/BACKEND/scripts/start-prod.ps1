<#
.SYNOPSIS
    Traveloop Production Launcher for Windows
.DESCRIPTION
    Starts the Traveloop backend in production mode with PM2.
    Performs a health check after startup and offers rollback if health check fails.
.PARAMETER SkipHealthCheck
    Skip the post-startup health check.
.PARAMETER HealthCheckUrl
    URL to check (default: http://localhost:5000/api/health).
.EXAMPLE
    .\start-prod.ps1
.EXAMPLE
    .\start-prod.ps1 -SkipHealthCheck
#>

param(
  [switch]$SkipHealthCheck,
  [string]$HealthCheckUrl = "http://localhost:5000/api/health",
  [int]$HealthCheckRetries = 30,
  [int]$HealthCheckDelay = 2
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppDir = Split-Path -Parent $ScriptDir
$Pm2AppName = if ($env:PM2_APP_NAME) { $env:PM2_APP_NAME } else { "traveloop-api" }

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$timestamp] [$Level] $Message"
}

function Test-HealthCheck {
  param([string]$Url, [int]$Retries, [int]$Delay)
  Write-Log "Running health check against $Url..." "INFO"
  for ($i = 1; $i -le $Retries; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
      if ($response.StatusCode -eq 200) {
        Write-Log "Health check passed (attempt $i/$Retries)." "SUCCESS"
        return $true
      }
    } catch {
      # continue
    }
    if ($i -lt $Retries) {
      Start-Sleep -Seconds $Delay
    }
  }
  Write-Log "Health check FAILED after $Retries attempts." "WARNING"
  return $false
}

# --- Verify PM2 is available ---
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  Write-Log "PM2 is not installed. Install it with: npm install -g pm2" "ERROR"
  Write-Log "Falling back to direct Node.js startup..." "WARN"
  Set-Location $AppDir
  node server.js
  return
}

# --- Check for existing PM2 instance ---
$existing = pm2 list 2>$null | Select-String $Pm2AppName
if ($existing) {
  Write-Log "PM2 app '$Pm2AppName' is already running. Reloading..." "INFO"
  pm2 reload $Pm2AppName --update-env
} else {
  Write-Log "Starting Traveloop in production mode..." "INFO"
  Set-Location $AppDir
  pm2 start ecosystem.config.js --env production --name $Pm2AppName
  pm2 save
}

# --- Health Check ---
if (-not $SkipHealthCheck) {
  Start-Sleep -Seconds 3
  $healthy = Test-HealthCheck -Url $HealthCheckUrl -Retries $HealthCheckRetries -Delay $HealthCheckDelay
  if (-not $healthy) {
    Write-Log "Startup health check failed. Checking for previous release to rollback..." "WARN"
    $releasesDir = Join-Path $AppDir "releases"
    if (Test-Path $releasesDir) {
      Write-Log "Consider running: bash scripts\rollback.sh --auto" "WARN"
    }
  }
}

Write-Log "PM2 status:" "INFO"
pm2 status
Write-Log "Use 'pm2 logs $Pm2AppName' to view logs." "INFO"