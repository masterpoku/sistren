# Sistren — AGENTS

**Cmds:** `bun run {dev|build|typecheck|lint|format}` `bun run db:{seed|test}` `bunx drizzle-kit {generate|push|migrate}`

**Stack:** bun, Next16 (AR), React19, Drizzle+MariaDB, Better Auth+RBAC, Tailwind v4+shadcn/ui

**Env:** `DATABASE_URL` `BETTER_AUTH_SECRET` `BETTER_AUTH_URL` `DOCUMENT_ENCRYPTION_KEY`

**Security:** never commit .env, .env.*, or any file with credentials

**Gotchas:**
- MariaDB no LATERAL JOIN → no `experimental.joins`
- Blob: `longtext` (no mediumblob); binary caps 255B
- Auth varchar(36) UUID; roles.id = BIGINT auto
- Staff via `auth.api.createUser()` only
- nextCookies = last plugin; sessions/accounts own deletedAt
- Docs encrypted via `src/lib/crypto.ts`
- Server Action bodySizeLimit: 16MB; MariaDB max_allowed_packet ≥ 64MB
- RBAC: `hasPermission(userId, 'r.a')`, level≥100 bypass
- Tailwind v4: `@theme` in CSS, `shadow-xs`, `size-*`
- Server components default; `'use client'` only when needed; actions `src/actions/`; route auth via `proxy.ts`

**Perms:** `users.{c,r,u,d}` `students.{c,r,u,d,promote,graduate,import}` `teachers.{c,r,u,d,assign_class,assign_subject}` `enrollments.{c,r,u,d}` `announcements.{c,r,u,d,publish}` `payments.{c,read_any,read_own,u,approve,generate_report}` `classes|majors|subjects|semesters|payment_methods|system_configs.manage` `grades.{input,read_any,read_own,approve,print}` `profile.{edit_own,edit_any}` `assets.upload`

**Style:** shadcn/ui via CLI; `cn()` for classes; `hsl(var(--primary))`; variants `default|ghost|destructive|outline|secondary`; icons Phosphor
