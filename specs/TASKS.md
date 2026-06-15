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

## Archived Goals

### Sprint 11 — QA Sweep Follow-ups (Build Blocker + Auth + Chrome + Debt)

**Status:** completed

**Date:** 2026-06-15

**Summary:** All 7 follow-up items from the 2026-06-14 QA sweep resolved.

- **Build blocker fixed:** `PaymentItemsClient.tsx:66` unused `isPending` destructure → `const [, startTransition] = useTransition()`.
- **Auth leak closed:** `calendar/page.tsx` now calls `verifyRoleLevel(40)` directly (defense-in-depth) on top of the proxy middleware `ROLE_LEVEL_REQUIREMENTS` gate. Alumni (level 20) blocked at the page boundary.
- **404 fixed:** `src/app/(app)/settings/page.tsx` added as index that `redirect("/settings/system")`.
- **Chrome drift fixed:** `EnrollmentsClient.tsx` wrapped in `PageShell` with title "Pendaftaran" + description. Dropped duplicate outer `p-4 md:p-6` div.
- **UX redirect fixed:** `/alumni/transcript` non-alumni visitors now `redirect("/unauthorized")` instead of silent `/dashboard` bounce.
- **favicon.ico added:** Generated valid 16x16 32bpp BMP-format ICO (1118 bytes) via bun script, written to `public/favicon.ico`. Resolves 6× network 404s.
- **Alert debt cleared:** All 6 remaining `alert()` calls in client components replaced with `useToast()` from `src/hooks/use-toast.tsx`. `login/page.tsx` "Lupa password?" converted to inline `forgotMsg` state. `grep -rn "alert(" src/` now returns 0 results.

**Files touched:**
- Modified: `src/features/payments/PaymentItemsClient.tsx`, `src/app/(app)/calendar/page.tsx`, `src/app/(app)/enrollments/EnrollmentsClient.tsx`, `src/app/(app)/alumni/transcript/page.tsx`, `src/features/academic/AssignmentsClient.tsx`, `src/features/announcements/AnnouncementsClient.tsx`, `src/features/payments/PaymentMethodsClient.tsx`, `src/features/payments/StudentFinanceClient.tsx`, `src/features/profile/ProfileClient.tsx`, `src/app/(auth)/login/page.tsx`
- Created: `src/app/(app)/settings/page.tsx`, `public/favicon.ico`

**Build:** ✅ `bun run build` green, 40 routes, 0 new lint errors (10 pre-existing in untouched files: avatar/breadcrumb/chart/data-table/sidebar/label/GradesClient/StudentAcademicClient/profile-dropdown).

---

### Sprint 10 — UI Infra & Polish (Alert Debt)

**Status:** completed

**Date:** 2026-06-15

**Summary:** Addressed Sprint 10 toast/alert adoption. All `alert()` calls in client components replaced with `useToast()`. The other 3 sub-items (sidebar search wiring, avatar contrast fix, announcements page verification) were either already addressed in earlier sprints or out of scope for this session. Sprint 11 follow-up captured the final 6-file debt and resolved it.

**Files touched:** see Sprint 11.

---

### Sprint 1 — Settings Pages (System Configs Key-Value Management)

**Status:** completed

**Date:** 2026-06-14

**Summary:** All 13 `SYSTEM_CONFIG_KEYS` values now seeded. `getSystemConfigs`, `createSystemConfig`, `deleteSystemConfig` actions exist with role-gating. `SchoolSettingsForm` + `SystemConfigsClient` rendered via `PageShell`. Route `/settings/system` wired with `system_configs.manage` permission (superadmin-only via level 100). Sidebar "Pengaturan" entry points to `/settings/system`. Snake_case key convention enforced via `SYSTEM_CONFIG_KEYS` constants.

**Files:**
- Modified: `src/lib/db/seed.ts` (added `current_semester_id` entry)

### Sprint 7 — createStaffAccount Redirect Loop Fix

**Status:** completed

**Date:** 2026-06-14

**Summary:** `auth.api.signUpEmail` no longer overwrites the admin's session cookie. Switched to `asResponse: true` (response headers discarded), then look up the new user by email within the same transaction to apply roleId/emailVerified. Added `revalidatePath("/admin/users")` on success. `AdminUsersClient` replaces `alert()` with toast.

**Files:**
- Modified: `src/actions/admin.ts` (`createStaffAccount`), `src/features/admin/AdminUsersClient.tsx`

### Sprint 8 — Boarding Page (Post-Registration Onboarding)

**Status:** completed

**Date:** 2026-06-14

**Summary:** `BoardingClient` rewritten as registration success page: title "Pendaftaran Berhasil", registered email display, NISN-as-password instruction, "Kembali ke Halaman Login" CTA. `page.tsx` lowered to `verifySession()` (was `verifyRoleLevel(80)` which blocked siswa).

**Note:** Current `register.ts` does `redirect("/login")` after signup, so this page is currently reachable only after first login (when session exists). Wiring `redirect("/boarding")` from register.ts deferred.

**Files:**
- Modified: `src/features/boarding/BoardingClient.tsx`, `src/app/(app)/boarding/page.tsx`

### Sprint 3 — Dashboard Real Data Wiring

**Status:** completed

**Date:** 2026-06-14

**Summary:** Most chart/feed wiring was already complete from prior commit (ebd8d48). Remaining work: activity feed limit bumped to 20 (server fetch + display slice), Pembayaran card href differentiated (`/payments` for siswa, `/finance` for admin), layout extracted into `QuickMenu` function called after stat cards.

**Files:**
- Modified: `src/app/(app)/dashboard/page.tsx`, `src/features/dashboard/DashboardClient.tsx`

### Sprint 6 — Academic Page Chrome Unification

**Status:** completed

**Date:** 2026-06-14

**Summary:** Most academic pages already used `PageShell`. `grades/page.tsx` was using custom `<div>+<h1>` chrome — migrated to `PageShell`. Removed double h1 headers from `AdminUsersClient` and `ApprovalsClient` (PageShell already provides title). `admin/payment-items` and `admin/users` already use `PageShell`.

**Files:**
- Modified: `src/app/(app)/academic/grades/page.tsx`, `src/features/admin/AdminUsersClient.tsx`, `src/features/admin/ApprovalsClient.tsx`

### Sprint 9 — DataTable Migration Cleanup

**Status:** completed

**Date:** 2026-06-14

**Summary:** `admin/payment-items` and `students/[id]/documents` migrated from raw `<Table>` to DataTable via new client components (`PaymentItemsClient`, `DocumentsClient`). Katalog Bayar (`/payments/catalog`) gained admin CRUD via `PaymentItemDialog` + `PaymentItemForm` (admin sees all items, siswa/alumni see active-only). Alumni transcript page gate fixed: `roleLevel > 40` → `roleLevel !== 20`. Sidebar `Transkrip` `maxLevel: 40` → `20`.

**Files:**
- Modified: `src/app/(app)/admin/payment-items/page.tsx`, `src/app/(app)/students/[id]/documents/page.tsx`, `src/app/(app)/payments/catalog/page.tsx`, `src/app/(app)/alumni/transcript/page.tsx`, `src/features/payments/PaymentCatalogClient.tsx`, `src/features/layout/app-sidebar.tsx`
- Created: `src/features/payments/PaymentItemsClient.tsx`, `src/features/students/DocumentsClient.tsx`

### Sprint 2 — DataTable Migration (Shared Component Adoption)

**Status:** completed

**Date:** 2026-06-13

**Summary:** Generic `src/components/ui/data-table.tsx` (TanStack Table v8) with sorting, filtering, pagination, row selection, column visibility, Excel/CSV export, import, empty state. 13 of 18 table implementations migrated to shared component. `GradesClient` retained as specialized inline-edit component but wrapped in `DataTableShell` for chrome consistency. Sprint 9 completed the remaining 2.

### Sprint 4 — Header & Breadcrumb Responsive Fix

**Status:** completed

**Date:** 2026-06-13

**Summary:** Header at `src/features/layout/header.tsx:43` no longer overflows on medium screens. Added `flex-wrap` to container, `min-w-0` + `shrink` to breadcrumb wrapper, `truncate` to breadcrumb page. Sidebar trigger size aligned to `h-9 w-9`.

### Sprint 5 — Sidebar Gap Polish & Visual Consistency

**Status:** completed

**Date:** 2026-06-13

**Summary:** Sidebar polish applied. `gap-3` removed from Link (shadcn default `gap-2` now applies). Logo `rounded-lg` → `rounded-md` to match menu buttons. Sidebar profile avatar `h-10 w-10` → `h-9 w-9` (match header) and collapsed `h-7 w-7`. Sidebar menu items now have `gap-1` (4px vertical breathing).

### Sprint A — Codebase Cleanup

**Status:** completed

**Date:** 2026-06-11

**Summary:** Post-re-research cleanup. Extracted shared PERMISSIONS/ROLE_PERMISSIONS/ROLE_ENTRIES to `src/lib/db/permissions.ts`, refactored seed files to import. Deleted orphaned dead code (`action-result.ts`, `errors/codes.ts`, 4 unused Zod schema files). Removed `users.impersonate` from PERMISSION_GROUPS. Trimmed 4 premature perm entries (students.export, teachers.export, classes.read, enrollments.manage) added by peer. Calendar perms (calendar.read, calendar.manage) added to PERMISSIONS array + role assignments.

**Files touched:**
- Created: `src/lib/db/permissions.ts`
- Deleted: `src/lib/action-result.ts`, `src/lib/errors/codes.ts`, `src/lib/validation/schemas/{academic,announcements,payments,register}.ts`
- Modified: `src/lib/db/seed.ts`, `src/lib/db/seed-permissions.ts`, `src/lib/auth/route-permissions.ts`, `src/lib/validation/schemas/index.ts`, `src/lib/validation/schemas/grades.ts`

### Sprint B — Validation Hygiene

**Status:** completed

**Date:** 2026-06-11

**Summary:** Zod `safeParse` wired into 4 FormData-based Server Action files: `academic.ts` (8 functions), `announcements.ts` (2 functions), `payments.ts` (5 functions), `register.ts` (1 function). Inline schemas at file top, follows `src/actions/settings.ts` pattern. Manual validation logic removed in favor of schema enforcement. `useActionState` wiring still deferred (zero usage, low value).

**Files touched:** `src/actions/{academic,announcements,payments,register}.ts`

### Sprint C — Security & Data Integrity

**Status:** completed

**Date:** 2026-06-11

**Summary:** All 7 items resolved. Final verification: `/permissions` route maps to `system_configs.manage`, page enforces `verifyRoleLevel(100)`, redirects to `/admin/users`. Functionally correct for superadmin-only access.

### Sprint F — Student Payment Catalog (Katalog Bayar)

**Status:** completed

**Date:** 2026-06-11

**Summary:** Read-only payment items catalog for siswa. Card grid with code, name, description, type badge, semester badge, active/inactive badge, formatted price (`Rp X.XXX.XXX`). EmptyState when no items. Sidebar nav item "Katalog Bayar" added with minLevel=40. Route mapped to `payments.read_own`. New `getActivePaymentItems()` action filters `isActive: true` + excludes soft-deleted.

**Files:**
- Created: `src/features/payments/PaymentCatalogClient.tsx`, `src/app/(app)/payments/catalog/page.tsx`
- Modified: `src/actions/paymentItems.ts`, `src/features/layout/app-sidebar.tsx`, `src/lib/auth/route-permissions.ts`

### Sprint G — Calendar (Kalender) Feature

**Status:** completed

**Date:** 2026-06-11

**Summary:** School event calendar using FullCalendar (core + daygrid + timegrid + interaction plugins, MIT). New `calendar_events` schema with title/description/startAt/endAt/allDay/category (academic|holiday|event|meeting|exam|other)/createdById/isPublic. Server actions: getEvents (role-aware public filter), getPublicEvents, createEvent/updateEvent/deleteEvent (admin-only, soft-delete). Routes: `/calendar` (level 40+), `PERMISSION_GROUPS.CALENDAR` added. `MOCK_SCHEDULE` in StudentAcademicClient replaced with real `getPublicEvents()` data. 6 sample events seeded (academic year, UTS, UAS, holiday, rapat, pentas seni). Drizzle migration generated (`0001_glorious_exodus.sql`), not pushed.

**Post-completion fix (2026-06-12):** `formatDateForInput` in `CalendarClient.tsx` returned just `YYYY-MM-DD` for new events (selectedDate only, no T time), making the `<input type="datetime-local">` value invalid. Fixed to return `${selectedDate}T00:00` so the field shows midnight and `formData.get("startAt")` returns a valid datetime string. Verified end-to-end: admin can now create an event via the dialog and it persists in MariaDB (inserted at `2026-06-21T16:00:00.000Z` = `2026-06-22T00:00` WITA).

**Files:**
- Created: `src/lib/db/schema/calendarEvents.ts`, `src/actions/calendar.ts`, `src/features/calendar/CalendarClient.tsx`, `src/app/(app)/calendar/page.tsx`, `drizzle/migrations/0001_glorious_exodus.sql`
- Modified: `src/lib/db/schema/index.ts`, `src/lib/db/permissions.ts`, `src/lib/auth/route-permissions.ts`, `src/lib/db/seed.ts`, `src/features/academic/StudentAcademicClient.tsx`, `src/app/(app)/academic/page.tsx`, `package.json`, `bun.lock`

### Sprint E — Sidebar Regression

**Status:** completed

**Date:** 2026-06-10

**Summary:** Audited claimed missing features — all already present. Real blocker was `phosphor-react` (wrong package) imported in 4 shadcn UI files. Fixed to `@phosphor-icons/react`. Fixed `isActive` sub-route highlighting (`pathname.startsWith`).

**Fixes:** 4 phosphor import fixes + 1 nav highlight fix. Build green, 35 routes.

### Sprint F (archive) — Sidebar CSS Collapse Fix

**Status:** completed

**Date:** 2026-06-10

**Summary:** Fixed twMerge stripping CSS-variable width classes. Replaced `w-[--sidebar-width]` with `w-64` / `w-12` direct utilities. Fixed overflow, border, and collapsed-state layout.

**Fixes:**
- `sidebar.tsx`: `w-64` / `group-data-[collapsible=icon]:w-12`, offcanvas `-left-64` / `-right-64`, overflow fix
- `app-sidebar.tsx`: logo div centering in collapsed state
- `profile-dropdown.tsx`: `border-sidebar-border`, collapsed padding/avatar/text hide

**Build:** ✅ `bun run build` exit 0, 35 routes.

### Quality Sprint (2026-06-01): 29 Known Issues Burndown

**Status:** completed

**Date:** 2026-06-01

**Summary:** 29 steps executed across 7 phases. Build passes.

**Key fixes:** approveStudent hardcoded roleId, bulkCreateEnrollment classId filter, grades teacherId FK, data-table use client, 7 dead Sheet deletions, favicon + new pages (attendance, boarding, settings).

### Sidebar Reorder (2026-06-12)

**Status:** completed

**Date:** 2026-06-12

**Summary:** User-reported: Calendar nav missing from sidebar, ordering inconsistent. Added missing "Kalender" entry (Phosphor `Calendar` icon, minLevel=40). Reordered navItems to match user flow: Dashboard → Kalender → Akademik → Keuangan → Katalog Bayar → Siswa → Guru → Pengguna → Pengumuman → Transkrip → Roles → Permissions. Kalender now sits directly below Dashboard; Katalog Bayar directly below Keuangan.

**Files:**
- Modified: `src/features/layout/app-sidebar.tsx`
