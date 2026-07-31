param(
  [string]$MongoUri = $env:MONGO_URI,
  [string]$BackupDir = ".\backups",
  [int]$RetentionDays = 7,
  [ValidateSet('Install', 'Uninstall', 'Status')]
  [string]$Action = 'Install'
)

$taskName = 'TraveloopMongoBackup'
$scriptPath = Join-Path $PSScriptRoot 'backup-mongo.ps1'

if (-not (Test-Path $scriptPath)) {
  Write-Host "ERROR: backup-mongo.ps1 not found at $scriptPath" -ForegroundColor Red
  exit 1
}

$trigger = New-ScheduledTaskTrigger -Daily -At 02:00
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -MongoUri `"$MongoUri`" -BackupDir `"$BackupDir`" -RetentionDays $RetentionDays"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew

switch ($Action) {
  'Install' {
    Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Principal $principal -Settings $settings -Force
    Write-Host "Scheduled daily MongoDB backup at 02:00 AM. Task: '$taskName'" -ForegroundColor Green
    Write-Host "Backup location: $(Resolve-Path $BackupDir)" -ForegroundColor Cyan
  }
  'Uninstall' {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Removed scheduled task: $taskName" -ForegroundColor Yellow
  }
  'Status' {
    try {
      $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
      Write-Host "Status: $($task.State)" -ForegroundColor Green
      Write-Host "Next run: $($task.NextRunTime)" -ForegroundColor Cyan
      Write-Host "Last run: $($task.LastRunTime)" -ForegroundColor Cyan
      Write-Host "Last result: $($task.LastTaskResult)" -ForegroundColor $(
        if ($task.LastTaskResult -eq 0) { 'Green' } else { 'Red' }
      )
    } catch {
      Write-Host "No scheduled task found for: $taskName" -ForegroundColor Yellow
    }
  }
}