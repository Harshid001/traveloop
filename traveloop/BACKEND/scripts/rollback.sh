#!/usr/bin/env bash
set -euo pipefail

# Traveloop Backend Rollback Script
# Swaps the "current" symlink to a previous release directory.
# Usage:
#   ./rollback.sh              # Interactive: list releases, pick one
#   ./rollback.sh --auto       # Automatic: rollback to most recent previous release
#   ./rollback.sh <release-name>  # Rollback to a specific release

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
RELEASES_DIR="${APP_DIR}/releases"
CURRENT_LINK="${APP_DIR}/current"
PM2_APP_NAME="${PM2_APP_NAME:-traveloop-api}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
die() { log "ERROR: $*"; exit 1; }

# --- Get sorted list of releases (newest first) ---
get_releases() {
  if [ ! -d "${RELEASES_DIR}" ]; then
    die "No releases directory found at ${RELEASES_DIR}"
  fi
  ls -1dt "${RELEASES_DIR}"/*/ 2>/dev/null | while read -r d; do basename "$d"; done
}

# --- Get the current active release ---
get_current_release() {
  if [ -L "${CURRENT_LINK}" ]; then
    basename "$(readlink "${CURRENT_LINK}")"
  else
    echo "none"
  fi
}

CURRENT=$(get_current_release)
RELEASES=($(get_releases))

if [ ${#RELEASES[@]} -eq 0 ]; then
  die "No releases found in ${RELEASES_DIR}. Nothing to rollback to."
fi

# --- Determine target release ---
TARGET=""

if [ "${1:-}" = "--auto" ]; then
  # Auto mode: pick the most recent release that is NOT the current one
  for release in "${RELEASES[@]}"; do
    if [ "${release}" != "${CURRENT}" ]; then
      TARGET="${release}"
      break
    fi
  done
  if [ -z "${TARGET}" ]; then
    die "No previous release found to rollback to (only release is the current one)."
  fi
  log "Auto-rollback: selecting ${TARGET}"
elif [ -n "${1:-}" ]; then
  # Explicit release name
  TARGET="${1}"
  if [ ! -d "${RELEASES_DIR}/${TARGET}" ]; then
    die "Release '${TARGET}' not found in ${RELEASES_DIR}."
  fi
else
  # Interactive mode
  echo ""
  echo "Current release: ${CURRENT}"
  echo ""
  echo "Available releases (newest first):"
  echo "-----------------------------------"
  idx=1
  for release in "${RELEASES[@]}"; do
    marker=""
    if [ "${release}" = "${CURRENT}" ]; then
      marker=" [ACTIVE]"
    fi
    echo "  ${idx}) ${release}${marker}"
    idx=$((idx + 1))
  done
  echo ""
  read -rp "Enter number to rollback to (or Ctrl+C to cancel): " choice
  if ! [[ "${choice}" =~ ^[0-9]+$ ]] || [ "${choice}" -lt 1 ] || [ "${choice}" -gt ${#RELEASES[@]} ]; then
    die "Invalid selection: ${choice}"
  fi
  TARGET="${RELEASES[$((choice - 1))]}"
fi

# --- Confirm ---
if [ "${TARGET}" = "${CURRENT}" ]; then
  die "Target release (${TARGET}) is already the active release. Nothing to do."
fi

TARGET_DIR="${RELEASES_DIR}/${TARGET}"
log "Rolling back: ${CURRENT} → ${TARGET}"

# --- Verify target has server.js ---
if [ ! -f "${TARGET_DIR}/server.js" ]; then
  die "Target release ${TARGET} is missing server.js — appears corrupted."
fi

# --- Atomic symlink switch ---
ln -sfn "${TARGET_DIR}" "${CURRENT_LINK}"
log "Symlink switched to ${TARGET}"

# --- Reload PM2 ---
if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -q "${PM2_APP_NAME}"; then
  log "Reloading PM2 app: ${PM2_APP_NAME}"
  pm2 reload "${PM2_APP_NAME}" --update-env || {
    log "PM2 reload failed, attempting restart..."
    pm2 restart "${PM2_APP_NAME}" --update-env || die "PM2 restart also failed"
  }
else
  log "PM2 not running. Starting app from ${TARGET_DIR}..."
  cd "${TARGET_DIR}"
  pm2 start ecosystem.config.js --env production --name "${PM2_APP_NAME}" || die "PM2 start failed"
  pm2 save
fi

log "Rollback complete. Now serving: ${TARGET}"