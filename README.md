# CPA Jobs Prototype

회계사 채용 공고를 한 곳에 모아 수습 가능 여부, KICPA 조건, 직무군, 연차, 마감일 기준으로 탐색하는 캡스톤 Prototype입니다.

## Tech Stack

- Monorepo: npm workspaces
- Web: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- API: NestJS, Prisma 7, PostgreSQL, Swagger
- Auth: username/password, argon2, HTTP-only JWT cookie
- Roles: `JOB_SEEKER`, `COMPANY`, `ADMIN`

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:migrate
npm run dev
```

`npm run prisma:seed` intentionally inserts no rows. To insert demo
accounts and mock job data, run:

```bash
npm run prisma:mock
```

Local URLs:

- Web: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/docs

Mock accounts use `password123` after `npm run prisma:mock`.

- `test001` (`ADMIN`)
- `test002` (`JOB_SEEKER`)
- `test003` through `test077` (`COMPANY`)

## S3 회사 로고 업로드

회사 로고는 브라우저에서 미리 서명된 `PUT` URL을 사용해 S3로 직접 업로드합니다.
API는 `Asset` 레코드를 생성하고, S3 `HeadObject`로 업로드된 객체를 확인한 뒤
준비된 자산을 회사 프로필에 연결합니다.

필수 환경 변수:

- `AWS_REGION`
- `S3_ASSET_BUCKET`
- `S3_PUBLIC_BASE_URL`
- `S3_PRESIGN_EXPIRES_SECONDS`: 생략 시 기본값 `300`
- `NEXT_PUBLIC_S3_PUBLIC_BASE_URL`: Next.js 이미지 호스트 허용 목록에 사용

S3 버킷은 `company-logos/*` 경로에 대한 공개 `GetObject` 권한을 허용해야 합니다.
CORS 설정에서는 웹 출처가 `Content-Type` 헤더와 함께 `PUT` 요청을 보낼 수
있어야 합니다. 운영 환경이 AWS 위에서 실행된다면 장기 액세스 키 대신 EC2/ECS
IAM 역할 사용을 권장합니다.

## AWS EC2 + S3 배포

운영 배포는 다음 구성을 기준으로 준비되어 있습니다.

- S3 정적 웹 사이트 호스팅: Next.js 정적 내보내기 산출물
- EC2 Docker Compose: NestJS API, Caddy, PostgreSQL
- Caddy HTTPS 종료 및 `/api/*` 역방향 프록시
- S3 미리 서명된 업로드: 회사 로고 자산 저장

`deploy/production.env.example`을 `.env.production`으로 복사해 운영 값을 채운 뒤
`docs/aws-ec2-s3-deployment.md`의 운영 가이드를 따릅니다.

```bash
set -a
source .env.production
set +a
npm run deploy:web:s3
docker compose --env-file .env.production -f compose.prod.yml up -d --build
docker compose --env-file .env.production -f compose.prod.yml run --rm api npm run prisma:migrate:deploy
```

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run prisma:mock
```

## Codex Setup

This repo includes project-scoped Codex guidance:

- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `apps/web/.agents/skills/shadcn`

Installed global skills should include OpenAI docs, Playwright, security review/threat modeling, GitHub workflow helpers, and the selected community planning/frontend/backend skills. Restart Codex after installing new global skills so they are picked up.
