# Code Review: Page Routes (page.tsx + layout.tsx)

**Date:** 2026-06-15
**Scope:** All 41 page.tsx and layout.tsx files under src/app/
**Reviewer:** Codebase scout (Archaeological Layered Reconnaissance)

---

## C4 Overview

### Context
Next.js 16 / React 19 / Drizzle+MariaDB / Better Auth education management system.
3 route groups: `(auth)` (login/register), `(app)` (authenticated pages), root (redirect).

### Containers
- **Root layout** (layout.tsx) — Inter font, minimal shell
- **Auth layout** ((auth)/layout.tsx) — redirects authenticated→/dashboard
- **App layout** ((app)/layout.tsx) — session check, auth context, AppLayoutClient + ToastProvider, redirects unauthenticated→/login

### Components (27 content pages)
- 11 use PageShell at page level (server component wraps with <PageShell>)
- 2 inline PageShell-equivalent markup (div.flex-col.gap-6.p-4.md:p-6 + h1)
- 3 pass to client component that uses PageShell internally
- 11 pass to client component that inlines own h1 (no PageShell)

### 4 redirect-only pages
- `/admin` → `/admin/users`
- `/users` → `/admin/users`
- `/permissions` → `/admin/users`
- `/settings` → `/settings/system` (⚠️ no auth check)

---

## File-by-File Findings

### Root Layouts

#### `src/app/layout.tsx`
- ✅ Minimal root layout, Inter font, no client directive
- ✅ Clean metadata

#### `src/app/(app)/layout.tsx`
- ✅ Session gating: redirects to /login if no session
- ✅ Passes user + auth context to AppLayoutClient
- ✅ Uses getSession() (non-redirecting) then manual redirect
- ✅ ToastProvider wraps children

#### `src/app/(auth)/layout.tsx`
- ✅ Redirects authenticated users to /dashboard
- ✅ Uses getSession() (non-redirecting) then manual redirect

---

### Auth Pages

#### `src/app/page.tsx` (root redirect)
- ✅ Redirects to /login

#### `src/app/(auth)/login/page.tsx`
- ✅ 'use client' for Phosphor icons, useState, useEffect, form handling
- ✅ Checks existing session client-side via authClient.getSession()
- ✅ Quick login buttons for demo
- ✅ No PageShell (standalone layout)

#### `src/app/(auth)/register/page.tsx`
- ✅ 'use client' for Phosphor icons, useState, form handling
- ✅ Uses React.use() for religion list (streaming SSR)
- ✅ No PageShell (standalone layout)
- ⚠️ MEDIUM: Uses raw `<select>` instead of shadcn `<Select>` component (lines 135-157, 146-158). Inconsistent with rest of app which uses shadcn Select.

#### `src/app/(auth)/alumni-login/page.tsx`
- ✅ Server component, uses LoginFormClient
- ✅ Minimal chrome with Card

---

### Redirect-Only Pages

#### `src/app/(app)/admin/page.tsx`
- ✅ verifyRoleLevel(80) → redirect to /admin/users

#### `src/app/(app)/users/page.tsx`
- ✅ verifyRoleLevel(80) → redirect to /admin/users

#### `src/app/(app)/permissions/page.tsx`
- ✅ verifyRoleLevel(100) → redirect to /admin/users

#### `src/app/(app)/settings/page.tsx`
- ⚠️ LOW: No auth check. `redirect("/settings/system")` without any verifySession/verifyRoleLevel call. Target page checks roleLevel(100), but this is a missing gate.

---

### Pages Using PageShell at Server Level (11)

#### `src/app/(app)/academic/grades/page.tsx`
- ✅ PageShell with title "Input Nilai"
- ✅ Fetches classes, subjects, semesters in server
- ✅ Filters teacher assignments server-side
- ⚠️ LOW: Uses verifySession() + manual roleLevel check instead of verifyRoleLevel(60). Consistent with need for session userId.

#### `src/app/(app)/academic/majors/page.tsx`
- ✅ PageShell with title "Kelola Jurusan"
- ✅ verifyRoleLevel(60)
- ✅ Inline form + MajorsClient in Card

#### `src/app/(app)/academic/semesters/page.tsx`
- ✅ PageShell with title "Kelola Semester"
- ✅ verifyRoleLevel(60)

#### `src/app/(app)/academic/subjects/page.tsx`
- ✅ PageShell with title "Kelola Mata Pelajaran"
- ✅ verifyRoleLevel(60)
- ✅ Promise.all for parallel fetches

#### `src/app/(app)/admin/approvals/page.tsx`
- ✅ PageShell with title "Approval Siswa"
- ✅ verifyRoleLevel(80)
- ✅ Co-located getPendingStudents query function

#### `src/app/(app)/admin/payment-items/page.tsx`
- ✅ PageShell with title "Item Pembayaran"
- ✅ verifyRoleLevel(80)
- ✅ actions prop: PaymentItemDialog trigger button
- ✅ Promise.all for parallel fetches

#### `src/app/(app)/admin/users/page.tsx`
- ✅ PageShell with title "Manajemen Pengguna"
- ✅ verifyRoleLevel(80)
- ✅ Co-located getUsers query

#### `src/app/(app)/payments/catalog/page.tsx`
- ✅ PageShell with title "Katalog Pembayaran"
- ✅ verifySession() + manual ctx check for canManage
- ✅ Conditional fetch: getActivePaymentItems vs getPaymentItems based on role

#### `src/app/(app)/settings/school/page.tsx`
- ✅ PageShell with title "Pengaturan Sekolah"
- ✅ verifyRoleLevel(80)
- ✅ Helper function getSetting() for clean key-value access

#### `src/app/(app)/settings/system/page.tsx`
- ✅ PageShell with title "Pengaturan Sistem"
- ✅ verifyRoleLevel(100)

#### `src/app/(app)/students/[id]/documents/page.tsx`
- ✅ PageShell with title "Dokumen Siswa"
- ✅ verifySession() + permission check
- ⚠️ MEDIUM: Permission failure returns inline error div (line 20-27) instead of redirecting to /unauthorized. All other pages use redirect pattern.

---

### Pages Inlining PageShell-Equivalent Markup (2)

#### `src/app/(app)/academic/page.tsx`
- ⚠️ MEDIUM: Inlines `<div className="flex flex-col gap-6 p-4 md:p-6">` + h1 for admin view instead of using PageShell component. Same classes as PageShell, but creates inconsistency.
- ⚠️ LOW: Line 31 has dead code `await verifySession()` — session already verified on line 14. Second call is redundant.
- ✅ Dual view: StudentAcademicClient for level 40, AcademicOverviewClient for >= 60

#### `src/app/(app)/payments/page.tsx`
- ⚠️ MEDIUM: Inlines same markup instead of PageShell component for admin view
- ✅ StudentFinanceClient for level 40
- ✅ Inline table with STATUS_LABELS for admin view
- ⚠️ LOW: No empty state for admin view — shows empty table. Student path not checked for empty data.

---

### Pages Using PageShell in Client Component (3)

#### `src/app/(app)/academic/assignments/page.tsx`
- ✅ verifyRoleLevel(60)
- ✅ Promise.all for 5 parallel fetches
- ✅ AssignmentsClient wraps content in PageShell internally

#### `src/app/(app)/boarding/page.tsx`
- ✅ verifySession() (no role level check)
- ⚠️ MEDIUM: No role level gate. Any authenticated user can access. route-permissions.ts has no entry for /boarding. Feature name suggests student-only.

#### `src/app/(app)/enrollments/page.tsx`
- ✅ verifyRoleLevel(60)
- ✅ Promise.all for 4 parallel fetches
- ✅ EnrollmentsClient wraps in PageShell internally

---

### Pages with Client-Component-Own h1 (No PageShell) (11)

#### `src/app/(app)/dashboard/page.tsx`
- ✅ verifySession() + getAuthContext()
- ✅ Role-based data fetching (admin, teacher, student branches)
- ✅ All data fetched server-side, passed as props
- ✅ DashboardClient inlines own h1 "Selamat Datang, {name}"
- ✅ Heavy component (660 lines) — justified for dashboard complexity

#### `src/app/(app)/announcements/page.tsx`
- ✅ verifySession() + roleLevel check
- ✅ AnnouncementsClient inlines h1 "Pengumuman"
- ⚠️ LOW: No PageShell wrapper at page level, client inlines own header

#### `src/app/(app)/attendance/page.tsx`
- ✅ verifyRoleLevel(60)
- ✅ AttendanceClient inlines h1 "Absensi"
- ⚠️ LOW: "Modul Absensi — dalam pengembangan" — placeholder content

#### `src/app/(app)/calendar/page.tsx`
- ⚠️ LOW: Line 7-8 — redundant double call: verifyRoleLevel(40) + verifySession(). verifyRoleLevel already validates session internally.
- ✅ CalendarClient inlines h1 "Kalender Sekolah"

#### `src/app/(app)/finance/page.tsx`
- ✅ verifyRoleLevel(80)
- ✅ FinanceClient inlines h1 "Keuangan"
- ✅ Co-located queries for students, catalog items

#### `src/app/(app)/payments/methods/page.tsx`
- ✅ verifyRoleLevel(80)
- ✅ PaymentMethodsClient inlines h1 "Metode Pembayaran"

#### `src/app/(app)/profile/page.tsx`
- ✅ verifySession() only — accessible by all authenticated users
- ✅ ProfileClient inlines h1 "Profil Saya"
- ✅ Co-located profile fetch with religion join

#### `src/app/(app)/roles/page.tsx`
- ✅ verifyRoleLevel(80)
- ✅ RolesClient inlines h1 "Roles"

#### `src/app/(app)/students/page.tsx`
- ✅ verifyRoleLevel(60)
- ✅ StudentsClient inlines h1 "Data Siswa"

#### `src/app/(app)/teachers/page.tsx`
- ✅ verifyRoleLevel(60)
- ✅ TeachersClient inlines h1 "Data Guru"

#### `src/app/(app)/alumni/transcript/page.tsx`
- ✅ verifySession() + manual ctx check
- ⚠️ MEDIUM: Checks `ctx.roleLevel !== 20` (exact match) instead of `verifyRoleLevel(20)` pattern. Intentional since only alumni (exactly level 20) should access, but uses different pattern from every other page.

---

### Miscellaneous

#### `src/app/unauthorized/page.tsx`
- ✅ Static page, no auth needed (already redirected here by verify functions)
- ✅ Link to /dashboard

#### `src/app/test/page.tsx`
- ✅ 'use client' for Phosphor icons
- ✅ Development-only component test page

---

## Cross-Cutting Analysis

### 1. PageShell Usage — MEDIUM
Three patterns with no uniform approach:

| Pattern | Count | Pages |
|---------|-------|-------|
| PageShell at page level | 11 | grades, majors, semesters, subjects, approvals, payment-items, users, catalog, school settings, system settings, student documents |
| PageShell in client component | 3 | assignments, boarding, enrollments |
| Inline PageShell-equivalent markup | 2 | academic (admin), payments (admin) |
| No PageShell — client inlines h1 | 11 | dashboard, announcements, attendance, calendar, finance, methods, profile, roles, students, teachers, transcript |

Impact: Global change to page chrome (e.g., adding breadcrumbs or changing spacing) requires touching 27 files across 3 different patterns. Recommend converging on a single pattern: PageShell at page level.

### 2. Auth Gating — Mostly Correct
- All 27 content pages have some form of auth gating
- Only `settings/page.tsx` is unguarded (redirect target has gate)
- One redundant double call in `calendar/page.tsx`
- Permission check in `students/[id]/documents/page.tsx` uses inline error instead of redirect

### 3. Server/Client Boundary — Clean
- All data fetching in server components, passed as props
- No client-side data fetching in pages
- `'use client'` only where needed (Phosphor icons, form handling, useState)

### 4. Revalidation
- No revalidation calls in page.tsx files — expected (pages are read-only)
- Server Actions should handle revalidation; not in scope of this review

### 5. Redirect Patterns
- All auth failures redirect to `/login` or `/unauthorized` — consistent
- One exception: `students/[id]/documents/page.tsx` renders error div instead of redirecting
- Admin index (`/admin`), users index (`/users`), permissions (`/permissions`) all redirect to `/admin/users` — intentional pattern

### 6. Chrome Consistency
- All h1 tags use `className="text-3xl font-bold tracking-tight"` — consistent
- Description text uses `className="text-muted-foreground"` — consistent
- Gap/spacing: PageShell uses `gap-6 p-4 md:p-6` — consistent in PageShell and inline copies

### 7. Data Fetching Patterns
- Sequential fetches in some pages (dashboard, academic page) where Promise.all could be used
- Co-located query functions in admin/approvals, admin/users, students, teachers, profile
- Server action calls for reusable queries in most academic pages

---

## Severity Summary

| Severity | Count |
|----------|-------|
| HIGH | 0 |
| MEDIUM | 6 |
| LOW | 5 |

### Top 3 Critical Fixes

1. **MEDIUM: `students/[id]/documents/page.tsx` — inline error instead of redirect**
   - Line 20-27: Permission failure renders `<div className="p-6"><p className="text-destructive">...</p></div>` instead of `redirect("/unauthorized")`
   - Inconsistent with every other page's auth failure pattern
   - Fix: Replace inline error with `redirect("/unauthorized")` or return `<UnauthorizedPage />`

2. **MEDIUM: PageShell usage inconsistency across 27 content pages**
   - 3 different patterns (page-level, client-level, inline, none)
   - Increases maintenance cost for chrome changes
   - Fix: Decide on single pattern (recommend PageShell at page-level) and refactor all pages

3. **MEDIUM: `src/app/(app)/alumni/transcript/page.tsx` — exact match role check**
   - Line 10: `ctx.roleLevel !== 20` — checks for exactly level 20 instead of using verifyRoleLevel()
   - Fix: Use `verifyRoleLevel(20)` pattern consistent with rest of codebase, or document why exact match is intentional

### Additional LOW Items

4. `src/app/(app)/settings/page.tsx` — redirects without auth check
5. `src/app/(app)/calendar/page.tsx` — redundant verifyRoleLevel(40) + verifySession()
6. `src/app/(app)/academic/page.tsx` — dead `await verifySession()` call at line 31
7. `src/app/(auth)/register/page.tsx` — raw `<select>` instead of shadcn Select component
8. `src/app/(app)/boarding/page.tsx` — no role level restriction on /boarding route

---

## DSM: Module-Level Dependencies

```
page.tsx files → dependencies:
  ├─ @/lib/auth/verify-session  (14 pages)
  ├─ @/lib/auth/permissions     (8 pages)
  ├─ @/actions/*                (18 pages)
  ├─ @/components/ui/page-shell (11 pages)
  ├─ @/components/ui/*          (shadcn: card, badge, button, etc.)
  ├─ @/features/*               (27 pages → 30+ client components)
  └─ @/lib/db                   (5 pages with inline queries)
```

Hub modules (many dependents):
- verify-session.ts (14 pages)
- @/actions/academic (6+ pages)
- @/features/* client components (27 pages → 1:1 mapping)

No cyclic dependencies detected in page layer.
All features follow page → client component → action → db flow.

---

## Concerns Map

| Concern | Location |
|---------|----------|
| Authentication | `(app)/layout.tsx`, verify-session.ts, route-permissions.ts |
| Role-based gating | verify-session.ts (verifyRoleLevel, verifyAdmin) |
| Page chrome | PageShell component (11 uses) + inline copies (13 uses) |
| Data fetching | Server components → actions layer → Drizzle |
| Error pages | /unauthorized (static), inline error (documents page) |
| Student self-registration | /register (PPDB form) |
| Demo login | /login (quick buttons) |
