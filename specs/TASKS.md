# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-09 — Comprehensive gap audit completed.

---

## Active Goals

### Sprint A — Dead Code & Low-Hanging Fixes

**Status:** pending

**Summary:** Immediate low-effort fixes that reduce crash risk and clean up the codebase.

- [ ] Delete 10 dead Sheet/Dialog components — zero imports outside their own files
  - `src/components/academic/ClassSheet.tsx`, `MajorSheet.tsx`, `SubjectSheet.tsx`, `SemesterSheet.tsx`
  - `src/components/enrollments/EnrollmentSheet.tsx`
  - `src/components/grades/GradeSheet.tsx`
  - `src/components/announcements/AnnouncementSheet.tsx`
  - `src/components/finance/PaymentForm.tsx`
  - `src/components/students/StudentForm.tsx`
  - `src/components/teachers/TeacherForm.tsx`
- [ ] Delete legacy `src/components/ui/sidebar.tsx` (unused; `app-sidebar.tsx` is active)
- [ ] Fix Batal button in `payment-item-dialog.tsx` — add `onOpenChange` handler
- [ ] Add `return` to 4 void wrapper actions in `src/actions/academic.ts:558–572`

---

### Sprint B — Validation Hygiene (Zod + ActionResult)

**Status:** pending

**Summary:** Wire orphaned Zod schemas into their action files, adopt `ActionResult<T>` across all actions, fix `throw new Error` anti-pattern in pages.

- [ ] Import Zod schemas into `src/actions/academic.ts` (8 manual validations → schema)
- [ ] Import Zod schemas into `src/actions/announcements.ts` (2 manual validations)
- [ ] Import Zod schemas into `src/actions/payments.ts` (2 manual validations)
- [ ] Import Zod schemas into `src/actions/register.ts` (3 manual validations)
- [ ] Import Zod schemas into `src/actions/auth.ts` (2 manual validations)
- [ ] Consolidate `VALID_TYPES` in `src/actions/grades.ts` — import from `gradeTypeSchema`
- [ ] Adopt `ActionResult<T>` + `ErrorCode` across all 13 action files (currently 0 adopters)
- [ ] Replace `throw new Error(result.error)` in 11 page components with toast/state pattern
- [ ] Wire `useActionState` into form components (enrollments, announcements, payments)

---

### Sprint C — Security & Data Integrity

**Status:** pending

**Summary:** Fixes required before production launch.

- [ ] Fix SQL injection in `src/lib/db/seed-permissions.ts:433–437` — use `db.insert().values()` pattern
- [ ] Extract shared permission constant to `src/lib/db/permissions.ts` (deduplicate `seed.ts` vs `seed-permissions.ts`)
- [ ] Fix `/permissions` route permission mapping in `src/lib/auth/route-permissions.ts:13`
- [ ] Add alumni seed user to `src/lib/db/seed.ts` (quick-login button exists but no seeded user)
- [ ] Add missing schema relations: `semesters.ts` (grades, paymentItems), `subjects.ts` (grades)
- [ ] Fix `audit_logs.entityId` type — add `entityIdStr varchar(36)` or migrate to `varchar`
- [ ] Create `/api/auth/permissions` endpoint OR remove `src/hooks/use-permissions.ts`
- [ ] Remove `profile_assets` from `src/lib/db/schema/index.ts` (never imported; `studentDocuments` is active)

---

### Client Request — Calendar (Kalender) Feature

**Status:** pending

**Source:** Obsidian `jadwal-sistren.md` — client request, 1 Juni 2026

**Summary:** Client requested a calendar feature to be added to Sistren. Specifics pending discussion — could be academic calendar (events, holidays, exam schedule), class schedule view, or general school calendar. Needs clarification on scope before implementation.

- [ ] Clarify calendar scope — academic events vs class schedule vs general school calendar
- [ ] Design calendar data model (events table, recurring events, holidays)
- [ ] Build calendar UI component
- [ ] Integrate with existing academic data (semesters, classes)

---

### Client Request — Assessment / Grading System (Penilaian)

**Status:** pending

**Source:** Obsidian `jadwal-sistren.md` — client request, 1 Juni 2026

**Summary:** Client reported an issue with the grading/assessment system ("masalah penilaian"). Specifics not yet documented. The system already has Phase 16 grade management (structured input + KHS view), so this may be a bug report, a refinement request, or a missing feature. Needs investigation.

- [ ] Clarify the specific grading issue from the client
- [ ] Investigate existing Phase 16 grade management implementation
- [ ] Determine if bug fix or feature addition
- [ ] Implement fix/feature and verify with client

---

### Client Request — Alumni Form Flow (Nice-to-Have)

**Status:** pending

**Source:** Obsidian `sistren-decision.md` + `jadwal-sistren.md` — client request, 1 Juni 2026

**Summary:** Before a student is graduated and their role changed to `alumni`, they need to fill out a series of forms. Currently graduation just changes the role — no form collection step. This is explicitly marked nice-to-have (not MVP) by the client.

**Design decisions already recorded in `sistren-decision.md`:**
- Alumni role: account stays active with limited access per alumni role
- Alumni form flow: nice-to-have, not required for MVP

- [ ] Design alumni graduation form workflow
- [ ] Determine which forms are needed before graduation
- [ ] Build multi-step form or form wizard
- [ ] Wire form completion → role change trigger
- [ ] Test graduation flow end-to-end

---

### School Settings — Zod Integration + Batch Update

**Status:** completed

**Date:** 2026-06-02

**Summary:** Fixed settings module with proper validation and batch update pattern.

- ✅ `schoolSettingsSchema` created in `src/lib/validation/schemas/settings.ts`
- ✅ `getSchoolSettings()` added soft delete filter
- ✅ `batchUpdateSchoolSettings(data)` — single transaction, Zod safeParse, `ActionResult` typed return
- ✅ `school-settings-form.tsx` — single submit, `useTransition`, error state display
- ✅ Build passes (37 routes)

**Pattern established:** schema in `schemas/`, action uses `schema.safeParse()`, form uses `useTransition` + error state.

---

## Archived Goals

### Quality Sprint (2026-06-01): 29 Known Issues Burndown

**Status:** completed

**Date:** 2026-06-01

**Summary:** 29 steps executed across 7 phases. Build passes (35 routes).

**Key fixes:**
- `approveStudent`: hardcoded `roleId: 40`
- `bulkCreateEnrollment`: filter by `classId` via enrollments JOIN
- `grades`: added `teacherId` varchar(36) FK + relation
- `data-table.tsx`: added `'use client'` directive
- 4 Client components: added Edit Dialogs with `useState` for edit/dialog state
- 7 dead Sheet components deleted, legacy sidebar deleted
- Favicon, `/attendance`, `/boarding`, `/settings/school` pages created

**Zod schemas created (not yet adopted):** enrollments, grades, payments, announcements, academic, register, settings (7 files)

---

### Phase 16: Grade Management

**Status:** completed

**Date:** 2026-05-30

**Summary:**
- ✅ Religions table (schema, export, migration, seed)
- ✅ Grades table redesain (type enum + sub-score + unique constraint)
- ✅ Profiles religion → religionId FK
- ✅ Grades Server Actions (CRUD + bulkUpsert with revalidatePath)
- ✅ Teacher grade input UI at `/academic/grades`
- ✅ Student KHS real data (replaces mock data)
- ✅ Academic overview link to `/academic/grades`
- ✅ Teacher subject filter (via `teacher_class_subjects`)
- ⏳ Toast integration + useActionState refactor (deferred)
- ⏳ Jadwal pelajaran real data (still mock)
- ⏳ Rapor PDF download link on KHS page

---

### Phase 15: Server Action Reliability

**Status:** completed

**Date:** 2026-05-30

**Summary:** `revalidatePath` on all mutations, duplicate ToastProvider removed. All 13 mutation action files now call `revalidatePath()`.

---

### Phase 14: Payment Items Catalog

**Status:** completed

**Date:** 2026-05-30

**Pattern:** Odoo-style product catalog. `payment_items` = template. `recordPayment` accepts optional `paymentItemId` — pre-fills from catalog, `payments.price` always editable per invoice.

**Gap:** Admin CRUD UI at `/admin/payment-items` exists. **No student-facing payment items catalog page** — students see payment records but cannot browse available payment item types.

---

### Phase 13: UI/UX Alignment

**Status:** completed

**Date:** 2026-05-30

---

### Phase 12: VPS Deployment

**Status:** orphaned

**Notes:** No urgency until production release. Deferred indefinitely.

---

### Phase 11: Dashboard & Navigation

**Status:** completed

**Date:** 2026-05-28

---

### Phase 10: Alumni Access

**Status:** completed

**Date:** 2026-05-30

---

### Phase 9: Official Documents (SKHU, Ijazah, Rapor)

**Status:** completed

**Date:** 2026-05-30

**Deferred to v2:** SKHU/Ijazah PDF template generation, transcript PDF export.

---

### Phase 8: Announcements

**Status:** completed

**Date:** 2026-05-30

---

### Phase 7: Payments (SPP + Variable Fees)

**Status:** completed

**Date:** 2026-05-30

---

### Phase 6: Grade Management

**Status:** superseded by Phase 16

**Depends-on:** Phase 5

---

### Phase 5: Enrollments

**Status:** completed

**Date:** 2026-05-28

---

### Phase 4: Academic Core

**Status:** completed

**Date:** 2026-05-26

---

### Phase 3: User Management

**Status:** completed

**Date:** 2026-05-26

---

### Phase 2: Project Scaffolding

**Status:** completed

**Date:** 2026-05-26

---

### Phase 1b: Auth Layer Rebase

**Status:** completed

**Date:** 2026-05-22

---

### Phase 1: Fix better-auth

**Status:** completed

**Date:** 2026-05-21

---

## Archived Goals (Earlier Sessions)

### School Settings — Zod Integration + Batch Update

**Completed:** 2026-06-02

---

### Phase 6: Grade management — superseded by Phase 16

**Status:** superseded

**Depends-on:** Phase 5

**Notes:** Originally deferred to v2. Now superseded by Phase 16 which implements structured grade input + KHS view + Rapor PDF integration.

---

### Phase 12: VPS Deployment

**Status:** orphaned

**Notes:** No urgency until production release. Deferred indefinitely.

---

### Phase 1: Fix better-auth — auth is broken

**Completed:** 2026-05-21

---

### Phase 1b: Auth Layer Rebase — Fix 5 Critical QA Issues

**Completed:** 2026-05-22

---

### Phase 2: Project scaffolding

**Completed:** 2026-05-26

---

### Phase 3: User management

**Completed:** 2026-05-26

---

### Phase 4: Academic core (classes, majors, subjects, semesters)

**Completed:** 2026-05-26

---

### Phase 5: Enrollments

**Completed:** 2026-05-28

---

### Phase 7: Payments (SPP + variable fees)

**Completed:** 2026-05-30

---

### Phase 8: Announcements

**Completed:** 2026-05-30

---

### Phase 9: Official documents (SKHU, Ijazah, Rapor)

**Completed:** 2026-05-30

---

### Phase 10: Alumni access

**Completed:** 2026-05-30

---

### Phase 11: Dashboard & navigation

**Completed:** 2026-05-28

---

### Phase 13: UI/UX Alignment with Design Reference

**Completed:** 2026-05-30

---

### Phase 14: Payment Items Catalog

**Completed:** 2026-05-30

---

### Phase 15: Server Action Reliability

**Completed:** 2026-05-30

---

### Phase 16: Grade Management

**Completed:** 2026-05-30

---
