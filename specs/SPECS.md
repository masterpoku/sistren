# Sistren

## Purpose & Problem

Indonesian high schools manage student academic data across multiple domains — enrollment, grading, attendance, payments, documents, and announcements. Existing solutions are either proprietary, expensive, or don't handle Indonesian government-format requirements (rapor, ijazah). Sistren is a self-hosted SIS designed for ~1000-student schools, built on modern web standards with RBAC for admin, teacher, and student roles. Differentiator: open-source, self-hosted, handles K13/Kurikulum Merdeka grading with government document encryption, and soft-delete safety throughout.

## Requirements

### Functional

- FR-001: User authentication via email/password with session management (better-auth). Staff accounts created by admin via `auth.api.createUser()`. Students self-register via `signUpEmail()` and require admin approval. Priority: High. Verification: Test.
- FR-002: Role-based access control with hierarchical permissions. Level >= 100 bypasses all checks. Permissions granular per entity/action (c,r,u,d). Priority: High. Verification: Test.
- FR-003: Student record CRUD with NISN, biodata, address, parent info, religion (normalized in separate table). Soft delete. Bulk import from CSV/Excel. Priority: High. Verification: Test.
- FR-004: Teacher record CRUD with subject and class assignment. Soft delete. Priority: High. Verification: Test.
- FR-005: Class CRUD (grade level, major, rombel group). Priority: High. Verification: Inspection.
- FR-006: Subject CRUD (name, code, hours per week). Priority: High. Verification: Inspection.
- FR-007: Major/department CRUD (jurusan: IPA, IPS, Bahasa, etc). Priority: Medium. Verification: Inspection.
- FR-008: Semester/academic year CRUD with active semester flag. Priority: Medium. Verification: Inspection.
- FR-009: Student enrollment with state machine: active → transferred | dropped | graduated. Transferred → dropped allowed. Dropped/graduated = terminal. Bulk enrollment: chunk 50/transaction, skip existing via unique constraint, fail-fast. Priority: High. Verification: Test.
- FR-010: Grade entry with 4 types (knowledge, skill, attitude, extracurricular). Sub-scores: dailyTest1-4, midterm, finalExam, practical, project, portfolio. Unique constraint: (enrollmentId, subjectId, type). Grade approval workflow. Priority: High. Verification: Test.
- FR-011: Attendance tracking per session per student. Priority: Medium. Verification: Test.
- FR-012: Payment management (Odoo pattern). `payment_items` as templates. `payments.price` always editable — catalog price is default, never enforced. Record, confirm, refund workflows. Payment method CRUD. Priority: Medium. Verification: Test.
- FR-013: Announcement CRUD with publish/unpublish. Role-targeted visibility. Priority: Medium. Verification: Test.
- FR-014: Encrypted document storage (AES-256-GCM) for 10 document types (ijasah, skhun, skl, akta, kk, ktp, kip, foto, rapor). Stored as `longtext` in DB. `max_allowed_packet` >= 64MB. Priority: Medium. Verification: Test.
- FR-015: Student promotion to next grade level and graduation workflow. Priority: Medium. Verification: Test.
- FR-016: Rapor/KHS generation in government-compatible format. Priority: Medium. Verification: Inspection.
- FR-017: Dashboard with role-specific summaries (admin overview, teacher class view, student progress). Priority: Medium. Verification: Inspection.
- FR-018: Audit logging for all mutations — timestamp, actor, action, entity, details. Priority: Medium. Verification: Inspection.
- FR-019: School profile settings (name, address, logo, academic year). Priority: Low. Verification: Inspection.
- FR-020: Admin approval workflow for pending student registrations. Priority: Medium. Verification: Test.
- FR-021: Boarding/hostel module — student dormitory assignment and tracking. Priority: Low. Verification: Test.
- FR-022: Finance module — payment summaries, reporting, balance tracking. Priority: Low. Verification: Inspection.
- FR-023: System configuration for tunable settings. Priority: Low. Verification: Inspection.

### Non-Functional

- NFR-001: All mutations use Server Actions at `src/actions/*.ts`. No direct DB from client components. Priority: High. Verification: Inspection.
- NFR-002: Soft delete on all entities. `deletedAt` timestamp, null = active. `isNull(deletedAt)` on every query. Priority: High. Verification: Inspection.
- NFR-003: Server Components by default. `use client` only when using Phosphor icons, shadcn Card/Badge, or hooks. Priority: High. Verification: Inspection.
- NFR-004: Self-hosted MariaDB. No cloud dependency. ~1000 student scale. Priority: High. Verification: Analysis.
- NFR-005: Build must pass zero errors before deployment (`bun run build`). Priority: High. Verification: Analysis.

## Architecture Decisions

- **Auth: better-auth** over next-auth (more flexible for custom RBAC) or Lucia (less maintained). Staff via `createUser()`, students via `signUpEmail()` + admin approval. `nextCookies()` must be last plugin. Trade-off: `createUser()` can't set additionalFields (GitHub #3602) — requires Drizzle update post-creation.
- **RBAC: custom perms table** over CASL (overkill for hierarchy-based model) or ad-hoc middleware (inconsistent). Single enforcement point in `proxy.ts` middleware. Trade-off: more tables, but explicit and auditable.
- **DB: Drizzle ORM + MariaDB** over Prisma (binary size, slow typegen) or TypeORM (maintenance concerns). No LATERAL JOIN support (MariaDB limitation). IDs: users UUID v4, roles BIGINT auto. Trade-off: no migration seeds, need separate seed script.
- **UI: shadcn/ui (L3) + Tailwind v4** over MUI (heavy, not server-component-friendly) or Radix primitives only. Components copied to `components/ui/`. All colors via `hsl(var(--primary))`. `cn()` for class merging.
- **Soft delete via `deletedAt`** over deleted flag (requires nullable handling) or separate archive tables (complex queries). Trade-off: every query needs `isNull(deletedAt)` filter — easy to forget.
- **Document encryption: AES-256-GCM stored as `longtext`** over filesystem storage (backup complexity) or binary BLOB (255B cap). Trade-off: `max_allowed_packet` must be >= 64MB. Key from `DOCUMENT_ENCRYPTION_KEY` env var.
- **Grades: single table with type enum** over separate tables per type (schema duplication). Sub-scores as nullable columns. Unique: (enrollmentId, subjectId, type). Trade-off: some sparse columns.
- **Enrollment state machine** over simple active/inactive flag. States: active → transferred|dropped|graduated. Terminal states: dropped|graduated. Transferred allows re-enrollment path. Logged to audit_logs.
- **Payments: Odoo pattern** — `payment_items` as catalog templates, `payments.price` always editable. Trade-off: no enforced catalog pricing, but handles discounts and adjustments without schema changes.
- **Religions: normalized separate table** over enum string column. Values: Islam, Kristen, Katolik, Hindu, Budha, Konghucu. Trade-off: join required for display, but enforces data integrity.

## Anti-patterns

- Direct DB queries from Client Components — bypasses Server Action auth checks and RBAC. Root cause: convenience shortcuts during prototyping.
- Skipping `isNull(deletedAt)` on queries — leaks soft-deleted records. Root cause: forgetting soft delete is opt-out by default instead of opt-in.
- `experimental.joins` in better-auth — MariaDB doesn't support LATERAL JOIN, crashes at query time. Root cause: assuming PostgreSQL-compatible SQL.
- Tailwind v3 `tailwind.config.ts` format — v4 uses `@theme` in CSS. Root cause: habit from v3 projects.
- `signUpEmail()` for staff accounts — triggers self-registration flow, not admin creation. Root cause: confusing API naming.
- `Number()` on UUID string — produces NaN which coerces to 0, silently corrupting queries. Root cause: JavaScript loose coercion.
- Binary/mediumblob for document storage — MariaDB binary caps at 255 bytes. Root cause: PostgreSQL/MySQL habits. Fix: use `longtext`.
- Unique constraint names exceeding 64 characters — MariaDB truncates silently, causing migration errors. Root cause: auto-generated constraint names from composite indexes.

## Constraints

- Self-hosted MariaDB — no cloud DB service. No LATERAL JOIN support. Consequence: complex analytics queries require application-level joins or materialized views.
- Bun runtime only — no npm/pnpm/yarn. Consequence: dependency selection must verify Bun compatibility.
- ~1000 student scale — not designed for multi-school or >10k concurrent users. Consequence: no horizontal scaling in current architecture.
- Soft delete everywhere — no hard deletes. Consequence: storage grows monotonically; periodic archive/cleanup needed.
- AES-256-GCM document encryption — key rotation requires re-encrypting all documents. Consequence: key management process needed.

## Success Criteria

- [ ] All FR-NNN implemented with passing tests or manual inspection
- [ ] Build passes with zero errors (`bun run build`)
- [ ] TypeScript strict mode passes (`bun run typecheck`)
- [ ] All mutations revalidate affected paths
- [ ] No direct DB calls from client components
- [ ] RBAC enforced on all protected routes
- [ ] Soft delete filter present on all entity queries
- [ ] Document encryption round-trips correctly (store → retrieve → decrypt)
- [ ] Enrollment state machine transitions verified (no invalid transitions)
- [ ] All 3 roles (admin, teacher, student) can complete their primary workflows

## Non-Goals & Out of Scope

- Multi-tenant / multi-school support — single school only
- Real-time collaboration — no WebSocket or live sync
- Mobile native app — responsive web only
- SSO / OAuth providers — future concern (API routes reserved but empty)
- External LMS integration (Google Classroom, Moodle)
- AI/ML features (grade prediction, recommendation)
- Internationalization — Indonesian language only
- Public student portal — authenticated access only
- Microservices — monorepo with Next.js API routes

## Dependencies

- MariaDB 10.6+ — database
- Bun 1.2+ — runtime, package manager, build tool
- Next.js 16 (ARM) — web framework
- Drizzle ORM — database access layer
- better-auth — authentication library
- Tailwind CSS v4 — styling
- shadcn/ui — UI component library (copied locally)
- Phosphor Icons — icon set

## Decision Log

- 2025-11-15: Initial architecture decisions recorded — auth (better-auth), DB (Drizzle+MariaDB), UI (shadcn/ui v4), soft delete, encryption, grading schema, enrollment state machine, payment pattern, religion normalization. Context: project bootstrap.
