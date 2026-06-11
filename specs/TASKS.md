# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-12 — Sprints A/B/F/G complete; sidebar order adjusted (Kalender below Dashboard, Katalog Bayar below Keuangan).

---

## Active Goals

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
