param(
  [string]$MongoUri = $env:MONGO_URI,
  [string]$BackupDir = ".\backups",
  [int]$RetentionDays = 7
)

if (-not $MongoUri) {
  Write-Host "ERROR: MONGO_URI not set. Pass -MongoUri or set env var." -ForegroundColor Red
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outDir = Join-Path $BackupDir "traveloop_$timestamp"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Starting backup to $outDir ..." -ForegroundColor Cyan
mongodump --uri="$MongoUri" --out="$outDir" 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "Backup completed successfully: $outDir" -ForegroundColor Green

  $cutoff = (Get-Date).AddDays(-$RetentionDays)
  Get-ChildItem -Path $BackupDir -Directory |
    Where-Object { $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
      Write-Host "Removing old backup: $($_.FullName)" -ForegroundColor Yellow
      Remove-Item -Recurse -Force $_.FullName
    }
} else {
  Write-Host "Backup failed!" -ForegroundColor Red
  exit 1
}