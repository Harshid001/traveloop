#!/usr/bin/env bash
set -euo pipefail

# Traveloop Backend Deployment Script
# Strategy: versioned releases with symlink-based atomic switching.
# Each release lives under releases/YYYYMMDD-HHMMSS-<commit>.
# The "current" symlink points to the active release.
# PM2 watches "current/server.js" so switching the symlink + reload = zero-downtime deploy.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
PM2_APP_NAME="${PM2_APP_NAME:-traveloop-api}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:5000/api/health}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-30}"
HEALTH_CHECK_DELAY="${HEALTH_CHECK_DELAY:-2}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { log "ERROR: $*"; exit 1; }

# --- Determine release name ---
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
RELEASE_NAME="${TIMESTAMP}-${COMMIT_HASH}"
RELEASE_DIR="${RELEASES_DIR}/${RELEASE_NAME}"

log "Starting deployment: ${RELEASE_NAME}"

# --- Ensure releases directory exists ---
mkdir -p "${RELEASES_DIR}"

# --- Build the release ---
log "Building release..."
mkdir -p "${RELEASE_DIR}"

rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'releases' \
  --exclude 'current' \
  --exclude 'logs' \
  --exclude '__tests__' \
  --exclude 'scripts' \
  "${APP_DIR}/" "${RELEASE_DIR}/"

# --- Install production dependencies ---
log "Installing production dependencies..."
cd "${RELEASE_DIR}"
npm ci --omit=dev 2>&1 | tail -5

# --- Run database migrations ---
log "Running database migrations..."
if npm run migrate:up 2>&1; then
  log "Migrations applied successfully."
else
  log "WARNING: Migrations failed. Proceeding with deploy — check manually."
fi

# --- Atomic symlink switch ---
log "Switching current → ${RELEASE_NAME}"
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"

# --- Reload PM2 ---
if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -q "${PM2_APP_NAME}"; then
  log "Reloading PM2 app: ${PM2_APP_NAME}"
  pm2 reload "${PM2_APP_NAME}" --update-env || die "PM2 reload failed"
else
  log "PM2 not running or app not found. Starting fresh."
  cd "${RELEASE_DIR}"
  pm2 start ecosystem.config.js --env production --name "${PM2_APP_NAME}" || die "PM2 start failed"
  pm2 save
fi

# --- Health check ---
log "Running health check against ${HEALTH_CHECK_URL}..."
for i in $(seq 1 "${HEALTH_CHECK_RETRIES}"); do
  if curl -sf -o /dev/null "${HEALTH_CHECK_URL}"; then
    log "Health check passed (attempt ${i}/${HEALTH_CHECK_RETRIES})."
    break
  fi
  if [ "${i}" -eq "${HEALTH_CHECK_RETRIES}" ]; then
    log "WARNING: Health check failed after ${HEALTH_CHECK_RETRIES} attempts."
    log "Rolling back to previous release..."
    "${SCRIPT_DIR}/rollback.sh" --auto
    die "Deployment failed — rolled back automatically."
  fi
  sleep "${HEALTH_CHECK_DELAY}"
done

# --- Cleanup old releases ---
log "Cleaning up old releases (keeping ${KEEP_RELEASES})..."
ls -1dt "${RELEASES_DIR}"/*/ 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | while read -r old_release; do
  log "Removing old release: $(basename "${old_release}")"
  rm -rf "${old_release}"
done

log "Deployment complete: ${RELEASE_NAME} is now live."