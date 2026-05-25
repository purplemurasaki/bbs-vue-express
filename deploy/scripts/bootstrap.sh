#!/bin/bash
set -euo pipefail

# One-time EC2 setup: Node 24, nginx, mysql client, app user, systemd/nginx configs.

APP_ROOT="/opt/bbs-app"
MARKER="${APP_ROOT}/.bootstrap_done"

if [[ -f "$MARKER" ]]; then
  echo "Bootstrap already completed ($MARKER exists). Skipping."
  exit 0
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: bootstrap must run as root" >&2
  exit 1
fi

dnf install -y nginx mysql jq awscli

# Node.js 24 via NodeSource
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v24* ]]; then
  curl -fsSL https://rpm.nodesource.com/setup_24.x | bash -
  dnf install -y nodejs
fi

id bbs &>/dev/null || useradd --system --home-dir "$APP_ROOT" --shell /sbin/nologin bbs

mkdir -p "$APP_ROOT/releases" "$APP_ROOT/scripts"
chown -R bbs:bbs "$APP_ROOT"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

install -m 644 "${SCRIPT_DIR}/../config/nginx/bbs.conf" /etc/nginx/conf.d/bbs.conf
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

install -m 644 "${SCRIPT_DIR}/../config/systemd/bbs-backend.service" /etc/systemd/system/bbs-backend.service

for s in bootstrap.sh deploy.sh render-env.sh apply-schema.sh ssm-entry.sh; do
  if [[ -f "${SCRIPT_DIR}/${s}" ]]; then
    install -m 755 "${SCRIPT_DIR}/${s}" "${APP_ROOT}/scripts/${s}"
  fi
done

systemctl daemon-reload
systemctl enable nginx

touch "$MARKER"
echo "Bootstrap complete."
