#!/bin/bash
set -euo pipefail

# Applies db/schema/*.sql to RDS (idempotent). Requires /opt/bbs-app/.env and mysql client.

APP_ROOT="${APP_ROOT:-/opt/bbs-app/current}"
SCHEMA_DIR="${APP_ROOT}/db/schema"

if [[ ! -f /opt/bbs-app/.env ]]; then
  echo "ERROR: /opt/bbs-app/.env not found. Run render-env.sh first." >&2
  exit 1
fi

# shellcheck source=/dev/null
source /opt/bbs-app/.env

export MYSQL_PWD="${MYSQL_PASSWORD}"

for sql in "$SCHEMA_DIR"/*.sql; do
  echo "Applying $(basename "$sql")..."
  mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --default-character-set=utf8mb4 <"$sql"
done

echo "Schema apply complete."
