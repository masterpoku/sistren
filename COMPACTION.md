# Project State - SISTREN (Sistem Informasi Terpadu)

## [CONVERSATION_SUMMARY]

Implemented complete RBAC system with Better Auth integration. Created 21 database tables (6 new RBAC tables: permissions, role_permissions, user_permissions, accounts, sessions, verifications; plus enhanced roles with level/is_default). Configured Better Auth with Drizzle adapter, created auth route handler, permission utilities, route middleware, React hooks, and permission wrapper components. Build passes with 16 routes (including /auth/[...better-auth], /api/auth/permissions, /unauthorized, login, register).

## [CURRENT_SCOPE]

RBAC system fully implemented and integrated. Auth pages (login, register) updated to use Better Auth. Admin users seeded. Dashboard queries created. Session cleanup event migration created.

## [COMPLETED]

- Schema: 21 tables in `src/lib/db/schema/` (6 new RBAC + 3 Better Auth tables)
  - RBAC: `permissions`, `role_permissions`, `user_permissions`
  - Enhanced: `roles` (added `level`, `is_default`)
  - Better Auth: `accounts`, `sessions`, `verifications`
- Migration: `drizzle/migrations/0001_natural_ultron.sql` pushed
- RBAC Seeding: 47 permissions, role_permission assignments for admin/guru/siswa/alumni
- Auth Infrastructure:
  - `src/lib/auth/index.ts` configured with drizzleAdapter (mysql, usePlural: true)
  - `src/app/auth/[...better-auth]/route.ts` auth handler
  - `src/lib/auth/permissions.ts` server-side permission functions
  - `src/lib/auth/route-permissions.ts` route-permission mapping
  - `src/middleware.ts` auth + permission enforcement
  - `src/hooks/use-permissions.ts` client-side hook
  - `src/components/auth/RequirePermission.tsx` wrapper components
  - `src/app/api/auth/permissions/route.ts` permissions API
- Auth Pages:
  - `src/app/(auth)/login/page.tsx` updated with Better Auth signIn()
  - `src/app/(auth)/register/page.tsx` updated with Better Auth signUp()
  - `src/app/unauthorized/page.tsx` access denied page
- Layout: `src/app/(app)/layout.tsx` updated to use Better Auth session
- DB Queries: `src/lib/db/queries.ts` with getDashboardStats, getStudents, getTeachers, getAnnouncements, getPayments, etc.
- Server Actions: `src/actions/` with fetchDashboardStats, fetchStudents, fetchTeachers, fetchAnnouncements, fetchAllUsers, fetchPayments, fetchAcademic, fetchUserProfile
- API Routes: `/api/auth/permissions` only (permissions check)
- Environment: `BETTER_AUTH_SECRET` added to .env and .env.example
- Admin seed: superadmin@sister.com and admin@sister.com seeded with Password123!
- Cleanup: `drizzle/migrations/0002_cleanup_events.sql` MySQL event
- Dashboard: Updated to use Better Auth session + Server Action fetchDashboardStats
- Build: passes (16 routes)

## [DECISIONS]

- **Permission model:** Hybrid role+user_override (role_permissions base + user_permissions for exceptions)
- **Superadmin bypass:** role.level >= 100 grants all permissions implicitly
- **Better Auth adapter:** drizzleAdapter with provider: 'mysql', usePlural: true
- **Session cleanup:** MySQL Event Scheduler approach (event created in migration 0002)
- **auth.handler():** Better Auth exposes handler() method directly (not toNextJsHandler)
- **Auth pages:** Updated existing (auth) group pages to use Better Auth client
- **Layout:** Uses Better Auth session with fallback to DiceBear avatar
- **Admin credentials:** superadmin@sister.com and admin@sister.com with Password123!

## [PENDING]

1. Update feature pages (dashboard, students, teachers, users, finance, academic, profile) to use real DB queries
2. Wrap action buttons with RequirePermission components
3. Test full login/register/logout flow
4. Add profile_assets upload functionality
5. Student two-step registration completion form (deferred from old PHP)
