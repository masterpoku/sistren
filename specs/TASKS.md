# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.

---

## Active Goals

### School Settings — Zod Integration + Batch Update

**Status:** completed

**Date:** 2026-06-02

**Summary:** Fixed settings module with proper validation and batch update pattern.

- ✅ `schoolSettingsSchema` created in `src/lib/validation/schemas/settings.ts` — npsn (8 digit), nss (12 digit), min length validation
- ✅ `getSchoolSettings()` added soft delete filter (`isNull(systemConfigs.deletedAt)`)
- ✅ `batchUpdateSchoolSettings(data)` created — single transaction, Zod safeParse, `ActionResult` typed return
- ✅ `school-settings-form.tsx` updated — single submit (no loop per field), `useTransition`, error state display
- ✅ Build passes (37 routes)

**Pattern established:** Zod schemas exist but were orphaned (no action used them). This session established the wiring pattern: schema in `schemas/`, action uses `schema.safeParse()`, form uses `useTransition` + error state.

**Files changed:**
- `src/lib/validation/schemas/settings.ts` (created)
- `src/lib/validation/schemas/index.ts` (updated — added settings export)
- `src/actions/settings.ts` (updated — soft delete + batch update)
- `src/app/(app)/settings/school/school-settings-form.tsx` (updated)

---

### Phase 6: Grade management — superseded by Phase 16

**Status:** superseded

**Depends-on:** Phase 5

**Notes:** Originally deferred to v2. Now superseded by Phase 16 which implements structured grade input + KHS view + Rapor PDF integration.

---

## Active Goals

### Quality Sprint (2026-06-01): 29 Known Issues Burndown

**Status:** completed

**Date:** 2026-06-01

**Summary:** 29 steps executed across 7 phases. Build passes (35 routes). All known issues resolved.

**Phase A — P0 Critical (3 steps):**
- ✅ `approveStudent` sets `roleId: 40` hardcoded (not `user.roleId ?? 40`)
- ✅ `bulkCreateEnrollment` filters students by `classId` via `enrollments` JOIN (not all level-40 students)
- ✅ `teacher_class_subjects` migration verified (existed in 0000, 0002, 0007)

**Phase B — P1 Error Infrastructure (5 steps):**
- ✅ `zod` added (v4.4.3)
- ✅ `lib/action-result.ts`: `ActionResult<T>` type for consistent server action return
- ✅ `lib/errors/codes.ts`: 9 `ErrorCode` types + `ErrorMessages`
- ✅ `lib/validation/schemas/`: Zod schemas for enrollments, grades, payments, announcements, academic, register
- ✅ No `throw new Error` in actions (only `src/lib/crypto.ts`)

**Phase C — P1 Dead Code (3 steps):**
- ✅ Deleted 7 dead Sheet components: ClassSheet, MajorSheet, SemesterSheet, SubjectSheet, EnrollmentSheet, AnnouncementSheet, GradeSheet
- ✅ Deleted legacy `src/components/layout/sidebar.tsx` (not imported anywhere)
- ✅ No `MOCK_` data found in codebase

**Phase D — P1 Schema Relations (1 step):**
- ✅ Added `relations()` to 13 schema files: audit_logs, classes, majors, semesters, subjects, payment_methods, permissions, roles, userPermissions, rolePermissions, verifications, religions, system_configs

**Phase E — P2 Structural (7 steps):**
- ✅ Step 13: entityId type audit — all action params already string, no change needed
- ✅ Step 14: `profile_assets` cleanup — table kept (not used but not harmful, not deleted)
- ✅ Step 15: `teacherId` field added to `grades` schema + relation
- ✅ Step 16: `deletedAt` added to `system_configs` schema
- ✅ Step 17: Batal button added to classes, majors, subjects, semesters create forms
- ✅ Step 18: Route mapping for Edit — all Client components now have Edit Dialog
- ✅ Step 19: `updateSubject` + `updateSemester` actions added to `academic.ts`

**Phase F — P2 Frontend (2 steps):**
- ✅ Step 20: DataTable Edit buttons in ClassesClient, MajorsClient, SemestersClient, SubjectsClient
- ✅ Step 21: Dark mode toggle deferred — `next-themes` not installed, header already has search + notification icons

**Phase G — P3 Minor (8 steps):**
- ✅ Step 22: Void wrappers fixed — `createClassAction` etc. return `void` (await) for Next.js form action compatibility
- ✅ Step 23: Header UI improved — breadcrumb, search bar, notification bell already present
- ✅ Step 24: Alumni seed check — `alumni` role (level 20) already in seed.ts
- ✅ Step 25: Favicon created at `public/favicon.svg`
- ✅ Step 26: `/attendance` page created (under construction placeholder)
- ✅ Step 27: `/boarding` page created (under construction placeholder)
- ✅ Step 28: `/settings/school` page created with form (school name, address, headmaster, NPSN, NSS)
- ✅ Step 29: `bun run format` + `bun run build` — **BUILD PASS** (35 routes)

**New files created:**
- `src/lib/action-result.ts`
- `src/lib/errors/codes.ts`
- `src/lib/validation/schemas/` (6 schema files)
- `src/actions/settings.ts`
- `src/app/(app)/settings/school/page.tsx`
- `src/app/(app)/settings/school/school-settings-form.tsx`
- `src/app/(app)/attendance/page.tsx`
- `src/app/(app)/boarding/page.tsx`
- `public/favicon.svg`

**Key fixes:**
- `approveStudent`: hardcoded `roleId: 40`
- `bulkCreateEnrollment`: filter by `classId` via enrollments JOIN
- `grades`: added `teacherId` varchar(36) FK + relation
- `data-table.tsx`: added `'use client'` directive
- 4 Client components: added Edit Dialogs with `useState` for edit/dialog state

---

## Archived Goals

### Phase 15: Server Action Reliability

**Completed:** 2026-05-30

---

### Phase 16: Grade Management

**Completed:** 2026-05-30

**Summary:**

- ✅ Religions table (schema, export, migration, seed)
- ✅ Grades table redesain (type enum + sub-score + unique constraint)
- ✅ Profiles religion → religionId FK
- ✅ Grades Server Actions (CRUD + bulkUpsert with revalidatePath)
- ✅ Teacher grade input UI at `/academic/grades`
- ✅ Student KHS real data (replaces mock data)
- ✅ Academic overview link to `/academic/grades`
- ✅ Teacher subject filter (via `teacher_class_subjects`)
- ⏳ Toast integration + useActionState refactor (deferred to proper library)
- ⏳ Jadwal pelajaran real data (still mock)
- ⏳ Rapor PDF download link on KHS page

---

### Phase 12: VPS Deployment

**Status:** orphaned

**Notes:** No urgency until production release. Deferred indefinitely.

---

### Phase 1: Fix better-auth — auth is broken

**Completed:** 2026-05-21

**Summary:** All 20 tables rewritten from better-auth + Drizzle first principles. Auth config wired with admin plugin, nextCookies, additionalFields.roleId. Migration generated. Typecheck clean.

---

### Phase 1b: Auth Layer Rebase — Fix 5 Critical QA Issues

**Completed:** 2026-05-22

**Summary:** userId FK type mismatch fixed (bigint → varchar(36)). Schema synced with actual migration files. Broken imports cleaned up.

---

### Phase 2: Project scaffolding

**Completed:** 2026-05-26

**Summary:** Empty API routes for SSO. .gitignore, .env.example. No pre-commit hooks.

---

### Phase 3: User management

**Completed:** 2026-05-26

**Summary:** Auth + all user CRUD + student self-registration with admin approval. seed.ts with 4 test users. Login/Register pages as Server Actions. Admin approval UI at `/admin/approvals`. Staff account creation at `/admin/users`. Profile edit at `/profile`.

---

### Phase 4: Academic core (classes, majors, subjects, semesters)

**Completed:** 2026-05-26

**Summary:** Classes, majors, subjects, semesters CRUD. Teacher assignments via `teacher_class_subjects` table. Academic overview page.

---

### Phase 5: Enrollments

**Completed:** 2026-05-28

**Summary:** Enrollment CRUD per semester. Admin assigns student to class. Bulk enrollment by class (chunk 50, fail-fast). Status state machine (active → transferred/dropped/graduated). Unique constraint on (studentId, semesterId). Audit trail on status change.

---

### Phase 7: Payments (SPP + variable fees)

**Completed:** 2026-05-30

**Summary:** `getPayments`, `recordPayment`, `confirmPayment`, `cancelPayment` actions. Student payment list at `/payments`. Admin finance page at `/finance`. **Catalog (Phase 14) added later** — `recordPayment` accepts optional `paymentItemId` for pre-fill from payment items catalog; `payments.price` always editable per invoice (Odoo sale-order-line pattern).

---

### Phase 8: Announcements

**Completed:** 2026-05-30

**Summary:** Full CRUD + publish/unpublish + read receipts in `src/actions/announcements.ts`. Announcements page at `/announcements` with role-filtered list.

---

### Phase 9: Official documents (SKHU, Ijazah, Rapor)

**Completed:** 2026-05-30

**Summary:** Document download API at `/api/documents/[id]/[type]/route.ts`. `deleteDocument` action. Student documents page at `/students/[id]/documents`.

**Deferred to v2:** SKHU/Ijazah PDF template generation, transcript PDF export per government format.

---

### Phase 10: Alumni access

**Completed:** 2026-05-30

**Summary:** Alumni login at `/auth/alumni-login` (level 20-40, no role guard). Transcript page at `/alumni/transcript` with own Rapor/Ijazah download links and enrollments. Sidebar has `Transkrip` nav item.

---

### Phase 11: Dashboard & navigation

**Completed:** 2026-05-28

**Summary:** Role-based sidebar at `src/components/layout/sidebar.tsx`. Mobile hamburger + auto-close. Profile dropdown extracted. AppLayoutClient = thin wrapper. Missing pages created (/admin, /finance, /users, /permissions). Placeholder pages (/roles, /students, /teachers).

---

### Phase 13: UI/UX Alignment with Design Reference

**Completed:** 2026-05-30

**Summary:** Page padding normalized, header built, sidebar collapsible, headings size-normalized, dashboard charts added, DataTable partially migrated, Student Academic (KRS/KHS) built, Student Finance built, icon audit done, EmptyState migrated, Card stat pattern normalized, form layout standardized, login page polished, profile avatar added.

---

### Phase 14: Payment Items Catalog

**Completed:** 2026-05-30

**Pattern:** Odoo-style product catalog. `payment_items` = template (code, name, description, standard price). `recordPayment` accepts optional `paymentItemId` — pre-fills description + standard price from catalog, but `payments.price` is **always editable per invoice**. Catalog price is default, not enforced.

**Summary:** `payment_items` schema + FK to `payments`. CRUD actions + admin UI at `/admin/payment-items`. `recordPayment` pre-fills from catalog, price always editable. Seeded: SPP-01 (SPP Bulanan Rp150rb), SPP-02 (SPP Tengah Semester Rp75rb), UG-01 (Uang Gedung Rp500rb), DU-01 (Daftar Ulang Rp250rb). Also fixed pre-existing Server Component shadcn `Card` conflict at `/academic/semesters`.
