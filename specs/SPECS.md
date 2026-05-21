# specs/SPECS.md

## Purpose

Sistren is a school information system (SIS) for Indonesian high schools — a web-based platform that consolidates student records, teacher management, academic data (classes, majors, subjects, semesters), enrollments, grade input and approval, announcements, payment tracking, and user authentication into a single RBAC-protected application.

---

## Constraints

### Platform
- Self-hosted on VPS (Node.js runtime, PM2)
- Single MariaDB instance (no read replicas yet)
- bun as the only runtime/package manager

### Deployment
- Manual deploy via git hooks
- `.env` for configuration — never commit secrets

### Scale
- Target: single high school (~1000 students, ~50 teachers)
- No multi-tenant / multi-school support planned
- Sessions stored in MariaDB via better-auth + Drizzle adapter

### Policy / Compliance
- Soft delete on all entities (audit trail)
- Official documents (SKHU, Ijazah, Rapor) must match Indonesian government format
- No hard deletes except system cleanup

---

## Architecture Decisions

### Why Server Actions over API Routes?
All mutations (create/update/delete) live in `src/actions/*.ts` as Next.js Server Actions. API route placeholders (`src/app/api/`) are created empty for future SSO integration but not used in v1. This keeps mutations co-located with their domain and avoids API boilerplate.

### Why better-auth over Auth.js/NextAuth?
Better-auth is purpose-built for modern Next.js (App Router, Server Components). It provides a cleaner adapter interface for Drizzle ORM and has better TypeScript coverage. Auth.js was considered but had friction with the existing Drizzle schema. RBAC will be implemented through better-auth's `additionalFields.roleId` + custom permissions tables.

### Why Drizzle ORM over Prisma?
Drizzle provides SQL-like query patterns that feel natural to developers who know SQL. Prisma's generated types and query engine add overhead for a solo developer who needs to move fast. Drizzle's `db.transaction()` API is also more explicit for multi-step atomic operations.

### Why Route-level Permission Enforcement via `proxy.ts`?
Instead of checking permissions inside every page component, a Next.js middleware (`proxy.ts`) intercepts all routes and enforces permissions before rendering. This provides a single enforcement point and prevents any route from accidentally becoming publicly accessible. Auth is checked via `auth.api.getSession()` then cross-checked against the `deletedAt` soft-delete flag.

### Why soft delete everywhere?
School data has regulatory retention requirements. Soft delete preserves audit history while keeping the UI clean. All queries default to `WHERE deleted_at IS NULL` unless an admin explicitly needs to view deleted records.

### Why 5 roles with granular permissions?
A single "admin" role doesn't work for a school — a teacher should only input grades for their assigned classes, not see all students. Role levels (100/80/60/40/20) provide quick hierarchy checks, while granular permissions handle fine-grained control (e.g., `grades.input` vs `grades.approve`).

### Why student self-registration with admin approval?
Indonesian schools require identity verification before granting student access. Self-registration creates a pending record; admin reviews and approves before the better-auth account is activated.

### Why admin inputs grades (not guru)?
Indonesian schools typically have administrative staff (TU) handle grade entry. Guru provides grades on paper; admin enters them into the system. This reduces error and provides an audit trail.

### Why predicate computed from score?
The standard Indonesian grading system maps 1-100 scores to predicates (A/B/C/D/E). Computing from score ensures consistency and avoids manual entry errors. The formula: 90-100=A, 80-89=B, 70-79=C, 60-69=D, 0-59=E.

### Why official documents in government format?
SKHU, Ijazah, and Rapor are legal documents with specific government-mandated layouts. PDF generation must match these formats for the documents to be legally valid.

---

## Anti-patterns

### ❌ Direct DB access from Client Components
Client Components never import from `@/lib/db` directly. All data access goes through Server Actions in `src/actions/`. This prevents accidental data exposure and keeps auth checks in one place.

### ❌ Skipping soft delete filters
Every query MUST include `isNull(deletedAt)` in the WHERE clause unless the operation is an admin-level "view deleted records" feature. Forgotten filters = data leak.

### ❌ Disabling `experimental.joins` in better-auth
Enabling `experimental.joins: true` fails on MariaDB because `json_arrayagg` with LATERAL JOIN produces a syntax error. The joins are disabled and queries are written manually.

### ❌ Using Tailwind v3 config with v4
Tailwind v4 uses CSS-first configuration (`@theme` directive). `tailwind.config.js` is not used. All custom colors, fonts, and plugins must be defined in CSS.

### ❌ Using better-auth `signUpEmail()` for staff accounts
Staff accounts (guru, admin) are created by admin from the dashboard. Student self-registration uses `signUpEmail()` with admin approval. Better-auth's `signUpEmail()` is for student self-service only.

### ❌ Skipping `typecheck` before commits
The codebase has no CI yet. Running `bun run typecheck` before every commit prevents type regressions from silently entering the codebase.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-21 | Student self-registration with admin approval | Schools need identity verification before granting access |
| 2026-05-21 | Admin inputs grades (not guru) | Indonesian schools typically have admin/TU handle grade entry |
| 2026-05-21 | Keep API route placeholders for SSO | Future SSO integration without restructuring |
| 2026-05-21 | Official documents in government format | Legal requirement for SKHU/Ijazah |
| 2026-05-21 | Replace RBAC with better-auth roles | Align with better-auth's additionalFields system |
| 2026-05-21 | Score 1-100, predicate computed | Standard Indonesian grading system |

---

## Relationship to AGENTS.md

- **AGENTS.md** = how to work (commands, rules, gotchas, conventions)
- **SPECS.md** = why it exists (purpose, constraints, decisions, anti-patterns)
- **PLAN.md** = what to build and in what order (phases, dependencies, scope)
- **TASKS.md** = cross-session goal tracker
- **issues.md** = current critical bugs blocking development

AGENTS.md is the daily driver for an AI agent. SPECS.md provides the architectural context that explains _why_ the code is structured the way it is. PLAN.md provides the roadmap. TASKS.md tracks progress. issues.md is the current priority list.