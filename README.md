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
npm run prisma:seed
npm run dev
```

Local URLs:

- Web: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/docs

Seed accounts use `password123`.

- `admin`
- `jobseeker`
- `company`

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Codex Setup

This repo includes project-scoped Codex guidance:

- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `apps/web/.agents/skills/shadcn`

Installed global skills should include OpenAI docs, Playwright, security review/threat modeling, GitHub workflow helpers, and the selected community planning/frontend/backend skills. Restart Codex after installing new global skills so they are picked up.
