#!/usr/bin/env bash
set -euo pipefail

MONGO_URI="${1:-${MONGO_URI:-}}"
BACKUP_DIR="${2:-./backups}"
RETENTION_DAYS="${3:-7}"

if [ -z "$MONGO_URI" ]; then
  echo "ERROR: MONGO_URI is required. Pass as argument 1 or set MONGO_URI env var." >&2
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUT_DIR="${BACKUP_DIR}/traveloop_${TIMESTAMP}"

mkdir -p "$OUT_DIR"

echo "Starting MongoDB backup to ${OUT_DIR}..."
if command -v mongodump &>/dev/null; then
  mongodump --uri="$MONGO_URI" --out="$OUT_DIR" --gzip
elif command -v docker &>/dev/null && docker ps | grep -q traveloop-mongo; then
  echo "Using docker exec on traveloop-mongo container..."
  docker exec traveloop-mongo mongodump --uri="mongodb://localhost:27017/traveloop" --out="/tmp/backup_${TIMESTAMP}" --gzip
  docker cp "traveloop-mongo:/tmp/backup_${TIMESTAMP}" "$OUT_DIR"
  docker exec traveloop-mongo rm -rf "/tmp/backup_${TIMESTAMP}"
else
  echo "ERROR: Neither local mongodump nor docker traveloop-mongo container is available." >&2
  exit 1
fi

echo "Backup completed successfully: ${OUT_DIR}"

echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -maxdepth 1 -type d -name "traveloop_*" -mtime +"$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true

echo "Backup routine completed."
