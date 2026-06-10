# SPECS.md

## Purpose

SIS for Indonesian high school — student records, teachers, classes, enrollments, Rapor, announcements, payments, auth + RBAC.

## Constraints

Self-hosted MariaDB, bun only. Soft delete everywhere. Gov-format documents. ~1000 students.

## Architecture Decisions

- Mutations via Server Actions at `src/actions/*.ts`. API routes empty (future SSO).

- Auth: better-auth. Staff via `auth.api.createUser()`. Students via `signUpEmail()` + admin approval. `createUser()` can't set additionalFields (GitHub #3602) — use Drizzle update post-creation. `nextCookies()` must be last plugin.

- RBAC: custom perms table + roleId FK. Enforced at route level via `proxy.ts` middleware (single point).

- DB: Drizzle ORM + MariaDB. No LATERAL JOIN (MariaDB limitation). IDs: users = UUID v4, roles = BIGINT.

- UI: shadcn/ui (L3). Components copied to `components/ui/`. All colors via `hsl(var(--primary))`. `cn()` for class merging. Variants: default|ghost|destructive|outline|secondary. Server Components default — `use client` only when needed.

- Soft delete: `deletedAt` timestamp. Null = active. `isNull(deletedAt)` on every query.

- Documents: Encrypted `longtext` in DB. AES-256-GCM via `DOCUMENT_ENCRYPTION_KEY` (32 bytes). 10 types (ijasah, skhun, skl, akta, kk, ktp, kip, foto, rapor). `max_allowed_packet` ≥ 64MB.

- Grades: 1 table with type enum (knowledge/skill/attitude/extracurricular). Sub-scores: dailyTest1-4, midterm, finalExam, practical, project, portfolio. Unique: (enrollmentId, subjectId, type).

- Payments (Odoo pattern): `payment_items` as templates. `payments.price` always editable — catalog price is default, never enforced.

- Enrollment state machine: active → transferred|dropped|graduated. transferred → dropped allowed. dropped|graduated = terminal. Logged to audit_logs.

- Bulk enrollment: chunk 50/transaction, skip existing via unique constraint, fail-fast.

- Religions: Normalized to separate table. Values: Islam, Kristen, Katolik, Hindu, Budha, Konghucu.

## Anti-patterns

- Direct DB from Client Components
- Skipping `isNull(deletedAt)` on queries
- `experimental.joins` in better-auth (MariaDB fails)
- Tailwind v3 config (v4 uses `@theme`)
- `signUpEmail()` for staff
- `Number()` on UUID string (NaN coerces to 0)
- Binary/mediumblob — use `longtext`
- Unique constraint names >64 chars

## Relationships

AGENTS.md = commands/rules. PLAN.md = roadmap. TASKS.md = goals. issues.md = bugs.
