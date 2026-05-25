#!/bin/bash
set -euo pipefail

# Installs release to /opt/bbs-app/current, renders .env, restarts services.
# Either downloads from S3 (RELEASE_KEY) or uses PRE_EXTRACTED_DIR from ssm-entry.sh.

APP_ROOT="/opt/bbs-app"
RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"

: "${AWS_REGION:?AWS_REGION is required}"

if [[ -n "${PRE_EXTRACTED_DIR:-}" ]]; then
  RELEASE_DIR="${PRE_EXTRACTED_DIR}"
  RELEASE_ID="${RELEASE_ID:-$(basename "$RELEASE_DIR")}"
else
  : "${DEPLOY_BUCKET:?DEPLOY_BUCKET is required}"
  : "${RELEASE_KEY:?RELEASE_KEY is required}"

  RELEASE_ID="${RELEASE_ID:-$(basename "$RELEASE_KEY" .tar.gz)}"
  RELEASE_DIR="${RELEASES_DIR}/${RELEASE_ID}"
  TARBALL="/tmp/${RELEASE_ID}.tar.gz"
  S3_URI="s3://${DEPLOY_BUCKET}/${RELEASE_KEY}"

  mkdir -p "$RELEASES_DIR"
  echo "Downloading ${S3_URI}..."
  aws s3 cp "$S3_URI" "$TARBALL" --region "$AWS_REGION"
  rm -rf "$RELEASE_DIR"
  mkdir -p "$RELEASE_DIR"
  tar -xzf "$TARBALL" -C "$RELEASE_DIR"
  rm -f "$TARBALL"
fi

if [[ ! -d "${RELEASE_DIR}/backend" ]]; then
  echo "ERROR: invalid release layout (missing backend/) under ${RELEASE_DIR}" >&2
  exit 1
fi

# Copy into releases if deploying from temp extract
if [[ "${RELEASE_DIR}" != "${RELEASES_DIR}/${RELEASE_ID}" ]]; then
  TARGET="${RELEASES_DIR}/${RELEASE_ID}"
  rm -rf "$TARGET"
  mkdir -p "$TARGET"
  cp -a "${RELEASE_DIR}/." "$TARGET/"
  RELEASE_DIR="$TARGET"
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
chown -h bbs:bbs "$CURRENT_LINK"
chown -R bbs:bbs "$RELEASE_DIR"

if [[ -n "${DB_SECRET_ARN:-}" && -n "${S3_BUCKET:-}" && -n "${CLOUDFRONT_BASE_URL:-}" && -n "${CORS_ORIGIN:-}" ]]; then
  /opt/bbs-app/scripts/render-env.sh
fi

echo "Installing backend production dependencies..."
cd "${CURRENT_LINK}/backend"
sudo -u bbs npm ci --omit=dev

# Idempotent DDL on every deploy (CREATE TABLE IF NOT EXISTS)
/opt/bbs-app/scripts/apply-schema.sh

systemctl restart bbs-backend 2>/dev/null || systemctl start bbs-backend
systemctl enable bbs-backend
nginx -t
systemctl reload nginx 2>/dev/null || systemctl start nginx

echo "Deploy complete: ${RELEASE_ID}"
