#!/usr/bin/env bash
set -euo pipefail

: "${S3_WEB_BUCKET:?Set S3_WEB_BUCKET to the static website bucket name.}"
: "${AWS_REGION:?Set AWS_REGION to the bucket region.}"

npm run build:web:static

aws s3 sync apps/web/out/_next/static "s3://${S3_WEB_BUCKET}/_next/static" \
  --delete \
  --region "${AWS_REGION}" \
  --cache-control "public,max-age=31536000,immutable"

aws s3 sync apps/web/out "s3://${S3_WEB_BUCKET}" \
  --delete \
  --region "${AWS_REGION}" \
  --exclude "_next/static/*" \
  --cache-control "public,max-age=60"
