#!/bin/bash
set -euo pipefail

# Renders /opt/bbs-app/.env from Secrets Manager and deploy-time env vars.
# Required env: DB_SECRET_ARN, AWS_REGION, S3_BUCKET, CLOUDFRONT_BASE_URL, CORS_ORIGIN

ENV_FILE="${ENV_FILE:-/opt/bbs-app/.env}"

: "${DB_SECRET_ARN:?DB_SECRET_ARN is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${S3_BUCKET:?S3_BUCKET is required}"
: "${CLOUDFRONT_BASE_URL:?CLOUDFRONT_BASE_URL is required}"
: "${CORS_ORIGIN:?CORS_ORIGIN is required}"

SECRET_JSON="$(aws secretsmanager get-secret-value \
  --secret-id "$DB_SECRET_ARN" \
  --region "$AWS_REGION" \
  --query SecretString \
  --output text)"

MYSQL_HOST="$(echo "$SECRET_JSON" | jq -r '.host')"
MYSQL_PORT="$(echo "$SECRET_JSON" | jq -r '.port')"
MYSQL_DATABASE="$(echo "$SECRET_JSON" | jq -r '.database')"
MYSQL_USER="$(echo "$SECRET_JSON" | jq -r '.username')"
MYSQL_PASSWORD="$(echo "$SECRET_JSON" | jq -r '.password')"

CLOUDFRONT_BASE_URL="${CLOUDFRONT_BASE_URL%/}"
CORS_ORIGIN="${CORS_ORIGIN%/}"

umask 077
{
  echo "PORT=3000"
  echo "IMAGE_STORAGE_MODE=s3"
  echo "AWS_REGION=${AWS_REGION}"
  echo "S3_BUCKET=${S3_BUCKET}"
  echo "CLOUDFRONT_BASE_URL=${CLOUDFRONT_BASE_URL}"
  echo "MYSQL_HOST=${MYSQL_HOST}"
  echo "MYSQL_PORT=${MYSQL_PORT}"
  echo "MYSQL_DATABASE=${MYSQL_DATABASE}"
  echo "MYSQL_USER=${MYSQL_USER}"
  # Plain value for systemd EnvironmentFile (no shell %q quotes; TF password is alphanumeric)
  echo "MYSQL_PASSWORD=${MYSQL_PASSWORD}"
  echo "CORS_ORIGIN=${CORS_ORIGIN}"
} >"$ENV_FILE"
chown bbs:bbs "$ENV_FILE"
chmod 600 "$ENV_FILE"
