# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-13 — Sprints 2-6 archived (DataTable migration, layout polish, page chrome audit, redirect loop); Sprint 7 queued (page chrome unification); Sprints 8-9 added (Boarding page, DataTable migration cleanup); Attendance blocked on client input.

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

**Status:** completed

**Summary:** A generic `src/components/ui/data-table.tsx` exists (TanStack Table v8) with sorting, filtering, pagination, row selection, column visibility, Excel/CSV export, import, and empty state. 13 of 18 table implementations migrated to the shared component. Build passes (37/37 routes). `GradesClient` retained as specialized inline-edit component but wrapped in `DataTableShell` for chrome consistency.

**Shared utilities added (data-table.tsx):**
- `formatCurrency`, `formatDate`, `formatDateTime` formatters
- `STATUS_LABELS`, `PAYMENT_TYPE_LABELS`, `PRIORITY_LABELS`, `CATEGORY_LABELS` status badge maps
- `BadgeVariant` type, `ActionCell` row actions primitive
- `DataTableShell` for custom-chrome consumers (toolbar/children/footer slots)

**Migrated (13):**
- AdminUsersClient, AnnouncementsClient, ApprovalsClient, AssignmentsClient, EnrollmentsClient
- FinanceClient, PaymentCatalogClient, PaymentMethodsClient, PaymentMethodsClient
- RolesClient, StudentFinanceClient, StudentsClient, TeachersClient, TranscriptClient

**Retained custom (1):**
- `GradesClient` — inline editable inputs per cell, wrapped in `DataTableShell` (not full DataTable)

**Not migrated (3):**
- `payment-items` (admin) — pending
- `documents` page — pending
- `StudentAcademicClient` attitude table — 2-column, kept custom layout

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
- [ ] Fix Pembayaran card link: change href from `/finance` to `/payments` for roleLevel < 80 (siswa gets blocked)
- [ ] Reorder dashboard layout: quick menu cards (Profil Saya, Pembayaran, Pengumuman) after stat cards, before charts
- [ ] Replace admin/teacher activity feed: use calendar events in timeline format, limit to 20 items
- [ ] Verify all 3 role dashboards (admin/guru/siswa) show real data end-to-end

---

### Sprint 4 — Header & Breadcrumb Responsive Fix

**Status:** completed

**Summary:** Header at `src/features/layout/header.tsx:43` no longer overflows on medium screens. Added `flex-wrap` to container, `min-w-0` + `shrink` to breadcrumb wrapper, `truncate` to breadcrumb page. Sidebar trigger size aligned to `h-9 w-9`.

---

### Sprint 5 — Sidebar Gap Polish & Visual Consistency

**Status:** completed

**Summary:** Sidebar polish applied. `gap-3` removed from Link (shadcn default `gap-2` now applies). Logo `rounded-lg` → `rounded-md` to match menu buttons. Sidebar profile avatar `h-10 w-10` → `h-9 w-9` (match header) and collapsed `h-7 w-7`. Sidebar menu items now have `gap-1` (4px vertical breathing).

---

### Sprint 6 — Academic Page Chrome Unification

**Status:** pending

**Summary:** DataTable migration (Sprint 2) made the tables themselves consistent, but the page chrome around them remains wildly inconsistent across `/academic/*`. Title placement, padding, form location, double-bordered wrappers, raw HTML elements, and "Batal" button implementations all differ between sibling pages. User feedback (2026-06-12): "all of /academic/* is ugly" — tables look the same but the pages don't.

**Inconsistency findings (2026-06-12):**

**Page wrapper inconsistency** — title + padding + form are scattered:
- `/academic/classes` — title + form inside `ClassesClient`
- `/academic/majors` — title + form in `page.tsx` (server component)
- `/academic/subjects` — title + form in `page.tsx`
- `/academic/semesters` — **NO title**, **NO padding**, bare fragment
- `/academic/assignments` — title + form inside `AssignmentsClient`
- `/academic/grades` — title in `page.tsx`, filters in `GradesClient`

**Double-border bug** — Classes/Majors/Subjects wrap DataTable in extra `<div className="rounded-md border bg-card">`. DataTable already has its own border → double frame visible. Assignments/Semesters/Grades don't have this bug.

**Form input inconsistency:**
- `subjects/page.tsx:57-69` uses raw HTML `<select>` instead of shadcn `Select`
- `Majors/Subjects/Semesters` pages have manual `<a href>` "Batal" buttons (raw anchor, not `Button`)
- `Assignments` form uses `space-y-1` between label and input; other pages use `space-y-2`

**Plan:**
- [ ] Create `src/components/ui/page-shell.tsx` — title + description + padding primitive
- [ ] Create `src/components/ui/resource-form.tsx` — form layout primitive (label spacing, Cancel/Submit buttons)
- [ ] Migrate all 6 academic pages to use `PageShell` pattern
- [ ] Remove double `rounded-md border bg-card` wrapper from Classes/Majors/Subjects
- [ ] Replace raw `<select>` in subjects/page.tsx with shadcn `Select`
- [ ] Replace manual `<a href>` "Batal" buttons with `Button variant="outline" type="reset"` or `router.back()`
- [ ] Standardize form label spacing (`space-y-2` across all forms)
- [ ] Apply same `PageShell` pattern to `/admin/*` (Users, Approvals, Payment Items) for consistency
- [ ] Fix admin double titles: PageShell title + client component header both visible on users/approvals pages
- [ ] Standardize DataTable wrapper: all tables follow Finance pattern (no extra Card wrapper), not the old `rounded-md border bg-card`
- [ ] Verify build passes
- [ ] Visual inspection: all academic pages render with identical chrome

**Files to touch:**
- Create: `src/components/ui/page-shell.tsx`, `src/components/ui/resource-form.tsx`
- Modify: `src/app/(app)/academic/{classes,majors,subjects,semesters,assignments,grades}/page.tsx`
- Modify: `src/features/academic/{classes,ClassesClient,majors,MajorsClient,subjects,SubjectsClient,assignments,AssignmentsClient,GradesClient,SemesterFormCard}.tsx`
- Modify: `src/app/(app)/admin/{users,approvals,payment-items}/page.tsx` (apply same pattern)

---

### Sprint 7 — createStaffAccount Redirect Loop Fix

**Status:** pending

**Source:** User report (2026-06-12) — after admin creates a new staff account, browser enters redirect loop:
```
GET /admin/users 200
POST /admin/users 200 (createStaffAccount)
GET /admin/users 307
GET /login 307
GET /dashboard 307
```

**Root cause:** `src/actions/admin.ts:91` calls `auth.api.signUpEmail(...)` inside a server action invoked by an already-logged-in admin. Better-Auth's `signUpEmail` **always sets a session cookie on the response** — it logs in the newly created user. The browser's next request carries the new staff account's session instead of the admin's. New staff account is verified and has correct role, but `proxy.ts` middleware cycles through role checks and lands on `/login`.

**Secondary issues:**
- `createStaffAccount` returns `{ success: true }` without `revalidatePath("/admin/users")` — relies on client `router.refresh()`
- `AdminUsersClient.tsx:96` uses `alert()` for errors — inconsistent with app patterns

**Plan:**
- [ ] Read `src/actions/register.ts` to confirm the safe self-signup pattern (no session overwrite)
- [ ] Apply same pattern to `createStaffAccount` — bypass `auth.api.signUpEmail` and use direct DB insert with hashed password
- [ ] OR use `auth.api.signUpEmail` with `asResponse: true` and discard response headers (avoids cookie write)
- [ ] Add `revalidatePath("/admin/users")` to success path
- [ ] Replace `alert()` error UX with app's existing pattern (toast or inline)
- [ ] Test: create admin-level account, then create guru-level account, verify admin session persists
- [ ] Test: no 307 loop in network log
- [ ] Verify build passes

**Files to touch:**
- Modify: `src/actions/admin.ts`
- Modify: `src/features/admin/AdminUsersClient.tsx`

---

## Pending Tasks Block

### Sprint 8 — Boarding Page (Post-Registration Onboarding)

**Status:** pending

**Source:** Client clarification (2026-06-13) — "Boarding" is NOT asrama/dormitory. Old PHP system (`AuthController.php:42-59` + `boarding.blade.php`): after student self-registration, redirect to `/auth/boarding?rid=<encrypted>` showing:
- "Pendaftaran Berhasil" (Registration Successful)
- Registered email displayed
- NISN = initial password instruction
- CTA: "Kembali ke halaman Utama"

**Current state:** `BoardingClient.tsx` has wrong title "Asrama" and desc "Kelola data asrama dan kamar". Placeholder shows "Modul Asrama — dalam pengembangan". Wrong label completely.

**Scope:** Static page, no CRUD needed. Single-use success/confirmation display.

**Plan:**
- [ ] Create encrypted token verification pattern (or simple success page with user ID param)
- [ ] Fix `BoardingClient.tsx` — title "Pendaftaran Berhasil", remove all "Asrama" references
- [ ] Show registered user email from session/params
- [ ] Show login instructions: "Gunakan NISN sebagai kata sandi untuk login pertama"
- [ ] Add CTA button: "Kembali ke Halaman Login" → `/login`
- [ ] Route: keep at `/boarding` or move to `/auth/boarding`? Clarify with client
- [ ] Permission: `boarding.{r}` exists in AGENTS.md — no action needed for static page
- [ ] Verify build passes

**Files to touch:**
- Modify: `src/features/boarding/BoardingClient.tsx`
- Modify: `src/app/(app)/boarding/page.tsx`
- Optionally create: `src/actions/boarding.ts` (verify encrypted token if needed)

---

### Sprint 9 — DataTable Migration Cleanup

**Status:** pending

**Summary:** Sprint 2 migrated 13 of 16 table-based features to shared DataTable. 2 remain on raw `<Table>` + 1 intentionally kept custom. Migrate the 2 remaining tables for consistency.

**Not migrated (leftovers from Sprint 2):**
1. `admin/payment-items` — uses raw shadcn `<Table>` with PaymentItemDialog/PaymentItemForm
2. `students/[id]/documents` — uses raw `<Table>` with document upload form, DocumentUploadForm
3. `StudentAcademicClient` attitude table — intentionally kept custom 2-column layout (skip)

**Plan:**
- [ ] Migrate `admin/payment-items page.tsx` — convert raw `<Table>` to DataTable with `STATUS_LABELS`, `formatCurrency`, `ActionCell`
- [ ] Migrate `students/[id]/documents page.tsx` — convert raw `<Table>` to DataTable
- [ ] Verify both pages use shared formatters (`formatCurrency`, `STATUS_LABELS` etc.)
- [ ] Ensure server-rendered pages still work (payment-items = server component, documents = server component)
- [ ] Add CRUD UI to Katalog Bayar (`/payments/catalog`): create/edit/delete buttons for admin
- [ ] Fix transcript (`/alumni/transcript`): page gate only allows alumni (level 20), fix sidebar `maxLevel: 40` → `maxLevel: 20`
- [ ] Verify build passes

**Files to touch:**
- Modify: `src/app/(app)/admin/payment-items/page.tsx`
- Modify: `src/app/(app)/students/[id]/documents/page.tsx`
- Modify: `src/app/(app)/alumni/transcript/page.tsx` (page gate)
- Modify: `src/features/layout/app-sidebar.tsx` (sidebar maxLevel)
- Optionally create: `src/features/payments/PaymentItemsClient.tsx` (if extracting to client component)
- Optionally create: `src/features/students/DocumentsClient.tsx`

---

### Sprint 10 — UI Infra & Polish

**Status:** pending

**Summary:** Multiple UI infrastructure gaps found during QA: no toast notification system adopted, notifications/announcements page dead, search bars placeholder-only, avatar white-on-white invisible.

**Bugs found:**

1. **Toast/alert system not adopted** — `ToastProvider` exists and wraps app in layout, but 6+ components still use `alert()` for errors. `AdminUsersClient.tsx:96`, `createStaffAccount`, and several other actions call `alert()` instead of toast.

2. **Notifications/announcements page dead** — `/announcements` page exists in sidebar but renders empty or placeholder content. `getRecentAnnouncements()` returns real data but page UI may be incomplete.

3. **Search bars placeholder-only** — Sidebar search input (`Cari menu...`) does not filter nav items. DataTable search works (`Cari name...`, `Cari nama...`) but sidebar search is decorative.

4. **Avatar white-on-white** — `profile-dropdown.tsx:17` uses `bg-slate-100` (light gray) with user initial letter. If the initial is in a light color (white, light gray), the letter becomes invisible against the light background.

**Plan:**
- [ ] Adopt toast: replace `alert()` calls in server actions + client components with existing ToastProvider
- [ ] Fix announcements page: verify it renders real announcement data, not placeholder
- [ ] Wire sidebar search: implement nav filtering when user types in `Cari menu...`
- [ ] Fix avatar contrast: add dark text color or dynamic bg color based on initial letter
- [ ] Verify build passes 

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

---

### Sidebar Reorder (2026-06-12)

**Status:** completed

**Date:** 2026-06-12

**Summary:** User-reported: Calendar nav missing from sidebar, ordering inconsistent. Added missing "Kalender" entry (Phosphor `Calendar` icon, minLevel=40). Reordered navItems to match user flow: Dashboard → Kalender → Akademik → Keuangan → Katalog Bayar → Siswa → Guru → Pengguna → Pengumuman → Transkrip → Roles → Permissions. Kalender now sits directly below Dashboard; Katalog Bayar directly below Keuangan.

**Files:**
- Modified: `src/features/layout/app-sidebar.tsx`
