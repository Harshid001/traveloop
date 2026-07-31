#!/usr/bin/env bash
API_URL="${1:-http://localhost:5000}"

echo "Health check — ${API_URL}/health"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ API is healthy (HTTP $HTTP_CODE)"
  exit 0
else
  echo "✗ API is unhealthy (HTTP $HTTP_CODE)"
  exit 1
fi