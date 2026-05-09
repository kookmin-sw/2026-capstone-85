#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-backups/postgres}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

mkdir -p "${BACKUP_DIR}"

POSTGRES_USER="${POSTGRES_USER:-cpa}"
POSTGRES_DB="${POSTGRES_DB:-cpa_jobs}"
BACKUP_PATH="${BACKUP_DIR}/${POSTGRES_DB}-${TIMESTAMP}.sql"

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T postgres \
  pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${BACKUP_PATH}"

gzip "${BACKUP_PATH}"

if [[ -n "${S3_BACKUP_BUCKET:-}" ]]; then
  aws s3 cp "${BACKUP_PATH}.gz" "s3://${S3_BACKUP_BUCKET}/postgres/${POSTGRES_DB}-${TIMESTAMP}.sql.gz"
fi

echo "Backup written to ${BACKUP_PATH}.gz"
