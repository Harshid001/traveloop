#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="${1:-production}"

echo "Deploying Traveloop — environment: ${DEPLOY_ENV}"

cd "$ROOT/traveloop/BACKEND"
npm ci --omit=dev
npm run build 2>/dev/null || true

cd "$ROOT/traveloop/FRONTEND"
npm ci
npm run build

if command -v nginx &>/dev/null; then
  echo "Copying frontend build to nginx serve path..."
  sudo cp -r dist/* /var/www/traveloop/ 2>/dev/null || true
fi

cd "$ROOT/traveloop/BACKEND"
if command -v pm2 &>/dev/null; then
  pm2 reload ecosystem.config.js --env "$DEPLOY_ENV" || pm2 start ecosystem.config.js --env "$DEPLOY_ENV"
  pm2 save
  echo "PM2 processes reloaded. Use 'pm2 status' to check."
else
  echo "PM2 not installed. Install with: npm install -g pm2"
  echo "Then run: pm2 start ecosystem.config.js --env $DEPLOY_ENV"
  echo "Falling back to direct Node.js..."
  NODE_ENV="$DEPLOY_ENV" node server.js
fi

echo "Deploy complete — API running on port ${PORT:-5000}"