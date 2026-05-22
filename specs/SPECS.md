# specs/SPECS.md

## Purpose

Sistren is a school information system (SIS) for Indonesian high schools — a web-based platform that consolidates student records, teacher management, academic data (classes, majors, subjects, semesters), enrollments, Rapor uploads, announcements, payment tracking, and user authentication into a single RBAC-protected application.

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

### Why better-auth Admin plugin for staff account creation?
Better-auth's Admin plugin (`admin()`) provides `auth.api.createUser()` — the correct way for administrators to create staff accounts (guru, admin). This is separate from student self-registration which uses `signUpEmail()`. The Admin plugin also provides `listUsers`, `banUser`, `impersonate` out of the box.

### Why Drizzle ORM over Prisma?
Drizzle provides SQL-like query patterns that feel natural to developers who know SQL. Prisma's generated types and query engine add overhead for a solo developer who needs to move fast. Drizzle's `db.transaction()` API is also more explicit for multi-step atomic operations.

### Why Route-level Permission Enforcement via `proxy.ts`?
Instead of checking permissions inside every page component, a Next.js middleware (`proxy.ts`) intercepts all routes and enforces permissions before rendering. This provides a single enforcement point and prevents any route from accidentally becoming publicly accessible. Auth is checked via `auth.api.getSession()` then cross-checked against the `deletedAt` soft-delete flag.

### Why shadcn/ui as the component foundation?
shadcn/ui is not a component library — it's a component _distribution platform_. Components are copied into the project (`components/ui/`), not installed as a package. This gives full ownership: you own the code, can customize anything, and are not dependent on a library maintainer to ship a fix or feature. The trade-off is that you must maintain the components yourself when shadcn/ui releases updates.


**Sistren's shadcn maturity levels:**

| Level | Name | Description |
|-------|------|-------------|
| L0 | Ad-hoc | Manually copied components, no `components.json`, no theme system |
| L1 | Initial | `components.json` exists, CLI can add components, CSS variables defined |
| L2 | Managed | `ThemeProvider` in root layout, dark mode works, all tokens aligned to shadcn convention |
| L3 | Defined | Custom registry with Sistren branding, all 50+ shadcn components available, CLI-managed |
| L4 | Optimized | Component variants frozen to registry, no manual edits outside registry, automated diff checks |

**Target for Sistren: L3** — full shadcn integration with custom branding layer on top.

### Why a shadcn skill for AI agents?
The shadcn skill (`bunx shadcn@latest init`) gives AI agents project-aware context: framework version, Tailwind version, installed components, aliases, icon library. Without it, agents generate code that doesn't match your project configuration. With it, agents produce correct code on first try.

### UI/UX Anti-Isolation Standards (Anti-Isolops)

"Isolops" = agents working in isolation, producing siloed UI that doesn't integrate with the design system. Each agent writes their own components with inconsistent tokens, variant names, and interaction patterns.

**To prevent isolops, every UI task must:**


1. **Use shared CSS variables** — never hardcode hex values, HSL values, or Tailwind color utilities outside the design token system (`hsl(var(--primary))`, `bg-background`, `text-foreground`)
2. **Extend existing components first** — before building a new UI element, check if a shadcn component covers the use case. Custom components are last resort.
3. **Use `cn()` for all conditional classes** — never use template literals or string concatenation for Tailwind classes. `cn()` merges Tailwind correctly.
4. **Follow shadcn variant conventions** — components use `variant` prop with values like `"default"`, `"ghost"`, `"destructive"`, `"outline"`, `"secondary"`. Do not invent custom variant names without documenting them.
5. **Server Components by default** — add `'use client'` only when the component uses browser APIs, React hooks, or event handlers. Prefer composition: a parent Server Component wrapping child Client Components.
6. **No layout-specific logic in components** — components are layout-agnostic. Sidebar visibility, page padding, and routing belong in page files, not component internals.
7. **Document non-obvious patterns** — any custom variant, custom token, or deviation from shadcn defaults must be documented in the component file as a comment.

**Compliance check (before any UI PR merges):**
- [ ] All colors use design tokens (no raw hex/HSL in component files)
- [ ] All interactive elements use existing shadcn components or documented custom components
- [ ] `cn()` used for all conditional class merging
- [ ] Variant props follow shadcn naming conventions
- [ ] No `'use client'` without explicit justification
- [ ] ThemeProvider covers root layout

### Why soft delete everywhere?
School data has regulatory retention requirements. Soft delete preserves audit history while keeping the UI clean. All queries default to `WHERE deleted_at IS NULL` unless an admin explicitly needs to view deleted records.

**Drizzle idiomatic pattern:** `deletedAt` timestamp column. `null` = active, non-null = deleted. No `isDeleted` boolean needed — timestamp gives you both state and timing. Every schema that supports deletion includes this column.

### Why transaction boundaries are explicit?
School operations often require atomicity: enrollment + payment creation, user delete + profile delete. Drizzle's `db.transaction(async (tx) => {...})` wraps these. Every multi-step write operation that touches multiple tables MUST be wrapped in a transaction. Single-table operations don't need transactions.

### Why student self-registration collects Name, Email, Password, NISN?
NISN (Nomor Induk Siswa Nasional) is the national student ID issued by Ministry of Education. It's verifiable, unique, and links to the national student database. Self-registration collects: name, email, password, NISN. Admin approval activates the account.

### Why documents stored as encrypted blob in MariaDB?
All student documents (Ijazah, SKHUN, SKL, Akta Kelahiran, KTP orang tua, Kartu Keluarga, KIP, Pas Foto, Rapor) are stored as encrypted `MEDIUMBLOB` in MariaDB. Same rationale as Rapor: simple, DB-backed backup, no separate storage service. Documents contain sensitive personal data (KTP, KK) so encryption at rest is required.

**Encryption:** AES-256-GCM via `DOCUMENT_ENCRYPTION_KEY` env var. Key must be 32 bytes (256-bit). All document blobs are encrypted before insert and decrypted on retrieval. Never store unencrypted blobs.

**MariaDB config requirement:** `max_allowed_packet` must be set to at least 64MB in MariaDB config (`/etc/mysql/mariadb.conf.d/`) — 10 blob fields × 2MB avg + encryption overhead + margin.

**Document types stored as blob:**
| Field | Label | Max Size | Notes |
|-------|-------|----------|-------|
| `ijasah` | Ijazah (SMP/sederajat) | 2MB | Graduation certificate |
| `skhun` | SKHUN | 2MB | Exam result certificate |
| `skl` | Surat Keterangan Lulus | 2MB | Graduation confirmation letter |
| `akta_kelahiran` | Akta Kelahiran | 2MB | Birth certificate |
| `kk` | Kartu Keluarga | 2MB | Family card — was missing in old system, now included |
| `ktp_ayah` | KTP Ayah | 2MB | Father's ID card |
| `ktp_ibu` | KTP Ibu | 2MB | Mother's ID card |
| `kip` | KIP (Kartu Indonesia Pintar) | 2MB | Social assistance card |
| `pass_foto` | Pas Foto 3x4 | 1MB | Student photo (B&W or color) |
| `rapor` | Rapor (per semester) | 16MB | Report card PDF — generated via government software |

**Schema pattern:** Single `student_documents` table with one blob column per document type, linked to `users.id` via `studentId`. Soft delete per document type (each document versionable — upload new, keep old).

### Why payment records + payment methods?
Schools track who paid what, when, and via which account. Admin records payment entries manually (cash, bank transfer). Payment methods (bank account numbers, virtual accounts) are managed separately. Later phases can add auto-payment integration.

### Why audit logging for auth and payments?
Indonesian schools require financial accountability. Every login, logout, failed attempt, and payment confirmation is logged with user ID, timestamp, and action. Logs are append-only — never deleted. Useful for: dispute resolution, security audit, compliance.

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
Staff accounts (guru, admin) are created by admin using the Admin plugin (`auth.api.createUser()`). Student self-registration uses `signUpEmail()` with admin approval. Better-auth's `signUpEmail()` is for student self-service only.

### ❌ Skipping `typecheck` before commits
The codebase has no CI yet. Running `bun run typecheck` before every commit prevents type regressions from silently entering the codebase.

### ❌ Casting `session.user.id` (UUID string) to `Number()`
`users.id` is `varchar(36)` UUID string. `Number("uuid-string")` = `NaN`. In MariaDB, `NaN` coerces to `0` on INSERT into a numeric column. Every `Number(userId)` call silently corrupts data — permission overrides get `userId=0`, permission lookups return empty. **Never use `Number()` on a UUID string.**

**Fix pattern:** Pass `session.user.id` as-is (string) to all functions. Only cast at the DB boundary if the column type requires it — and if it does, the column type should match first.

### ❌ Isolops — Siloed UI Development
Producing UI components without referencing the shared design system. Each agent or task writes components in isolation, creating inconsistent tokens, variant names, and interaction patterns.

**Anti-isolops rules:**
- All colors from design tokens only — no raw hex/HSL in component files
- Extend shadcn components before building custom — custom is last resort
- All class merging via `cn()` — never template literals for Tailwind
- Variant props follow shadcn naming (`variant="default|ghost|destructive|outline|secondary")
- Server Components by default — `'use client'` only when necessary
- Layout-agnostic components — sidebar/padding/routing belong in page files
- Document any custom variant or token deviation inline

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-21 | Student self-registration collects Name + Email + Password + NISN | NISN is national student ID, verifiable and unique |
| 2026-05-21 | Staff accounts created via better-auth Admin plugin | `auth.api.createUser()` is the correct path — not manual insert bypassing better-auth |
| 2026-05-21 | Keep API route placeholders for SSO | Future SSO integration without restructuring |
| 2026-05-21 | Official documents in government format | Legal requirement for SKHU/Ijazah |
| 2026-05-21 | Replace RBAC with better-auth roles | Align with better-auth's additionalFields system + Admin plugin |
| 2026-05-21 | Rapor stored as MEDIUMBLOB in MariaDB | Government software generates PDF; blob keeps file + DB together, simple backup |
| 2026-05-21 | Grades table kept for future extensibility | Table stays in schema (unused for now) — can add structured input later if needed |
| 2026-05-21 | Soft delete via deletedAt timestamp | Drizzle idiomatic — timestamp gives state + timing, no boolean needed |
| 2026-05-21 | Explicit transaction wrapping | Every multi-step write across tables must be in `db.transaction()` |
| 2026-05-21 | Audit log auth + payments | Financial and academic accountability; Rapor is uploaded not entered so no grade audit |
| 2026-05-21 | Env vars: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, DOCUMENT_ENCRYPTION_KEY | Minimal config for VPS deployment; DOCUMENT_ENCRYPTION_KEY = 32-byte key for AES-256-GCM |
| 2026-05-21 | MariaDB `max_allowed_packet` = 64MB minimum | 10 blob fields per student × 2MB avg + encryption overhead + margin |
| 2026-05-21 | shadcn/ui as component foundation, L3 target | Not a package — components copied into project. Full ownership, CLI-managed updates |
| 2026-05-21 | shadcn skill for AI agents | Project-aware context = correct code on first try from AI agents |
| 2026-05-21 | UI/UX Anti-Isolation Standards | Prevent siloed UI: shared tokens, extend-first, cn(), variant conventions, SFC by default |
| 2026-05-21 | UUID v4 for all auth table IDs (users, accounts, sessions, verifications) | better-auth default; `crypto.randomUUID()` on insert. roles.id stays BIGINT. Different ID spaces avoid FK conflicts. |
| 2026-05-21 | verifications table HAS `id: varchar(36) PK` | CORRECTION: earlier memory claimed "NO id column". Official better-auth docs confirm: `id: string PK` required. Task file had this wrong. |
| 2026-05-21 | accounts: `accessTokenExpiresAt` + `refreshTokenExpiresAt` (NOT `expiresAt`) | Official better-auth field names. Task file had `expiresAt` wrong. |
| 2026-05-21 | accounts.`accountId` is NOT NULL | Official better-auth requirement. Task file marked it optional — wrong. |
| 2026-05-21 | Soft delete per table independently | sessions and accounts have their own deletedAt — not cascaded from users. Each table is independently soft-deletable. |
| 2026-05-21 | Grades table NOT in schema | Rapor stored as encrypted blob via attachments. No structured grade input in v1. Task file had grades — wrong. |
| 2026-05-21 | nextCookies() MUST be last in plugins array | better-auth/next-js requirement. Placing any plugin after it breaks cookie handling. |
| 2026-05-22 | `user_permissions.userId` bigint → varchar(36) migration | `users.id` is UUID string, `bigint` FK caused NaN coerces to 0 in MariaDB. All user FK columns now varchar(36) for type consistency. |
| 2026-05-22 | Admin plugin excluded from server auth | Conflicts with custom RBAC roleId FK system. Admin plugin expects `role` string field, we use `roleId` number FK. Admin ops via server actions only. |
| 2026-05-22 | `createUser()` cannot set additional fields via `data` param | GitHub Issue #3602 confirmed. Must use Drizzle `update()` after `auth.api.createUser()` to set roleId and other additionalFields. |
| 2026-05-22 | Permissions route `src/app/api/auth/permissions/route.ts` deleted | Not used by any client-side code. Stub code that imported non-existent `getUserPermissions`. |
| 2026-05-22 | `emailVerified = false` is the pending approval state | No separate status field. Admin sets `emailVerified = true` as the approval action. |

---

## Relationship to AGENTS.md

- **AGENTS.md** = how to work (commands, rules, gotchas, conventions)
- **SPECS.md** = why it exists (purpose, constraints, decisions, anti-patterns)
- **PLAN.md** = what to build and in what order (phases, dependencies, scope)
- **TASKS.md** = cross-session goal tracker
- **issues.md** = current critical bugs blocking development

AGENTS.md is the daily driver for an AI agent. SPECS.md provides the architectural context that explains _why_ the code is structured the way it is. PLAN.md provides the roadmap. TASKS.md tracks progress. issues.md is the current priority list.