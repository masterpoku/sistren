# specs/SPECS.md

## Purpose

Sistren is a school information system (SIS) for Indonesian high schools — a web-based platform that consolidates student records, teacher management, academic data (classes, majors, subjects, semesters), enrollments, grade input and approval, announcements, payment tracking, and user authentication into a single RBAC-protected application.

---

## Constraints

### Platform
- Self-hosted on VPS (Node.js runtime, not Vercel/Serverless)
- Single MariaDB instance (no read replicas yet)
- bun as the only runtime/package manager

### Deployment
- Manual deploy process (no CI/CD yet)
- `.env` for configuration — never commit secrets

### Scale
- Target: single high school (~1000 students)
- No multi-tenant / multi-school support planned
- Sessions stored in MariaDB via drizzle adapter

### Policy / Compliance
- Soft delete on all entities (audit trail, no hard deletes except system cleanup)
- Role-based access control with permission granularity
- Superadmin last-standing protection (cannot delete last superadmin)

---

## Architecture Decisions

### Why Server Actions over API Routes?
All mutations (create/update/delete) live in `src/actions/*.ts` as Next.js Server Actions. This keeps mutations co-located with their domain, eliminates API boilerplate, and provides type-safe forms out of the box.

### Why better-auth over Auth.js/NextAuth?
Better-auth is purpose-built for modern Next.js (App Router, Server Components). It provides a cleaner adapter interface for Drizzle ORM and has better TypeScript coverage. Auth.js was considered but had friction with the existing Drizzle schema.

### Why Drizzle ORM over Prisma?
Drizzle provides SQL-like query patterns that feel natural to developers who know SQL. Prisma's generated types and query engine add overhead for a solo developer who needs to move fast. Drizzle's `db.transaction()` API is also more explicit for multi-step atomic operations.

### Why Route-level Permission Enforcement via `proxy.ts`?
Instead of checking permissions inside every page component or layout, a Next.js middleware (`proxy.ts`) intercepts all routes and enforces permissions before rendering. This provides a single enforcement point and prevents any route from accidentally becoming publicly accessible.

### Why soft delete everywhere?
School data has regulatory retention requirements. Soft delete preserves audit history while keeping the UI clean. All queries default to `WHERE deleted_at IS NULL` unless an admin explicitly needs to view deleted records.

### Why 5 roles with granular permissions?
A single "admin" role doesn't work for a school — a teacher should only input grades for their assigned classes, not see all students. Role levels (100/80/60/40/20) provide quick hierarchy checks, while granular permissions handle fine-grained control (e.g., `grades.input` vs `grades.approve`).

---

## Anti-patterns

### ❌ Direct DB access from Client Components
Client Components never import from `@/lib/db` directly. All data access goes through Server Actions in `src/actions/`. This prevents accidental data exposure and keeps auth checks in one place.

### ❌ Skipping soft delete filters
Every query MUST include `isNull(deletedAt)` in the WHERE clause unless the operation is an admin-level "view deleted records" feature. Forgotten filters = data leak.

### ❌ Disabling `experimental.joins` in better-auth
Initially tried enabling `experimental.joins: true` for better-auth to simplify queries. This fails on MariaDB because `json_arrayagg` with LATERAL JOIN produces a syntax error. The joins are disabled and queries are written manually.

### ❌ Using Tailwind v3 config with v4
Tailwind v4 uses CSS-first configuration (`@theme` directive). Copying a `tailwind.config.js` from v3 projects will not work. The project uses v4 — all custom colors, fonts, and plugins must be defined in CSS.

### ❌ Skipping `typecheck` before commits
The codebase has no CI yet. Running `bun run typecheck` before every commit prevents type regressions from silently entering the codebase.

---

## Relationship to AGENTS.md

- **AGENTS.md** = how to work (commands, rules, gotchas, conventions)
- **SPECS.md** = why it exists (purpose, constraints, decisions, anti-patterns)

AGENTS.md is the daily driver for an AI agent. SPECS.md provides the architectural context that explains _why_ the code is structured the way it is.