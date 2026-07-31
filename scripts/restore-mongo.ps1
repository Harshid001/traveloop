param(
  [Parameter(Mandatory=$true)]
  [string]$BackupPath,
  [string]$MongoUri = $env:MONGO_URI
)

if (-not (Test-Path $BackupPath)) {
  Write-Host "ERROR: Backup path not found: $BackupPath" -ForegroundColor Red
  exit 1
}

if (-not $MongoUri) {
  Write-Host "ERROR: MONGO_URI not set. Pass -MongoUri or set env var." -ForegroundColor Red
  exit 1
}

$confirm = Read-Host "WARNING: This will overwrite data in the target database. Type 'yes' to continue"
if ($confirm -ne 'yes') {
  Write-Host "Restore cancelled." -ForegroundColor Yellow
  exit 0
}

Write-Host "Restoring from $BackupPath ..." -ForegroundColor Cyan
mongorestore --uri="$MongoUri" --drop --dir="$BackupPath" 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "Restore completed successfully." -ForegroundColor Green
} else {
  Write-Host "Restore failed!" -ForegroundColor Red
  exit 1
}