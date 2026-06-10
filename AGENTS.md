# Sistren — AGENTS

Project: school information system for Indonesian high schools — student records, teachers, classes, enrollments, Rapor, announcements, payments, auth+RBAC.

Stack: bun, Next16 (AR), React19, Drizzle+MariaDB, Better Auth+RBAC, Tailwind v4+shadcn/ui. Icons: Phosphor.

Env: `DATABASE_URL` `BETTER_AUTH_SECRET` `BETTER_AUTH_URL` `DOCUMENT_ENCRYPTION_KEY`

## Commands

- `bun run dev` — starts Next.js dev with turbopack. **Don't run without asking.** Kill existing dev server first.
- `bun run build` — production build. Must pass before reporting done.
- `bun run lint` — biome lint on `./src`
- `bun run lint:fix` — biome check + write
- `bun run format` — biome format + write
- `bun run typecheck` — `tsc --noEmit`
- `bun run db:seed` / `db:test` — seed or test DB connection
- `bunx drizzle-kit {generate|push|migrate}` — schema changes

## Workflow

- Typecheck via biome (`bun run lint`). If biome errors and user approves quick bypass, `bun run typecheck` (`tsc --noEmit`) directly.
- Revalidate path on all successful mutations.
- Build must pass before reporting done.

## Gotchas

- MariaDB no LATERAL JOIN — no `experimental.joins`
- Blob: `longtext`, not binary/mediumblob (binary caps 255B)
- Auth ID: varchar(36) UUID. roles.id: BIGINT auto. Never cast UUID to Number()
- Staff accounts: `auth.api.createUser()` only. Not signUpEmail
- `nextCookies()` must be last plugin in auth config
- Documents encrypted via `src/lib/crypto.ts` (AES-256-GCM)
- Soft delete: `isNull(table.deletedAt)` on every query. Delete = `update().set({ deletedAt: new Date() })`
- Server Components default. `use client` only when using Phosphor icons, shadcn Card/Badge, or hooks
- Perm: `hasPermission(userId, 'r.a')`, level≥100 bypass
- Tailwind v4: `@theme` in CSS, `shadow-xs`, `size-*`
- Never commit .env files

## Perms

`users.{c,r,u,d}` `students.{c,r,u,d,promote,graduate,import}` `teachers.{c,r,u,d,assign_class,assign_subject}` `enrollments.{c,r,u,d}` `announcements.{c,r,u,d,publish}` `payments.{c,read_any,read_own,u,approve,generate_report}` `classes|majors|subjects|semesters|payment_methods|system_configs.manage` `grades.{input,read_any,read_own,approve,print}` `profile.{edit_own,edit_any}` `assets.upload`
