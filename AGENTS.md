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

### better-auth
- Session user ID is string; cast to Number for DB queries: `Number(session.user.id)`
- Session stored in DB via drizzle adapter; custom queries use `getUserWithRole()`
- `verifySession()` / `verifyPermission()` redirect to `/login` or `/unauthorized`

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

## Role Levels

- 100: superadmin (full access)
- 80: administrator (TU/admin staff)
- 60: guru (teacher)
- 40: siswa (student)
- 20: alumni (read-only own transcript)