# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-15 — Sprints 1, 3, 6, 7, 8, 9, 10, 11 executed and archived. Attendance still blocked on client input. Sprint 11 follow-ups: 2 blockers fixed 2026-06-14, 7 follow-ups fixed 2026-06-15 (build blocker, auth leak, chrome drift, redirects, favicon, 6x alert). 0 alert() remaining in src. Build green (40 routes, 0 new lint errors vs baseline).

---

## Active Goals

### Blocked — Attendance Module

**Status:** pending client requirements

**Summary:** `AttendanceClient.tsx` is a placeholder "Modul Absensi — dalam pengembangan". No schema table exists. No server actions exist. Not linked in sidebar.

**Blocked on:** Client needs to define:
- Type of attendance: per-session? per-day? per-subject?
- Who records: teacher? admin? homeroom?
- Frequency: setiap jam pelajaran? setiap hari?
- Reports needed: recaps? per-student? per-class?
- Integration with existing `enrollments` or `grades`?

No implementation until client confirms requirements. Add to active sprints when spec is clear.

---

### Client Request — Assessment / Grading System (Penilaian)

**Status:** pending

**Source:** Obsidian `jadwal-sistren.md` — client request, 1 Juni 2026

**Summary:** Client reported "masalah penilaian". Phase 16 grade management exists (structured input + KHS). May be bug report or refinement. Needs investigation.

- [ ] Clarify specific grading issue
- [ ] Investigate Phase 16 implementation
- [ ] Determine bug vs feature
- [ ] Implement and verify

**Audit note (2026-06-11):** `src/actions/grades.ts` was read — no obvious bugs found at the surface. Schema validation wired via `gradeTypeSchema` (Sprint B done). Without specific bug report from client, no fix can be applied. Awaiting user clarification.

---

### Client Request — Alumni Form Flow (Nice-to-Have)

**Status:** pending

**Source:** Obsidian `sistren-decision.md` + `jadwal-sistren.md`

**Summary:** Before graduation, student needs to fill forms. Graduation just changes role — no form step. Nice-to-have, not MVP.

- [ ] Design alumni graduation form workflow
- [ ] Determine required forms
- [ ] Build multi-step form wizard
- [ ] Wire form completion → role change
- [ ] Test end-to-end

---

### Sprint 12 — Code Review Findings (DB, Actions, Features, Auth)

**Status:** pending

**Date:** 2026-06-15

**Source:** Full codebase audit — 6 parallel scout reviews across actions, pages, features, auth/middleware, database, lib/components.

**Summary:** 85 findings surfaced, ~60 confirmed real after cross-check. Below are verified issues grouped by domain.

### Database Integrity

- [ ] Fix `users.roleId ON DELETE CASCADE` → `SET NULL` in `src/lib/db/schema/users.ts` — deleting a role wipes all users (HIGH)
- [ ] Fix `announcement_recipients` PK syntax: `pk: { columns: [...] }` → `pk: primaryKey({ columns: [...] })` — table has no PK, duplicates possible (HIGH)
- [ ] Reconcile duplicate migration `0001_mean_payback.sql` vs `0001_glorious_exodus.sql` — ambiguous migration state (HIGH)
- [ ] Remove `default(crypto.randomUUID())` from accounts/sessions/verifications/users schemas — prevents migration bloat (HIGH)
- [ ] Add missing indexes on FK columns: `enrollments.student_id`, `payments.student_id`, `teacher_class_subjects.teacher_id/class_id/semester_id`, `grades.teacher_id`, `audit_logs.user_id`, `announcement_recipients.user_id`, `sessions.user_id`, `calendar_events.created_by_id` (MEDIUM)
- [ ] Add `deletedAt` to tables missing it: `announcement_recipients`, `profile_assets`, `user_permissions` — audit_logs intentionally excluded (append-only) (MEDIUM)
- [ ] Add `payments.delete` permission or document intentional immutability (MEDIUM)
- [ ] Add missing `many()` relations on `usersRelations` for child tables (enrollments, payments, teacherClassSubjects, grades, announcements, calendarEvents, etc.) (MEDIUM)
- [ ] Standardize `profiles` import: `./religions` → `./index` for consistency (LOW)

### Server Actions

- [ ] Create Zod schemas for `calendar.ts` — 4 functions use `as string` casts with zero validation. `category as "academic" | "holiday"` is compile-time only (MEDIUM)
- [ ] Add `revalidatePath("/admin/approvals")` to `approveStudent` and `rejectStudent` in `admin.ts` — page stays stale after action (MEDIUM)
- [ ] Add `isNull(studentDocuments.deletedAt)` filter to `getDocuments`, `uploadDocument`, `downloadDocument` in `documents.ts` (MEDIUM)
- [ ] Create Zod schemas for `admin.ts` `createStaffAccount` — currently manual `as string` + length check (MEDIUM)
- [ ] Create Zod schemas for `auth.ts` login action (MEDIUM)
- [ ] Create Zod schemas for `profile.ts` `updateProfile` (MEDIUM)
- [ ] Create Zod schemas for `enrollments.ts` `createEnrollment` (MEDIUM)
- [ ] Create Zod schemas for `paymentItems.ts` create/update (MEDIUM)
- [ ] Grade value validation: add score/subject/teacher Zod schemas to `grades.ts` (MEDIUM)
- [ ] Fix `register.ts` duplicate `fatherName` assignment (LOW)
- [ ] Fix `register.ts` user lookup at line 56 — add `isNull(users.deletedAt)` filter to prevent soft-deleted user email from blocking re-registration (MEDIUM)

### Feature Components

- [ ] Replace `throw new Error(result.error)` in `RecordPaymentForm.tsx:49` and `PaymentItemDialog.tsx:62,67` with `toast({ variant: "destructive" })` — uncaught throw crashes form silently (HIGH)
- [ ] Fix `BoardingClient.tsx:3` icon import — `@phosphor-icons/react/dist/ssr` → `@phosphor-icons/react` in client component (HIGH)
- [ ] Replace 4 raw HTML `<select>` with shadcn `<Select>`: `RecordPaymentForm.tsx:60,77`, `StudentAcademicClient.tsx:264`, `SystemConfigsClient.tsx:175` (MEDIUM)
- [ ] Refactor `document.getElementById` to `useRef` in `RecordPaymentForm.tsx:38,41` and `CalendarClient.tsx:291,306` (MEDIUM)
- [ ] Replace `confirm()` in `data-table.tsx:164` with project's `<Dialog>` component (MEDIUM)
- [ ] Add Zod grade value validation schema — currently only `gradeTypeSchema` exists, no score/subject/teacher validation (MEDIUM)
- [ ] Add `ENABLE_QUICK_LOGINS_DEMO` env var — hide Quick Login buttons on `/login` when set to `false`. Requires `NEXT_PUBLIC_` prefix for client component access (LOW)

### Auth & Middleware

- [ ] Audit all 35 routes for per-page auth guards — proxy.ts IS active (Next.js 16 convention), but defense-in-depth verifySession()/verifyRoleLevel() needed on every protected page (MEDIUM)
- [ ] Add `favicon.svg` to proxy matcher exclusion: `favicon\.(ico|svg)` — prevents unnecessary session fetch + DB query on every page load (MEDIUM)
- [ ] Add explicit level >= 100 bypass to `hasRoleLevel()` to match `hasPermission()` pattern (MEDIUM)
- [ ] Standardize route permission mapping — deduplicate `/enrollments` vs `/academic/enrollments` and `/grades` vs `/academic/grades` entries (LOW)

### Lib & Components

- [ ] Add `"use client"` to `button.tsx` — imported by `unauthorized/page.tsx` (server component), imports Radix Slot (client component) — may fail at runtime (MEDIUM)
- [ ] Fix `breadcrumb.tsx:91-98` `BreadcrumbSeparator` renders as `<li>` — should use `<span role="presentation" aria-hidden="true">` for accessibility (MEDIUM)
- [ ] Remove unnecessary `"use client"` from `table.tsx` — purely presentational (LOW)
- [ ] Extract shared formatters from `data-table.tsx` to `src/lib/formatters.ts` — currently co-located in component (LOW)
- [ ] Move status labels, formatters out of `data-table.tsx` to dedicated lib modules (LOW)
- [ ] Add `role="status"` and `aria-live="polite"` to `empty-state.tsx` (LOW)

**Files touched:**
- Modify: `src/lib/db/schema/users.ts`, `src/lib/db/schema/announcement_recipients.ts`, `src/lib/db/schema/accounts.ts`, `src/lib/db/schema/sessions.ts`, `src/lib/db/schema/verifications.ts`
- Modify: `src/actions/calendar.ts`, `src/actions/admin.ts`, `src/actions/documents.ts`, `src/actions/auth.ts`, `src/actions/profile.ts`, `src/actions/enrollments.ts`, `src/actions/paymentItems.ts`, `src/actions/grades.ts`, `src/actions/register.ts`
- Modify: `src/features/finance/RecordPaymentForm.tsx`, `src/features/payments/PaymentItemDialog.tsx`, `src/features/boarding/BoardingClient.tsx`, `src/features/academic/StudentAcademicClient.tsx`, `src/features/settings/SystemConfigsClient.tsx`, `src/features/calendar/CalendarClient.tsx`
- Modify: `src/components/ui/data-table.tsx`, `src/components/ui/button.tsx`, `src/components/ui/breadcrumb.tsx`, `src/components/ui/table.tsx`, `src/components/ui/empty-state.tsx`
- Modify: `src/proxy.ts` (favicon.svg exclusion), `src/lib/auth/permissions.ts` (level 100 bypass)
- Cleanup: `drizzle/migrations/0001_mean_payback.sql` (delete or reconcile)

---

## Archived Goals

### Sprint 11 — QA Sweep Follow-ups (Build Blocker + Auth + Chrome + Debt)

**Status:** completed
**Date:** 2026-06-15
**Summary:** All 7 follow-up items from the 2026-06-14 QA sweep resolved.
- Build blocker fixed, auth leak closed, 404 fixed, chrome drift fixed
- UX redirect fixed, favicon.ico added, alert debt cleared (0 remaining)
**Files:** src/features/payments/PaymentItemsClient.tsx, calendar/page.tsx, enrollments page, alumni/transcript, login/page.tsx, + 5 feature files
**Build:** ✅ green, 40 routes

---

### Sprint 10 — UI Infra & Polish (Alert Debt)

**Status:** completed
**Date:** 2026-06-15
**Summary:** All 6 remaining `alert()` calls replaced with `useToast()` across AssignmentsClient, AnnouncementsClient, PaymentMethodsClient, StudentFinanceClient, ProfileClient, login/page.tsx.
**Files:** see Sprint 11.

---

### Sprint 1 — Settings Pages (System Configs Key-Value Management)

**Status:** completed
**Date:** 2026-06-14
**Summary:** 13 `SYSTEM_CONFIG_KEYS` seeded. Full CRUD with role-gating via PageShell. `/settings/system` route with `system_configs.manage` permission. Sidebar "Pengaturan" entry. Snake_case key convention.
**Files:** src/lib/db/seed.ts

---

### Sprint 7 — createStaffAccount Redirect Loop Fix

**Status:** completed
**Date:** 2026-06-14
**Summary:** `auth.api.signUpEmail` no longer overwrites admin session. Uses `asResponse: true` with response headers discarded. `revalidatePath("/admin/users")` added. Alert replaced with toast.
**Files:** src/actions/admin.ts, src/features/admin/AdminUsersClient.tsx

---

### Sprint 8 — Boarding Page (Post-Registration Onboarding)

**Status:** completed
**Date:** 2026-06-14
**Summary:** `BoardingClient` rewritten as registration success page. Title "Pendaftaran Berhasil", registered email display, NISN-as-password instruction, CTA to login.
**Files:** src/features/boarding/BoardingClient.tsx, src/app/(app)/boarding/page.tsx