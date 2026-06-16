# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section. Keep only the 5 most recent entries.
> Last updated: 2026-06-16 — Unified execution pass complete. Sprints 12, 13, 14, 15 executed in a single coordinated run and archived. Sprint 16 (Follow-up Wiring) created in Active to track remaining work from Sprints 14/15. Lint baseline preserved (0 new errors). Typecheck passes. Build reaches "Compiled successfully" + "TypeScript pass" but hangs at "Collecting page data" — needs MariaDB running on localhost to complete.

---

## Active Goals

### Sprint 16 — Follow-up Wiring (Carry-over from Sprints 14/15)

**Status:** planning — awaiting user review
**Date:** 2026-06-16
**Source:** Unified execution pass on 2026-06-16 created 20 Form/Dialog components and centralized 11 Zod schemas, but the existing client files were not rewired to use them. Two server actions are referenced by new components but do not exist. This sprint finishes the mechanical migration.

**Sprint goal:** Existing client files consume the new Form/Dialog components; the two missing server actions exist; the 6 useToast migrations and 2 raw `<select>` migrations are complete; Quick Login is env-gated; lint baseline is zero.

---

#### Phase 1 — Missing server actions (2 tasks)

- [ ] **1.1 Add `updateStaffAccount` action in `src/actions/admin.ts`** — Action takes `{userId, name, roleId, level?}`. Use existing `updateStaffAccountSchema` from `src/lib/validation/schemas/admin.ts`. Mirror `createStaffAccount` pattern: check actor role, validate, Drizzle update, `revalidatePath` (admin users path). Throw safe `Error` (caught by Form component) on validation failure. `M src/actions/admin.ts`
- [ ] **1.2 Add `updateEnrollment` action + schema in `src/actions/enrollments.ts` and `src/lib/validation/schemas/enrollments.ts`** — New schema `updateEnrollmentSchema` with `enrollmentId, classId, semesterId, studentId` (status stays on `updateEnrollmentStatus`). Action mirrors `createEnrollment` (RBAC check, soft-delete guard, `revalidatePath`). Wire `EnrollmentDialog` to support edit mode. `M src/actions/enrollments.ts`, `M src/lib/validation/schemas/enrollments.ts`, `M src/features/enrollments/EnrollmentDialog.tsx`, `M src/features/enrollments/EnrollmentsClient.tsx`

#### Phase 2 — Wire new Form/Dialog components (10 tasks, grouped by file)

Replace inline `<form action>` and inline `<Dialog>` with the new `*Dialog.tsx` + `*Form.tsx` components. Remove native `confirm()` where present. Add edit column where missing.

- [ ] **2.1 `ClassesClient.tsx`** — Replace inline create form (lines 77-99) with `<ClassesDialog />` trigger. Remove unused `createClassAction` (TODO at academic.ts:592). Replace inline delete form with `ActionCell`. `M src/features/academic/classes/ClassesClient.tsx`
- [ ] **2.2 `MajorsClient.tsx`** — Replace inline edit Dialog (lines 75-110) with `<MajorDialog item={...} />`. Add create trigger. Remove native `confirm()`. `M src/features/academic/majors/MajorsClient.tsx`
- [ ] **2.3 `SubjectsClient.tsx`** — Replace inline edit Dialog (lines 87-133) with `<SubjectDialog item={...} />`. Add create trigger. Remove native `confirm()`. Remove unused `classList` prop. `M src/features/academic/subjects/SubjectsClient.tsx`
- [ ] **2.4 `SemestersClient.tsx`** — Replace inline edit Dialog (lines 98-134) with `<SemesterDialog item={...} />`. Add create trigger. Keep custom `setActiveSemester` action cell (3rd button). Remove native `confirm()`. `M src/features/academic/semesters/SemestersClient.tsx`
- [ ] **2.5 `AssignmentsClient.tsx`** — Replace inline assign form (lines 110-179) with `<AssignmentDialog />` trigger. Note: this file uses tabs. `M src/features/academic/AssignmentsClient.tsx`
- [ ] **2.6 `EnrollmentsClient.tsx`** — Replace inline create form (lines 150-207) with `<EnrollmentDialog />` trigger. `M src/features/enrollments/EnrollmentsClient.tsx` (touches Phase 3 too)
- [ ] **2.7 `AdminUsersClient.tsx`** — Replace inline create form (lines 113-158) with `<StaffAccountDialog />` trigger. Add edit column using `updateStaffAccount` from Phase 1.1. `M src/features/admin/AdminUsersClient.tsx`
- [ ] **2.8 `AnnouncementsClient.tsx`** — Replace inline create form (lines 177-237) with `<AnnouncementDialog />` trigger. Add edit column. `M src/features/announcements/AnnouncementsClient.tsx`
- [ ] **2.9 `PaymentMethodsClient.tsx`** — Replace inline create form (lines 91-124) with `<PaymentMethodDialog />` trigger. Add edit column (use the new `instructions` field that was added to the Form). `M src/features/payments/PaymentMethodsClient.tsx`
- [ ] **2.10 `FinanceClient.tsx`** — Promote inline `<RecordPaymentForm>` to `<RecordPaymentDialog />` triggered by "Catat Pembayaran" button. Add toast feedback on confirm. `M src/features/finance/FinanceClient.tsx`
- [ ] **2.11 `DocumentsClient.tsx`** — Promote inline `<DocumentUploadForm>` to `<DocumentUploadDialog />` triggered by upload button. `M src/features/students/DocumentsClient.tsx`

#### Phase 3 — useToast() migration (6 tasks)

Replace `useState` for messages/errors with `useToast()` and remove inline error banners.

- [ ] **3.1 `GradesClient.tsx`** — Remove `message` state (line 77) and inline `<p>` (lines 277-282). Use `useToast()` at lines 96, 127, 146, 168, 170, 175. `M src/features/academic/GradesClient.tsx`
- [ ] **3.2 `BulkEnrollmentForm.tsx`** — Remove `message` state (line 27) and inline `<p>` (lines 102-112). Use `useToast()` at lines 37, 49, 51, 56. `M src/features/enrollments/BulkEnrollmentForm.tsx`
- [ ] **3.3 `EnrollmentsClient.tsx`** — Remove `error` state (line 108) and inline error banner (lines 125-129). Use `useToast()` at lines 111, 115. `M src/features/enrollments/EnrollmentsClient.tsx`
- [ ] **3.4 `SystemConfigsClient.tsx`** — Remove `error` state (line 45) and inline `<p>` in both Dialogs (lines 197-199, 267-269). Use `useToast()` at lines 54, 61, 64, 72, 79, 82. `M src/features/settings/SystemConfigsClient.tsx`
- [ ] **3.5 `LoginFormClient.tsx`** — Remove `errorMessage` state (line 11) and inline `<p>` (lines 47-49). Use `useToast()` at lines 14, 18. `M src/features/auth/LoginFormClient.tsx`
- [ ] **3.6 `DocumentUploadForm.tsx`** — Remove `errorMessage` state (line 34) and inline `<p>` (lines 87-89). Use `useToast()` at lines 37, 41. `M src/features/students/DocumentUploadForm.tsx`

#### Phase 4 — Raw `<select>` → shadcn `<Select>` (2 tasks)

- [ ] **4.1 `StudentAcademicClient.tsx:264`** — Replace raw `<select>` (KHS semester picker) with shadcn `<Select>`. Keep `setSelectedSemester` handler. `M src/features/academic/StudentAcademicClient.tsx`
- [ ] **4.2 `SystemConfigsClient.tsx:175`** — Replace raw `<select>` (key picker) with shadcn `<Select>`. `M src/features/settings/SystemConfigsClient.tsx`

#### Phase 5 — Quick Login env gate (1 task)

- [ ] **5.1 `src/app/(auth)/login/page.tsx`** — Gate the "Quick Login (Demo)" section (lines 174-220) behind `process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true"`. Move hardcoded emails/password to env vars (`NEXT_PUBLIC_DEMO_*_EMAIL`, `NEXT_PUBLIC_DEMO_PASSWORD`). Migrate `setError` → `useToast`. `M src/app/(auth)/login/page.tsx`

#### Phase 6 — Lint debt (6 tasks, 11 errors)

- [ ] **6.1 `data-table.tsx`** — 3 × `noGlobalIsNan` (lines 53, 63, 77). Auto-fix: `bunx biome check --write src/components/ui/data-table.tsx`. `M src/components/ui/data-table.tsx`
- [ ] **6.2 `chart.tsx`** — 1 × `noDangerouslySetInnerHtml` (line 95): add shadcn-convention biome-ignore. 2 × `noArrayIndexKey` (lines 209, 307): replace `key={index}` with `key={key}` constant. `M src/components/ui/chart.tsx`
- [ ] **6.3 `avatar.tsx`** — 1 × `noImgElement` (line 30): add shadcn-convention biome-ignore. `M src/components/ui/avatar.tsx`
- [ ] **6.4 `sidebar.tsx`** — 1 × `noDocumentCookie` (line 81): add biome-ignore (shadcn sidebar pattern). `M src/components/ui/sidebar.tsx`
- [ ] **6.5 `ProfileClient.tsx`** — 1 × `noImgElement` (line 79): replace dicebear `<img>` with `next/image`. `M src/features/profile/ProfileClient.tsx`
- [ ] **6.6 `breadcrumb.tsx`** — 2 × a11y (lines 80, 82): replace `<span role="link">` with semantic `<a>` + `aria-disabled` for the current page item. `M src/components/ui/breadcrumb.tsx`

#### Phase 7 — Verify (1 task)

- [ ] **7.1 Run verification suite** — `bun run lint` (target: 0 errors), `bun run typecheck` (target: pass), `bun run build` (target: green with MariaDB running). Confirm all 10 features use the new Form/Dialog components; confirm no native `confirm()`, no `setMessage`/`setError` for feedback, no raw `<select>` in feature code.

---

**Files touched (estimate):** ~20 source files. 0 new files except a possible new `enrollments.ts` schema entry.
**Files NOT created in this sprint** (clarification from scope report): `alumni/transcript/page.tsx` does not exist — the original sprint mention was a stale path. The actual `src/features/alumni/TranscriptClient.tsx` has no lint errors.
**Out of scope:** Attendance module, grading bug investigation, alumni form flow — all remain in Pending.

---

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

### Sprint 16 — Follow-up Wiring (Carry-over from Sprints 14/15)

**Status:** pending

**Date:** 2026-06-16

**Source:** Unified execution pass on 2026-06-16 surfaced unfinished wiring work. All 20 Form/Dialog components were created but most existing client files were not rewired to use them. Two server actions were referenced but not created. Several lint items from the original audit remain.

**Summary:** Mechanical migration to use the new Form/Dialog pairs, create two missing actions, and finish the remaining debt items from the original audit.

- [ ] **1. Wire new Form/Dialog components into existing clients** — Replace inline `Dialog` and `<form action>` patterns in 11 client files. Reuse the new `*Form.tsx` + `*Dialog.tsx` components.
  Files: `src/features/academic/classes/ClassesClient.tsx`, `MajorsClient.tsx`, `SubjectsClient.tsx`, `SemestersClient.tsx`, `AssignmentsClient.tsx`, `EnrollmentsClient.tsx`, `src/features/admin/AdminUsersClient.tsx`, `AnnouncementsClient.tsx`, `PaymentMethodsClient.tsx`, `FinanceClient.tsx`, `DocumentsClient.tsx`

- [ ] **2. Create `updateStaffAccount` action** — `StaffAccountDialog` accepts an `item` prop but no `updateStaffAccount` server action exists. Add at `src/actions/admin.ts`. Use existing `updateStaffAccountSchema` in `src/lib/validation/schemas/admin.ts` (already created).
  Files: `M src/actions/admin.ts`, `M src/features/admin/StaffAccountDialog.tsx`

- [ ] **3. Create `updateEnrollment` action** — Per Sprint 14 Phase 2 decision: all editable fields (`classId`, `semesterId`, `studentId`). Status stays on `updateEnrollmentStatus`. Wire `EnrollmentDialog` to support edit mode.
  Files: `M src/actions/enrollments.ts`, `M src/features/enrollments/EnrollmentDialog.tsx`, `M src/features/enrollments/EnrollmentsClient.tsx`

- [ ] **4. Replace `setMessage`/`setError` → `useToast()`** — 6 files still use `useState` for error messages: `GradesClient.tsx`, `BulkEnrollmentForm.tsx`, `EnrollmentsClient.tsx`, `SystemConfigsClient.tsx`, `LoginFormClient.tsx`, `DocumentUploadForm.tsx`. (`SchoolSettingsForm.tsx` persistent status is allowed.)
  Files: see Sprint 14 Phase 5 item 50

- [ ] **5. Replace remaining raw `<select>` → shadcn `<Select>`** — 2 sites remaining: `StudentAcademicClient.tsx:264`, `SystemConfigsClient.tsx:175`.
  Files: `M src/features/academic/StudentAcademicClient.tsx`, `M src/features/settings/SystemConfigsClient.tsx`

- [ ] **6. Add `ENABLE_QUICK_LOGINS_DEMO` env var** — Hide Quick Login buttons on `/login` when set to `false`. Requires `NEXT_PUBLIC_` prefix for client component access.
  Files: `M src/app/(auth)/login/page.tsx`

- [ ] **7. Address pre-existing lint debt** — 11 errors from Sprint 11 baseline that were deferred: `data-table.tsx` (3 × `noGlobalIsNan`), `chart.tsx` (2 × `noDangerouslySetInnerHtml`/`noArrayIndexKey`), `avatar.tsx` (1 × `noImgElement`), `sidebar.tsx` (1 × `noDocumentCookie`), `alumni/transcript/page.tsx` (1 × `useOptionalChain`), `ProfileClient.tsx` (1 × `noImgElement`), `breadcrumb.tsx` (2 × a11y). Goal: 0 lint errors total.
  Files: 8 components

**Files created (new):** None — all infrastructure from Sprints 12-15 is in place.

**Files modified (estimate):** ~20 files in `src/features/` and `src/actions/`.

---

## Archived Goals

### Sprint 15 — Schema Centralization: Migrate All Zod Schemas to `src/lib/validation/schemas/`

**Status:** completed
**Date:** 2026-06-16
**Summary:** 11 schema files created in `src/lib/validation/schemas/` (academic, admin, announcements, auth, calendar, documents, enrollments, grades, notifications, paymentItems, payments, profile, register, settings). 11 action files rewired to import from centralized location. Inline `z.object()` removed from all action files. `idSchema` re-exported from `payments.ts` to avoid name collision.
**Files:** 11 new schema files + 11 action files + `src/lib/validation/schemas/index.ts`

---

### Sprint 14 — CRUD Uniformity: Forms, Actions & Page Consistency

**Status:** completed (partial — see Sprint 16 for wiring follow-up)
**Date:** 2026-06-16
**Summary:** 20 new Form/Dialog components created (10 features × 2 files): Classes, Majors, Subjects, Semesters, Assignments, Enrollments, AdminUsers, Announcements, PaymentMethods, RecordPayment, DocumentUpload. Debt cleanup completed: throw→toast, require→await import, raw select→shadcn Select (partial), phosphor import fix, hasRoleLevel level-100 bypass, breadcrumb a11y, empty-state aria-live, table.tsx use client removed. Assignments documented as immutable (delete+create pattern). Existing client files were NOT rewired (carry-over to Sprint 16).
**Files:** 20 new components + 7 modified feature files

---

### Sprint 13 — Header Search Bar & Notification Bell

**Status:** completed
**Date:** 2026-06-16
**Summary:** Header search bar (cmdk-based) wired with 22 sidebar nav items, ⌘K shortcut, keyboard navigation. Notification bell (Radix popover) wired with badge dot, mark-read on click, mark-all-read action. Installed `sonner`, `@radix-ui/react-popover`, `cmdk`. `publishAnnouncement` now creates a notification row per active user. 2 demo notifications seeded for superadmin.
**Files:** `HeaderSearch.tsx`, `HeaderNotifications.tsx`, `notifications.ts` (schema + actions + schemas), `popover.tsx`, `command.tsx`, `header.tsx`, `layout.tsx`, `seed.ts`

---

### Sprint 12 — Code Review Findings (DB, Actions, Features, Auth)

**Status:** completed (partial — see Sprint 16 for follow-up wiring)
**Date:** 2026-06-16
**Summary:** DB integrity: users.roleId CASCADE→SET NULL, announcement_recipients PK fix, deletedAt added to 3 tables, 8 FK indexes added, usersRelations expanded with 13 child many() relations. Server actions: revalidatePath added to approveStudent, isNull soft-delete filters added to documents actions, register.ts duplicate fatherName and soft-delete filter fixed. Feature components: throw→toast in 2 files, raw select→shadcn Select (partial), require→await import, phosphor import fix. Auth & middleware: hasRoleLevel level-100 bypass, proxy.ts favicon.svg exclusion. Lib & components: breadcrumb a11y, empty-state aria-live, table.tsx use client removed. Pre-existing lint debt (11 errors) deferred.
**Files:** 8 schema files, 6 action files, 4 feature files, 4 UI components, proxy.ts, permissions.ts

---

### Sprint 11 — QA Sweep Follow-ups (Build Blocker + Auth + Chrome + Debt)

**Status:** completed
**Date:** 2026-06-15
**Summary:** All 7 follow-up items from the 2026-06-14 QA sweep resolved.
- Build blocker fixed, auth leak closed, 404 fixed, chrome drift fixed
- UX redirect fixed, favicon.ico added, alert debt cleared (0 remaining)
**Files:** src/features/payments/PaymentItemsClient.tsx, calendar/page.tsx, enrollments page, alumni/transcript, login/page.tsx, + 5 feature files
**Build:** ✅ green, 40 routes
