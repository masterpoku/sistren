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
- Proxy/middleware: Next.js 16 renamed `middleware.ts` → `proxy.ts`. File at `src/proxy.ts` with named export `proxy`. Build shows `ƒ Proxy (Middleware)`. Not dead code.
- `middleware-manifest.json` showing empty `{}` is a Next.js 16 quirk — build output is authoritative
## Perms

`users.{c,r,u,d}` `students.{c,r,u,d,promote,graduate,import}` `teachers.{c,r,u,d,assign_class,assign_subject}` `enrollments.{c,r,u,d}` `announcements.{c,r,u,d,publish}` `payments.{r,record,confirm,refund}` `grades.{c,r,u,d,approve}` `classes.{c,r,u,d}` `subjects.{c,r,u,d}` `majors.{c,r,u,d}` `semesters.{c,r,u,d}` `settings.{r,school}` `profile.{r,edit_own}` `documents.{c,r,u,d}` `boarding.{r}` `attendance.{r}` `finance.{r}` `roles.{c,r,u,d}` `permissions.{c,r,u,d}` `system_configs.{c,r,u,d,manage}` `payment_methods.{c,r,u,d}` `payment_items.{c,r,u,d}` `admin.{approvals,users}`

Referenced by: [CLAUDE.md](./CLAUDE.md) → [MEMORY.md](./MEMORY.md) → [specs/TASKS.md](./specs/TASKS.md)
