# SISTREN - Implementation Memory

**Project:** Sistem Informasi Terpadu (Highschool Information System)
**Created:** 2026-04-29
**Status:** Ready for execution (not yet started)

---

## Context

This project is a Next.js 16.2.2 school information system, originally built on PHP Laravel. The database schema has been analyzed, 21 Drizzle ORM tables created, and a full RBAC permission system implemented. Now we need to:

1. Enable working authentication (login/register)
2. Replace mock data with real database queries
3. Connect the permission system to UI

---

## Current State

### ✅ Completed

**Database Schema (21 tables):**
- Core: `users`, `profiles`, `profile_assets`, `roles`
- Academic: `majors`, `classes`, `subjects`, `semesters`, `enrollments`, `grades`
- Business: `payments`, `payment_methods`, `announcements`, `announcement_recipients`, `system_configs`
- RBAC: `permissions`, `role_permissions`, `user_permissions`
- Better Auth: `accounts`, `sessions`, `verifications`

**Migration:** `drizzle/migrations/0001_natural_ultron.sql` pushed to MySQL 8.0

**RBAC System:**
- 47 permissions seeded across 12 resource groups
- Role hierarchy: superadmin(100) > administrator(80) > guru(60) > siswa(40) > alumni(20)
- Role-permission assignments: admin(35 perms), guru(11 perms), siswa(6 perms), alumni(2 perms)
- Superadmin bypass: level >= 100 grants all permissions implicitly

**Better Auth Configuration:**
- `src/lib/auth/index.ts` — configured with drizzleAdapter (mysql, usePlural: true)
- `src/app/auth/[...better-auth]/route.ts` — auth handler route

**Permission Utilities:**
- `src/lib/auth/permissions.ts` — hasPermission, getUserPermissions, hasRoleLevel, etc.
- `src/lib/auth/route-permissions.ts` — route-to-permission mapping
- `src/middleware.ts` — auth + permission enforcement (has LSP errors to fix)
- `src/hooks/use-permissions.ts` — client-side hook
- `src/components/auth/RequirePermission.tsx` — UI wrapper components
- `src/app/api/auth/permissions/route.ts` — permissions API endpoint

**Build:** Passes (15 routes) with warning about BETTER_AUTH_SECRET

---

## Old PHP Registration Flow (Reference)

From `docs/oldphp/sister_spt/app/Http/Controllers/AuthController.php`:

**Student Registration (Public):**
- Route: `POST /auth/registrasi`
- Fields: name, email, NISN, birth place, birth date, religion, gender, father's name, mother's name, first major, second major, previous school, address, captcha, terms
- Password: auto-set to NISN value (security concern)
- Creates: User (confirmed=false) + Profile + RegistrationInformation
- Redirects to boarding page with encrypted token

**Profile Completion (Dashboard):**
- Triggered after login if profile incomplete
- Additional fields: diploma numbers, parent details, document uploads (ijasah, skhun, skl, kk, akta_kelahiran, ktp_ayah, ktp_ibu, kip, pass_foto)
- Route for completion was referenced but NOT IMPLEMENTED (bug)

**Confirmation:** `confirmed = false` initially. Login check is COMMENTED OUT so students can login even before admin approval.

**Admin Approval:** Route exists (`/portal/users/siswa/penerimaan`) but `accept_siswa()` method does NOT exist — incomplete implementation.

**Teacher Registration:** Admin-only via `/portal/users/create`. No public registration.

---

## Old PHP Admin Credentials

```
Superadmin: superadmin@sister.com / Password123!
Admin:      admin@sister.com / Password123!
```

Source: `docs/oldphp/sister_spt/app/Console/Commands/InitCommand.php`

---

## Decision Points

### Registration (CONFIRMED)
- Public for students only
- One-step simplified (email, name, password, confirm)
- Auto-assign `siswa` role (role_id = 4)
- Auto-confirm: `confirmed = true` (immediate login)
- Old PHP was two-step but incomplete — simplified for MVP

### Admin Users (CONFIRMED)
- Seed superadmin@sister.com and admin@sister.com with Password123!
- Use argon2 for password hashing
- Direct DB insert via `src/lib/db/seed.ts`

### Mock Data Replacement (CONFIRMED)
- All 8 feature pages at once
- Use real DB queries via `src/lib/db/queries.ts`
- Remove MOCK_* exports from `src/constants.ts`

### Session Cleanup (DEFERRED)
- MySQL Event Scheduler approach
- Create event in migration `0002_cleanup_events.sql`
- Enable via Docker `--event-scheduler=ON`
- Phase 4 task (after auth working)

### Unauthorized Page (CONFIRMED)
- Simple message: "You don't have permission to access this page"
- Button back to dashboard

---

## Role Definitions

| Role | Level | Default | Key Permissions |
|------|-------|---------|----------------|
| superadmin | 100 | false | ALL (implicit) |
| administrator | 80 | false | ~35 (no users.delete, users.impersonate, grades.approve) |
| guru | 60 | false | grades.input, grades.read_any, students.read, announcements.read, profile.edit_own, + academic read |
| siswa | 40 | true | grades.read_own, announcements.read, profile.edit_own, students.read, payments.read_own, enrollments.read |
| alumni | 20 | false | grades.read_own, profile.edit_own |

---

## 15-Step Execution Plan

### Phase 1: Environment & Seed Data (Steps 1-3)

**Step 1 — Add BETTER_AUTH_SECRET**
- Generate: `openssl rand -base64 32`
- Add to `.env` and `.env.example` (placeholder)

**Step 2 — Verify roles seed**
- Confirm roles have level + is_default set
- superadmin=100, administrator=80, guru=60, siswa=40, alumni=20

**Step 3 — Seed admin users**
- Insert into `users` table via `src/lib/db/seed.ts`:
  - `superadmin@sister.com` / `Password123!` (argon2)
  - `admin@sister.com` / `Password123!`
- roleId: superadmin=1, administrator=2, confirmed=true

### Phase 2: Auth Infrastructure (Steps 4-7)

**Step 4 — Create `/login` page**
- File: `src/app/login/page.tsx`
- Use Better Auth `signIn()` action
- Redirect to callbackUrl or /dashboard

**Step 5 — Create `/register` page**
- File: `src/app/register/page.tsx`
- Use Better Auth `signUp()` action
- Auto-assign roleId=4 (siswa), confirmed=true
- Redirect to /login on success

**Step 6 — Create `/unauthorized` page**
- File: `src/app/unauthorized/page.tsx`
- Access denied message + home button

**Step 7 — Update app layout**
- File: `src/app/(app)/layout.tsx`
- Replace localStorage mock with Better Auth session
- Use `auth.api.getSession({ headers })`
- Update logout to use `auth.signOut()`

### Phase 3: Permission & Middleware (Steps 8-10)

**Step 8 — Add /register to PUBLIC_ROUTES**
- File: `src/lib/auth/route-permissions.ts`
- Add `'/register'` to PUBLIC_ROUTES array

**Step 9 — Fix middleware LSP errors**
- File: `src/middleware.ts`
- Cast `session.user.id` to `number` before passing to permission functions

**Step 10 — Create session cleanup event**
- File: `drizzle/migrations/0002_cleanup_events.sql`
- MySQL event: `DELETE FROM sessions WHERE expiresAt < NOW()` (daily)
- Same for verifications, draft payments 30+ days

### Phase 4: Database Query Layer (Steps 11-13)

**Step 11 — Create queries.ts**
- File: `src/lib/db/queries.ts`
- Functions: getStudents, getTeachers, getAnnouncements, getPayments(userId, role), getDashboardStats, getUserById, getCurrentUserProfile
- Role-aware filtering (siswa sees own data only)

**Step 12 — Update dashboard page**
- File: `src/features/dashboard/page.tsx`
- Replace MOCK_* with `getDashboardStats()`
- Add loading + error states

**Step 13 — Update remaining 7 feature pages**
- `src/features/students/page.tsx` → getStudents()
- `src/features/teachers/page.tsx` → getTeachers()
- `src/features/announcements/page.tsx` → getAnnouncements()
- `src/features/users/page.tsx` → user list query
- `src/features/finance/page.tsx` → getPayments()
- `src/features/academic/page.tsx` → classes/majors/subjects
- `src/features/profile/page.tsx` → getCurrentUserProfile()

### Phase 5: Permission UI Integration (Steps 14-15)

**Step 14 — Wrap action buttons**
- Add `<RequirePermission permission="...">` to Create/Edit/Delete/Approve buttons
- Pages: users, students, teachers, announcements, finance

**Step 15 — Final verification**
- `bun typecheck` → 0 errors
- `bun run build` → succeeds
- Manual test: login flows for all 5 roles
- Update COMPACTION.md

---

## Files to Create/Modify

**New Files:**
- `.env` (BETTER_AUTH_SECRET)
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/unauthorized/page.tsx`
- `src/lib/db/queries.ts`
- `drizzle/migrations/0002_cleanup_events.sql`

**Modified Files:**
- `src/lib/db/seed.ts` (admin users)
- `src/app/(app)/layout.tsx` (Better Auth session)
- `src/lib/auth/route-permissions.ts` (add /register)
- `src/middleware.ts` (fix LSP errors)
- All 8 feature pages (real queries)
- `src/constants.ts` (remove mock data)
- `COMPACTION.md` (final update)
- `.env.example` (add BETTER_AUTH_SECRET placeholder)

---

## Dependencies

```
Step 1 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8 → Step 9
  ↓         ↓        ↓        ↓        ↓
 3       (auth pages)    (layout)   (public routes)
                            ↓
                          Step 9
                            ↓
Step 10 ─────────────────────────────────────────↓
  ↓
Step 11 → Step 12 → Step 13 → Step 14 → Step 15
```

---

## Not in Scope (Deferred)

- Student two-step registration (profile completion form)
- Admin approval flow (accept_siswa method missing in old PHP)
- Teacher public registration (admin-only)
- Document upload (profile_assets table exists but not wired)
- Blog tables (blog_categories, blogs, blog_comments)
- Redis caching for permissions
- Admin UI for permission management

---

## Notes

- Password hashing: use argon2 (package already installed)
- Better Auth uses `auth.handler()` not `toNextJsHandler()`
- MySQL runs in Docker: `sistren-mysql` container
- Build warning: "default secret" — requires BETTER_AUTH_SECRET env var
- Old PHP had typo `comfirmed` vs `confirmed` — we use correct spelling
- Old PHP login confirmation check was commented out — we may want to uncomment

---

## Verification Checklist

- [ ] BETTER_AUTH_SECRET set in .env
- [ ] Admin users seeded (superadmin@sister.com, admin@sister.com)
- [ ] /login page functional
- [ ] /register page functional (creates siswa role)
- [ ] /unauthorized page exists
- [ ] Layout uses Better Auth session (not localStorage)
- [ ] /register in PUBLIC_ROUTES
- [ ] Middleware compiles without errors
- [ ] 8 feature pages use real queries
- [ ] Mock data removed from constants.ts
- [ ] Action buttons wrapped with RequirePermission
- [ ] `bun typecheck` passes
- [ ] `bun run build` succeeds
- [ ] Login works for all 5 roles
- [ ] Permission UI correct for each role