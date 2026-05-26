# AGENTS.md — Sistren

## Stack

- **Runtime:** bun only
- **Framework:** Next.js 16 (App Router), React 19
- **ORM:** Drizzle ORM + MariaDB
- **Auth:** Better Auth + RBAC (role-level + permissions)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **DB Schema:** `src/lib/db/schema/`

## Commands

```bash
# Dev
bun run dev

# Build
bun run build

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format

# DB seed (after migrations)
bun run db:seed

# DB test connection
bun run db:test

# Generate migration
bunx drizzle-kit generate

# Push schema (dev only)
bunx drizzle-kit push

# Run migrations
bunx drizzle-kit migrate
```

## Environment Variables

| Variable                  | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`            | MySQL connection string                                   |
| `BETTER_AUTH_SECRET`      | Secret for better-auth session signing                    |
| `BETTER_AUTH_URL`         | Public URL for better-auth (e.g., http://localhost:3000)  |
| `DOCUMENT_ENCRYPTION_KEY` | 32-byte hex or base64 key for AES-256-GCM blob encryption |

## Rules

1. **bun only** — Use `bun` for all package management and scripts. Never `npm`, `yarn`, `pnpm`.
2. **No manual deps** — Use `bun add` or `bun remove`. Never edit `package.json` manually.
3. **No pinned versions** — Use ranges (`^`). Let bun resolve compatible versions.
4. **Never commit secrets** — Never commit `.env`, `.env.*`, or any file containing credentials.
5. **Soft delete aware** — Every user-facing query MUST filter `deletedAt IS NULL`. Forgot = data leak.
6. **Read before edit** — Always read existing files before modifying them.
7. **Verify before execute** — Run typecheck/lint before assuming code is correct.
8. **Trace before test** — Hand-trace logic with n=2 before writing tests.

## Gotchas

### Drizzle + MariaDB

- `experimental.joins` disabled in `auth()` config — MariaDB doesn't support `json_arrayagg` with LATERAL JOIN syntax
- Soft delete pattern: `isNull(users.deletedAt)` filter required on every query
- `drizzle-kit push` for dev schema changes, `generate + migrate` for prod
- Transactions: use `db.transaction(async (tx) => { ... })` for atomic ops
- Blob columns: `Buffer` in Node.js maps to `mediumblob()` / `MEDIUMBLOB` in MariaDB. Use `mediumblob()` for files up to 16MB.

### better-auth UUID IDs

All auth-related IDs (users, sessions, accounts, verifications) are `varchar(36)` UUID strings.
`roles.id` stays `BIGINT auto-increment`.

### better-auth Admin Plugin

- Staff accounts (guru, admin) must be created via Admin plugin: `auth.api.createUser()` — never bypass better-auth with direct DB inserts
- Admin plugin also provides `listUsers`, `banUser`, `impersonate`
- `additionalFields.roleId` configured in auth options; maps to custom `roles` table
- **nextCookies plugin** — Required for Server Action cookie setting. Must be last in plugins array.

### Soft Delete Per Table

`sessions` and `accounts` have their own `deletedAt` column (separate from `users.deletedAt`).
When a user is soft-deleted, their sessions/accounts are independently soft-deleted.

### File Uploads (Student Documents)

- All student documents are stored as **encrypted** `MEDIUMBLOB` — AES-256-GCM, key via `DOCUMENT_ENCRYPTION_KEY` env var
- Encryption utility: `encryptBlob`/`decryptBlob` from `src/lib/crypto.ts`. Use for all blob inserts.
- Never store unencrypted blobs.
- Document types: `ijasah`, `skhun`, `skl`, `akta_kelahiran`, `kk`, `ktp_ayah`, `ktp_ibu`, `kip`, `pass_foto`, `rapor` (per semester)
- Next.js Server Actions accept `FormData`. Extract file via `formData.get('file')`
- Default Server Action body size limit is 1MB. Set `serverActions.bodySizeLimit: 16 * 1024 * 1024` in `next.config.ts`
- MariaDB `max_allowed_packet` must be **64MB minimum** in `/etc/mysql/mariadb.conf.d/` for 10 blob fields per student
- Serve blob files via `Response` with correct `Content-Type` header — do not serve from page component
- Each document field is versionable — upload new version, soft-delete old

### RBAC

- Permission check: `hasPermission(userId, 'resource.action')`
- Role level check: `hasRoleLevel(userId, minLevel)`
- Superadmin bypass: level >= 100 bypasses all permission checks
- Last superadmin protection: cannot delete/remove role from the last superadmin

### Tailwind CSS v4

- No `tailwind.config.js` — config lives in CSS via `@theme` directive
- `shadow-sm` → `shadow-xs`, `rounded-sm` → `rounded-xs`
- Use `size-*` instead of `w-* h-*`
- `tw-animate-css` replaces deprecated `tailwindcss-animate`

### Next.js App Router

- Server Components by default; add `'use client'` only when needed
- Actions in `src/actions/` are server-side; imported directly, not fetched
- `proxy.ts` handles route-level auth and permissions

## Permissions Reference

```
users.create/read/update/delete
students.create/read/update/delete/promote/graduate/import
teachers.create/read/update/delete/assign_class/assign_subject
classes.manage, majors.manage, subjects.manage, semesters.manage
enrollments.create/read/update/delete
grades.input/read_any/read_own/approve/print
announcements.create/read/update/delete/publish
payments.create/read_any/read_own/update/approve/generate_report
payment_methods.manage, system_configs.manage
profile.edit_own/edit_any/assets.upload
```

## Specs Structure

```
specs/
  SPECS.md      — Purpose, constraints, architecture decisions, anti-patterns
  PLAN.md       — Phase roadmap, dependencies, out-of-scope
  TASKS.md      — Cross-session goal tracker (milestones, not atomic tasks)
  issues.md     — Critical bugs blocking development
  tasks/        — Atomic task documentation during planning sessions
    tasks-YYYY-MM-DD.md  — Task list for a specific planning/implementation session
```

## Task Tracking

- **Atomic tasks** are documented in `specs/tasks/tasks-{date}.md` — created during planning sessions, each task is self-contained and completable in one session
- **After implementing a task**, the agent MUST update `specs/TASKS.md` (mark done, add notes) and update the relevant `tasks-{date}.md` file
- **During planning**: when breaking down a phase or goal into actionable tasks, write the task list to `specs/tasks/tasks-{date}.md` first, then register milestones in `TASKS.md`
- **Cross-session goals** stay in `TASKS.md`; atomic tasks live in `specs/tasks/`

## Style: shadcn/ui + Tailwind CSS v4

**Components:** All UI components must be shadcn/ui. Run `bunx shadcn@latest add <component>` to add. Never manually copy-paste shadcn components — use the CLI.

**Theme tokens (design tokens):**

```
background / foreground     ← page shell, default text
card / card-foreground       ← elevated surfaces (Card, panels)
popover / popover-foreground
primary / primary-foreground   ← high-emphasis actions, brand
secondary / secondary-foreground
muted / muted-foreground       ← placeholders, helper text
accent / accent-foreground     ← hover, focus, active states
destructive / destructive-foreground
border                        ← cards, menus, tables, dividers
input                         ← form controls
ring                          ← focus rings
```

**CSS variables pattern:** `hsl(var(--primary))` — never hardcode hex/HSL in component files.

**`cn()` utility:** Use for all conditional Tailwind classes. Never template literals.

```tsx
import { cn } from '@/lib/utils';
<div className={cn('base', condition && 'conditional')} />;
```

**Variant prop values:** `"default" | "ghost" | "destructive" | "outline" | "secondary"` — follow shadcn naming.

**Server Components by default:** Add `'use client'` only for browser APIs, hooks, event handlers.

**Icons:** Phosphor Icons (`@phosphor-icons/react`).

## Role Levels

- 100: superadmin (full access)
- 80: administrator (TU/admin staff)
- 60: guru (teacher)
- 40: siswa (student)
- 20: alumni (read-only own transcript)
