# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-12 — Sprint 1 added for system configs; H-K renumbered to 2-5.

---

## Active Goals

### Sprint 1 — Settings Pages (System Configs Key-Value Management)

**Status:** pending

**Summary:** System configs management is broken and incomplete. `src/actions/settings.ts` has 3 functions (getSchoolSettings, updateSchoolSetting, batchUpdateSchoolSettings) but only 5 hardcoded school settings are exposed via `/settings/school`. The `system_configs` table supports arbitrary key-value pairs but there's no general-purpose CRUD page. A **critical key-mismatch bug** exists: read path uses snake_case (`school_name`), write path uses camelCase (`schoolName`) — data desyncs on first save. Single `updateSchoolSetting` has zero validation (security gap). No seed data. No audit log.

**Exploration findings (2026-06-12):**
- `system_configs.manage` permission already exists in `src/lib/db/permissions.ts` (assigned to superadmin + administrator)
- Schema: bigint PK, varchar(100) UNIQUE key, text value, varchar(255) description, timestamps, soft delete
- Current UI only shows 5 fields at `/settings/school` — no way to add/edit/delete arbitrary configs
- Single-update action has no Zod validation — any level 80+ can write any key/value
- Batch update strips unknown Zod keys silently — no error when keys dropped
- No key enum/constants — magic strings duplicated in page.tsx, action, and schema

**Bugs to fix:**
- **Key mismatch**: page.tsx reads `school_name` (getSetting("school_name")) but form saves as `schoolName`. After first save, `schoolName` and `schoolAddress` become new rows. Need to normalize to snake_case for DB consistency.
- **Validation gap**: `updateSchoolSetting(key, value)` accepts any key/value — add Zod validation or deprecate in favor of batch
- **Silent drop**: batch action strips unknown Zod keys with no warning — need to error on unrecognized keys

- [ ] Ask user for complete list of settings keys needed (school info, academic year, semester, payment config, etc.)
- [ ] Create `SYSTEM_CONFIG_KEYS` constants file — enum for all known config keys, prevent magic strings
- [ ] Fix key mismatch bug — normalize read/write to snake_case convention
- [ ] Add Zod validation to `updateSchoolSetting` (or deprecate it, migrate callers to batch)
- [ ] Add error on unknown keys in `batchUpdateSchoolSettings` — reject instead of silent strip
- [ ] Create `src/features/settings/SystemConfigsClient.tsx` — full key-value table with add/edit/delete dialogs
- [ ] Create `src/app/(app)/settings/system/page.tsx` — server component with role gate, fetch all configs
- [ ] Add route permission: `"/settings/system": "system_configs.manage"` in route-permissions.ts
- [ ] Add sidebar nav item: `{ title: "Pengaturan", href: "/settings/system", icon: Gear, minLevel: 80 }` in app-sidebar.tsx
- [ ] Seed system_configs entries in `src/lib/db/seed.ts` (school name, address, npsn, nss, academic year, semester)
- [ ] Restructure settings page layout — `/settings/school` stays for school info, `/settings/system` for all key-value configs
- [ ] Verify build passes

**Files touched:**
- Modify: `src/actions/settings.ts`, `src/lib/validation/schemas/settings.ts`, `src/lib/auth/route-permissions.ts`, `src/features/layout/app-sidebar.tsx`, `src/lib/db/seed.ts`, `src/app/(app)/settings/school/page.tsx`, `src/features/settings/SchoolSettingsForm.tsx`
- Create: `src/features/settings/SystemConfigsClient.tsx`, `src/app/(app)/settings/system/page.tsx`, `src/lib/db/system-config-keys.ts`

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

### Sprint 2 — DataTable Migration (Shared Component Adoption)

**Status:** pending

**Summary:** A generic `src/components/ui/data-table.tsx` exists (TanStack Table v8, 310 lines) with sorting, filtering, pagination, row selection, column visibility, Excel/CSV export, import, and empty state. Only 4 of 18 table implementations use it. Migrate the remaining 14 features to the shared component for consistency and reduced duplication.

**Audit (2026-06-12):**
- Shared DataTable users (4): `subjects`, `classes`, `majors`, `semesters` — academic only
- Raw shadcn table users (14): `students`, `teachers`, `finance`, `roles`, `enrollments`, `admin-users`, `approvals`, `payment-methods`, `assignments`, `grades`, `transcript`, `announcements`, `payment-items` (admin), `documents`

- [ ] Audit each of the 14 raw implementations — document column definitions, status badge maps, currency formatting used
- [ ] Migrate `StudentsClient.tsx` — add columns config, wire to shared DataTable
- [ ] Migrate `TeachersClient.tsx`
- [ ] Migrate `FinanceClient.tsx` — extract `STATUS_LABELS` to shared config
- [ ] Migrate `RolesClient.tsx`
- [ ] Migrate `EnrollmentsClient.tsx`
- [ ] Migrate `AdminUsersClient.tsx`
- [ ] Migrate `ApprovalsClient.tsx`
- [ ] Migrate `PaymentMethodsClient.tsx`
- [ ] Migrate `AssignmentsClient.tsx`
- [ ] Migrate `GradesClient.tsx`
- [ ] Migrate `TranscriptClient.tsx`
- [ ] Migrate `AnnouncementsClient.tsx`
- [ ] Migrate `payment-items` (admin page)
- [ ] Migrate `documents` page
- [ ] Create shared status badge + currency formatter utilities
- [ ] Verify build passes after each migration batch

---

### Sprint 3 — Dashboard Real Data Wiring

**Status:** pending

**Summary:** Dashboard stats (counts) are real DB queries. All charts, schedule displays, activity feeds, and per-role stat cards use hardcoded mock data. Wire all mock data to real queries or Server Actions.

**Audit (2026-06-12):**

**Admin dashboard mock data:**
- Registration chart: `mockRegistrationData` (DashboardClient.tsx:58-63)
- Activity feed: hardcoded `.map((i) => ...)` (DashboardClient.tsx:315-332)

**Student dashboard mock data:**
- GPA, subjects count, SPP status: hardcoded strings (DashboardClient.tsx:130-132)
- GPA chart: `mockAcademicRecords` (DashboardClient.tsx:50-56, 149)
- Today's schedule: hardcoded 3-item array (DashboardClient.tsx:197-216)
- Date: "Kamis, 2 April 2026" (DashboardClient.tsx:193)

**Teacher dashboard mock data:**
- "4 sesi" today, "18 tugas belum dinilai": hardcoded (DashboardClient.tsx:359-362)
- Class average chart: `mockAcademicRecords` (DashboardClient.tsx:379)
- Activity feed: hardcoded `.map((i) => ...)` (DashboardClient.tsx:404-418)

- [ ] Create `src/actions/dashboard.ts` — server actions for all mock data sources
- [ ] Wire admin registration chart → real enrollment stats by month
- [ ] Wire admin activity feed → real recent announcements/enrollments/approvals
- [ ] Wire student GPA chart → real grade averages from DB
- [ ] Wire student subjects count → real enrollment count
- [ ] Wire student SPP status → real payment status query
- [ ] Wire student schedule → real calendar events for today
- [ ] Wire student date → dynamic date formatting
- [ ] Wire teacher "sesi hari ini" → real schedule query for today
- [ ] Wire teacher "tugas belum dinilai" → real grades pending count
- [ ] Wire teacher class average chart → real grade averages per class
- [ ] Wire teacher activity feed → real recent actions (grading, attendance)
- [ ] Verify all 3 role dashboards (admin/guru/siswa) show real data end-to-end

---

### Sprint 4 — Header & Breadcrumb Responsive Fix

**Status:** pending

**Summary:** Header at `src/features/layout/header.tsx:43` uses `shrink-0` + no `flex-wrap` + no overflow handling on breadcrumb. On medium screens (<768px), breadcrumb overflows horizontally. Search and user info correctly hide at `md:` breakpoint but breadcrumb gets no space management.

**Root cause:**
- `header.tsx:43` — `shrink-0` prevents header compression
- `header.tsx:44` — breadcrumb wrapper `flex items-center gap-4` lacks `min-w-0` and `flex-shrink`
- `header.tsx:71` — search input fixed `w-[300px]` (hidden at md, but no transition)
- No `truncate`, `overflow-hidden`, or `overflow-x-auto` on breadcrumb path

- [ ] Add `flex-wrap` to header container
- [ ] Add `min-w-0` + `flex-shrink` to breadcrumb wrapper div
- [ ] Add `truncate` or `overflow-hidden` on breadcrumb breadcrumb page
- [ ] Ensure search input transition is smooth when hiding at md
- [ ] Test on 320px, 375px, 768px viewport widths
- [ ] Verify no horizontal scroll on any page with long breadcrumb chains

---

### Sprint 5 — Sidebar Gap Polish & Visual Consistency

**Status:** pending

**Summary:** Small spacing/consistency fixes across sidebar and layout components. No structural changes — polish only.

**Issues identified (2026-06-12):**
- Menu button gap conflict: shadcn default `gap-2` vs app-sidebar override `gap-3` on Link (app-sidebar.tsx:171)
- Avatar size mismatch: sidebar profile `h-10 w-10` vs header avatar `h-9 w-9`
- Border radius inconsistency: logo icon `rounded-lg` (8px) vs menu buttons `rounded-md` (6px)
- Sidebar trigger: component default `h-7 w-7` but header overrides to `h-9 w-9`

- [ ] Fix menu button gap — remove `gap-3` override on Link, use shadcn default `gap-2`
- [ ] Standardize sidebar avatar size to `h-9 w-9` (match header)
- [ ] Standardize collapsed avatar to `h-7 w-7`
- [ ] Align logo icon and logout button border radius to `rounded-md` (match menu buttons)
- [ ] Visual inspection: expanded + collapsed states
- [ ] `bun run build`

---

## Archived Goals

### Sidebar Reorder (2026-06-12)

**Status:** completed

**Date:** 2026-06-12

**Summary:** User-reported: Calendar nav missing from sidebar, ordering inconsistent. Added missing "Kalender" entry (Phosphor `Calendar` icon, minLevel=40). Reordered navItems to match user flow: Dashboard → Kalender → Akademik → Keuangan → Katalog Bayar → Siswa → Guru → Pengguna → Pengumuman → Transkrip → Roles → Permissions. Kalender now sits directly below Dashboard; Katalog Bayar directly below Keuangan.

**Files:**
- Modified: `src/features/layout/app-sidebar.tsx`

---

## Archived Goals

### Sprint A — Codebase Cleanup

**Status:** completed

**Date:** 2026-06-11

**Summary:** Post-re-research cleanup. Extracted shared PERMISSIONS/ROLE_PERMISSIONS/ROLE_ENTRIES to `src/lib/db/permissions.ts`, refactored seed files to import. Deleted orphaned dead code (`action-result.ts`, `errors/codes.ts`, 4 unused Zod schema files). Removed `users.impersonate` from PERMISSION_GROUPS. Trimmed 4 premature perm entries (students.export, teachers.export, classes.read, enrollments.manage) added by peer. Calendar perms (calendar.read, calendar.manage) added to PERMISSIONS array + role assignments.

**Files touched:**
- Created: `src/lib/db/permissions.ts`
- Deleted: `src/lib/action-result.ts`, `src/lib/errors/codes.ts`, `src/lib/validation/schemas/{academic,announcements,payments,register}.ts`
- Modified: `src/lib/db/seed.ts`, `src/lib/db/seed-permissions.ts`, `src/lib/auth/route-permissions.ts`, `src/lib/validation/schemas/index.ts`, `src/lib/validation/schemas/grades.ts`

---

### Sprint B — Validation Hygiene

**Status:** completed

**Date:** 2026-06-11

**Summary:** Zod `safeParse` wired into 4 FormData-based Server Action files: `academic.ts` (8 functions), `announcements.ts` (2 functions), `payments.ts` (5 functions), `register.ts` (1 function). Inline schemas at file top, follows `src/actions/settings.ts` pattern. Manual validation logic removed in favor of schema enforcement. `useActionState` wiring still deferred (zero usage, low value).

**Files touched:** `src/actions/{academic,announcements,payments,register}.ts`

---

### Sprint C — Security & Data Integrity

**Status:** completed

**Date:** 2026-06-11

**Summary:** All 7 items resolved. Final verification: `/permissions` route maps to `system_configs.manage`, page enforces `verifyRoleLevel(100)`, redirects to `/admin/users`. Functionally correct for superadmin-only access.

---

### Sprint F — Student Payment Catalog (Katalog Bayar)

**Status:** completed

**Date:** 2026-06-11

**Summary:** Read-only payment items catalog for siswa. Card grid with code, name, description, type badge, semester badge, active/inactive badge, formatted price (`Rp X.XXX.XXX`). EmptyState when no items. Sidebar nav item "Katalog Bayar" added with minLevel=40. Route mapped to `payments.read_own`. New `getActivePaymentItems()` action filters `isActive: true` + excludes soft-deleted.

**Files:**
- Created: `src/features/payments/PaymentCatalogClient.tsx`, `src/app/(app)/payments/catalog/page.tsx`
- Modified: `src/actions/paymentItems.ts`, `src/features/layout/app-sidebar.tsx`, `src/lib/auth/route-permissions.ts`

---

### Sprint G — Calendar (Kalender) Feature

**Status:** completed

**Date:** 2026-06-11

**Summary:** School event calendar using FullCalendar (core + daygrid + timegrid + interaction plugins, MIT). New `calendar_events` schema with title/description/startAt/endAt/allDay/category (academic|holiday|event|meeting|exam|other)/createdById/isPublic. Server actions: getEvents (role-aware public filter), getPublicEvents, createEvent/updateEvent/deleteEvent (admin-only, soft-delete). Routes: `/calendar` (level 40+), `PERMISSION_GROUPS.CALENDAR` added. `MOCK_SCHEDULE` in StudentAcademicClient replaced with real `getPublicEvents()` data. 6 sample events seeded (academic year, UTS, UAS, holiday, rapat, pentas seni). Drizzle migration generated (`0001_glorious_exodus.sql`), not pushed.

**Post-completion fix (2026-06-12):** `formatDateForInput` in `CalendarClient.tsx` returned just `YYYY-MM-DD` for new events (selectedDate only, no T time), making the `<input type="datetime-local">` value invalid. Fixed to return `${selectedDate}T00:00` so the field shows midnight and `formData.get("startAt")` returns a valid datetime string. Verified end-to-end: admin can now create an event via the dialog and it persists in MariaDB (inserted at `2026-06-21T16:00:00.000Z` = `2026-06-22T00:00` WITA).

**Files:**
- Created: `src/lib/db/schema/calendarEvents.ts`, `src/actions/calendar.ts`, `src/features/calendar/CalendarClient.tsx`, `src/app/(app)/calendar/page.tsx`, `drizzle/migrations/0001_glorious_exodus.sql`
- Modified: `src/lib/db/schema/index.ts`, `src/lib/db/permissions.ts`, `src/lib/auth/route-permissions.ts`, `src/lib/db/seed.ts`, `src/features/academic/StudentAcademicClient.tsx`, `src/app/(app)/academic/page.tsx`, `package.json`, `bun.lock`

---

### Sprint E — Sidebar Regression

**Status:** completed

**Date:** 2026-06-10

**Summary:** Audited claimed missing features — all already present. Real blocker was `phosphor-react` (wrong package) imported in 4 shadcn UI files. Fixed to `@phosphor-icons/react`. Fixed `isActive` sub-route highlighting (`pathname.startsWith`).

**Fixes:** 4 phosphor import fixes + 1 nav highlight fix. Build green, 35 routes.

---

### Sprint F (archive) — Sidebar CSS Collapse Fix

**Status:** completed

**Date:** 2026-06-10

**Summary:** Fixed twMerge stripping CSS-variable width classes. Replaced `w-[--sidebar-width]` with `w-64` / `w-12` direct utilities. Fixed overflow, border, and collapsed-state layout.

**Fixes:**
- `sidebar.tsx`: `w-64` / `group-data-[collapsible=icon]:w-12`, offcanvas `-left-64` / `-right-64`, overflow fix
- `app-sidebar.tsx`: logo div centering in collapsed state
- `profile-dropdown.tsx`: `border-sidebar-border`, collapsed padding/avatar/text hide

**Build:** ✅ `bun run build` exit 0, 35 routes.

---

### Quality Sprint (2026-06-01): 29 Known Issues Burndown

**Status:** completed

**Date:** 2026-06-01

**Summary:** 29 steps executed across 7 phases. Build passes.

**Key fixes:** approveStudent hardcoded roleId, bulkCreateEnrollment classId filter, grades teacherId FK, data-table use client, 7 dead Sheet deletions, favicon + new pages (attendance, boarding, settings).
