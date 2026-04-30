# AGENTS.md

## Project Overview

This repository contains a CPA-focused job curation platform prototype.
The product aggregates accountant/CPA job postings and makes them searchable by
deadline, trainee eligibility, KICPA requirement, job family, company type, and
experience level.

## Stack

- Monorepo: npm workspaces
- Web: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, lucide-react
- API: NestJS, Prisma, PostgreSQL, Swagger/OpenAPI
- Shared: TypeScript enums and DTO-friendly types
- Auth: username/password, argon2 password hashing, HTTP-only JWT cookies
- Roles: `JOB_SEEKER`, `COMPANY`, `ADMIN`

## Workspace Layout

- `apps/web`: user-facing and admin web UI
- `apps/api`: REST API, auth, Prisma, Swagger
- `packages/shared`: shared constants, enums, and TypeScript types
- `prisma`: Prisma schema, migrations, and seed scripts

## Development Commands

- Install dependencies: `npm install`
- Run all dev servers: `npm run dev`
- Run web only: `npm run dev:web`
- Run API only: `npm run dev:api`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Test: `npm run test`
- Generate Prisma client: `npm run prisma:generate`
- Run Prisma migrations: `npm run prisma:migrate`
- Seed database: `npm run prisma:seed`

## Product Rules

- Phase 0 focuses on job discovery and curation, not internal applications.
- Public visitors and personal members can browse jobs and company pages.
- Company members submit job posting requests; admins approve before publication.
- Admins can create, edit, close jobs, review AI suggestions, and manage sources.
- Always show source and last checked time for job data.
- Do not scrape or republish Jobplanet/Blind reviews. Link externally only.

## Security Rules

- Never store plaintext passwords.
- Do not expose admin endpoints without role checks.
- Validate request bodies with DTO validation on the API boundary.
- Keep JWT secrets and API keys in environment variables.
- Treat CSV import, URL preview, and AI-generated labels as untrusted inputs.

## Agent Workflow

- Use `explorer` for read-only repo mapping and specific codebase questions.
- Use `worker` for bounded implementation tasks with clear file ownership.
- Workers are not alone in the codebase. Do not revert edits made by others.
- Keep parallel work ownership disjoint: API, web, data/AI, and QA should not edit
  the same files at the same time unless the coordinator explicitly assigns it.

## UI Guidance

- Build the actual app as the first screen, not a landing page.
- Use shadcn/ui components for forms, filters, cards, dialogs, tabs, and tables.
- Job list cards must surface deadline, D-day, KICPA condition, trainee status,
  company type, source, and last checked time.
- Prefer dense, scannable operational UI over marketing-style hero layouts.

## Verification

- Run focused tests for touched code.
- Before finishing large UI changes, verify the running app in a browser.
- If Docker is unavailable, report that local PostgreSQL could not be started.
