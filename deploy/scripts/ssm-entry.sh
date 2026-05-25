#!/bin/bash
set -euo pipefail

# Entry point for SSM Run Command. Runs bootstrap (if needed) and deploy.

: "${AWS_REGION:?AWS_REGION is required}"

BOOTSTRAP="${BOOTSTRAP:-false}"
RUN_SCHEMA_APPLY="${RUN_SCHEMA_APPLY:-false}"

if [[ -n "${PRE_EXTRACTED_DIR:-}" ]]; then
  EXTRACT_ROOT="$PRE_EXTRACTED_DIR"
  RELEASE_ID="${RELEASE_ID:-unknown}"
else
  : "${DEPLOY_BUCKET:?DEPLOY_BUCKET is required}"
  : "${RELEASE_KEY:?RELEASE_KEY is required}"

  RELEASE_ID="${RELEASE_ID:-$(basename "$RELEASE_KEY" .tar.gz)}"
  WORKDIR="$(mktemp -d)"
  trap 'rm -rf "$WORKDIR"' EXIT

  TARBALL="${WORKDIR}/release.tar.gz"
  EXTRACT="${WORKDIR}/extract"
  S3_URI="s3://${DEPLOY_BUCKET}/${RELEASE_KEY}"

  aws s3 cp "$S3_URI" "$TARBALL" --region "$AWS_REGION"
  mkdir -p "$EXTRACT"
  tar -xzf "$TARBALL" -C "$EXTRACT"
  EXTRACT_ROOT="$EXTRACT"
  if [[ -d "${EXTRACT}/release" ]]; then
    EXTRACT_ROOT="${EXTRACT}/release"
  fi
fi

SCRIPTS_DIR="${EXTRACT_ROOT}/deploy/scripts"
if [[ ! -d "$SCRIPTS_DIR" ]]; then
  SCRIPTS_DIR="/opt/bbs-app/scripts"
fi

if [[ "$BOOTSTRAP" == "true" ]] || [[ ! -f /opt/bbs-app/.bootstrap_done ]]; then
  echo "Running bootstrap..."
  bash "${SCRIPTS_DIR}/bootstrap.sh"
fi

export DEPLOY_BUCKET="${DEPLOY_BUCKET:-}"
export RELEASE_KEY="${RELEASE_KEY:-}"
export AWS_REGION
export RELEASE_ID
export DB_SECRET_ARN="${DB_SECRET_ARN:-}"
export S3_BUCKET="${S3_BUCKET:-}"
export CLOUDFRONT_BASE_URL="${CLOUDFRONT_BASE_URL:-}"
export CORS_ORIGIN="${CORS_ORIGIN:-}"
export RUN_SCHEMA_APPLY
export PRE_EXTRACTED_DIR="$EXTRACT_ROOT"

bash "${SCRIPTS_DIR}/deploy.sh"
