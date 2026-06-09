# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-10 — Sprint D partial, sidebar regression detected, Biome migration done.

---

## Active Goals

### Sprint D — Feature Architecture Migration

**Status:** in_progress (Phases 1–2 partial, Phases 3–4 not started)

**Summary:** Repository uses feature-based architecture. Shared/client components belong in `src/features/`, page components belong in `src/app/`. Current state has client components scattered across `src/app/(app)/`, some deleted without replacement, and most pages inline their UI instead of delegating to `src/features/` components.

**Progress (2026-06-10):**
- Phase 1: Partial. Many orphan files moved into `src/features/` (academic, admin, alumni, announcements, attendance, boarding, dashboard, enrollments, finance, layout, payments, profile, roles, settings, students, teachers) but wiring incomplete — `GradesClient.tsx`, `SemesterFormCard.tsx`, `AssignmentsClient.tsx` not yet imported by their pages.
- Phase 2: Partial. `StudentsClient`, `TeachersClient`, `EnrollmentsClient`, `AnnouncementsClient`, `AttendanceClient`, `BoardingClient`, `ProfileClient`, `RolesClient`, `UsersClient`, `ApprovalsClient`, `AdminUsersClient`, `PaymentMethodsClient`, `TranscriptClient` files exist in `src/features/` but pages in `src/app/(app)/` still mostly inline their UI.
- Phase 3: Not started. `PaymentForm`, `StudentForm`, `TeacherForm` still missing from `src/features/`.
- Phase 4: Not verified.
- Phase 5 (sidebar): Marked completed in last session but sidebar still buggy — see Sprint E.

**Architecture rule:**
```
src/app/             → page components (Server Components, wire data + render client components)
src/features/        → shared reusable client components (all 'use client' files)
src/components/      → shadcn/ui base primitives ONLY
src/actions/         → server-side mutations (Server Actions)
```

**Reference implementations (correct pattern):**
- `src/app/(app)/academic/page.tsx` → imports from `src/features/academic/*`
- `src/app/(app)/payments/page.tsx` → imports `StudentFinanceClient` from `src/features/payments/`
- `src/app/(app)/layout.tsx` → imports `AppLayoutClient` from `src/features/layout/`

---

#### PHASE 1: Move misplaced client components to `src/features/`

**Already-correct components (leave as-is):**

| File | Component |
|------|-----------|
| `src/features/layout/AppLayoutClient.tsx` | App shell |
| `src/features/academic/AcademicOverviewClient.tsx` | Admin academic summary |
| `src/features/academic/StudentAcademicClient.tsx` | Student academic view |
| `src/features/academic/classes/ClassesClient.tsx` | Classes CRUD |
| `src/features/academic/majors/MajorsClient.tsx` | Majors CRUD |
| `src/features/academic/semesters/SemestersClient.tsx` | Semesters CRUD |
| `src/features/academic/subjects/SubjectsClient.tsx` | Subjects CRUD |
| `src/features/payments/StudentFinanceClient.tsx` | Student finance view |

**Move to `src/features/dashboard/`:**

| Source | Dest | Component | Notes |
|--------|------|-----------|-------|
| `src/app/(app)/dashboard/components.tsx` | `src/features/dashboard/DashboardClient.tsx` | `DashboardClient` | 530-line role-based dashboard (siswa/guru/admin/alumni). Update imports. |

**Move to `src/features/enrollments/`:**

| Source | Dest | Component | Notes |
|--------|------|-----------|-------|
| `src/app/(app)/enrollments/components/BulkEnrollmentForm.tsx` | `src/features/enrollments/BulkEnrollmentForm.tsx` | `BulkEnrollmentForm` | Chunked bulk enrollment |
| `src/app/(app)/enrollments/components/EnrollmentStatusBadge.tsx` | `src/features/enrollments/EnrollmentStatusBadge.tsx` | `EnrollmentStatusBadge` | Status badge |
| `src/app/(app)/enrollments/components/StatusChangeForm.tsx` | `src/features/enrollments/StatusChangeForm.tsx` | `StatusChangeForm` | Enrollment state transitions |

**Move to `src/features/academic/`:**

| Source | Dest | Component | Notes |
|--------|------|-----------|-------|
| `src/app/(app)/academic/grades/grades-client.tsx` | `src/features/academic/GradesClient.tsx` | `GradesClient` | **Orphan — not imported by any page. Wire into `src/app/(app)/academic/grades/page.tsx` after move.** |
| `src/app/(app)/academic/semesters/semester-form-card.tsx` | `src/features/academic/SemesterFormCard.tsx` | `SemesterFormCard` | **Orphan — not imported by any page. Wire into `src/app/(app)/academic/semesters/page.tsx` after move.** |

**Move to `src/features/payments/`:**

| Source | Dest | Component | Notes |
|--------|------|-----------|-------|
| `src/app/(app)/admin/payment-items/payment-item-dialog.tsx` | `src/features/payments/PaymentItemDialog.tsx` | `PaymentItemDialog` | Payment item dialog |
| `src/app/(app)/admin/payment-items/payment-item-form.tsx` | `src/features/payments/PaymentItemForm.tsx` | `PaymentItemForm` | Payment item form |
| `src/app/(app)/finance/record-payment-form.tsx` | `src/features/finance/RecordPaymentForm.tsx` | `RecordPaymentForm` | Record payment form |

**Move to `src/features/settings/`:**

| Source | Dest | Component | Notes |
|--------|------|-----------|-------|
| `src/app/(app)/settings/school/school-settings-form.tsx` | `src/features/settings/SchoolSettingsForm.tsx` | `SchoolSettingsForm` | School settings form |

**Migration steps per component:**
1. Create destination directory if not exists
2. Move file to new location
3. Update all `@/` imports inside the file (components, actions)
4. Update import paths in all pages/components that import from the old location
5. Delete old file location

---

#### PHASE 2: Create missing `*Client` components for pages with inline UI

**Rule:** Every page in `src/app/(app)/` must be a thin Server Component that fetches data and renders a single `*Client` component from `src/features/`.

Pages needing new `src/features/*/XxxClient.tsx` components:

| Page | New Client Component | Notes |
|------|---------------------|-------|
| `students/page.tsx` | `src/features/students/StudentsClient.tsx` | Replace inline Table + no Edit dialog |
| `teachers/page.tsx` | `src/features/teachers/TeachersClient.tsx` | Replace inline Table + no Edit dialog |
| `enrollments/page.tsx` | `src/features/enrollments/EnrollmentsClient.tsx` | Replace inline Table; import `BulkEnrollmentForm`, `EnrollmentStatusBadge`, `StatusChangeForm` from `src/features/enrollments/` |
| `announcements/page.tsx` | `src/features/announcements/AnnouncementsClient.tsx` | Replace inline form + Table |
| `attendance/page.tsx` | `src/features/attendance/AttendanceClient.tsx` | Create from scratch |
| `boarding/page.tsx` | `src/features/boarding/BoardingClient.tsx` | Create from scratch |
| `profile/page.tsx` | `src/features/profile/ProfileClient.tsx` | Replace inline form |
| `roles/page.tsx` | `src/features/roles/RolesClient.tsx` | Replace inline Table |
| `users/page.tsx` | `src/features/users/UsersClient.tsx` | Replace inline Table |
| `admin/approvals/page.tsx` | `src/features/admin/ApprovalsClient.tsx` | Replace inline Table |
| `admin/users/page.tsx` | `src/features/admin/AdminUsersClient.tsx` | Replace inline Table |
| `payments/methods/page.tsx` | `src/features/payments/PaymentMethodsClient.tsx` | Replace inline form + Table |
| `academic/assignments/page.tsx` | `src/features/academic/AssignmentsClient.tsx` | Replace inline form + Table |
| `academic/classes/page.tsx` | (already imports from features) | Remove inline form elements from page, move entirely to `src/features/academic/classes/ClassesClient.tsx` |
| `academic/semesters/page.tsx` | (already imports from features) | Remove inline form, import `SemesterFormCard` from `src/features/academic/SemesterFormCard.tsx` after Phase 1 move |
| `alumni/transcript/page.tsx` | `src/features/alumni/TranscriptClient.tsx` | Replace inline Table |
| `academic/grades/page.tsx` | (will import `GradesClient` after Phase 1) | After moving `grades-client.tsx` → `GradesClient`, wire it here |

**Migration pattern per page:**
1. Create `src/features/{domain}/XxxClient.tsx`
2. Move data-fetching logic + `'use server'` actions into the new client component
3. Replace page with thin Server Component that fetches data and passes to `XxxClient`
4. Update `revalidatePath()` calls in action wiring
5. Delete any orphan `components/` files from the page directory

---

#### PHASE 3: Restore deleted components (no longer in codebase)

These files were deleted from `src/components/` (wrong location) without being moved to `src/features/`. Their pages now render inline UI.

| Deleted File | Page Affected | Action |
|-------------|---------------|--------|
| `src/components/finance/PaymentForm.tsx` | `src/app/(app)/finance/page.tsx` | Covered by Phase 2 — `FinanceClient` replaces this |
| `src/components/students/StudentForm.tsx` | `src/app/(app)/students/page.tsx` | Covered by Phase 2 — `StudentsClient` replaces this |
| `src/components/teachers/TeacherForm.tsx` | `src/app/(app)/teachers/page.tsx` | Covered by Phase 2 — `TeachersClient` replaces this |

---

#### PHASE 4: Verify architecture compliance

After Phases 1–3:

- [ ] No `*.tsx` file in `src/app/(app)/` contains `'use client'` (all client components are in `src/features/`)
- [ ] No `*.tsx` file in `src/components/` (except `src/components/ui/`) contains JSX
- [ ] All pages in `src/app/(app)/` import their client components from `src/features/`
- [ ] Build passes
- [ ] Typecheck passes

---

#### PHASE 5: Fix `AppSidebar` — `SidebarMenuButton` `asChild` issue

**File:** `src/components/ui/sidebar.tsx` + `src/features/layout/app-sidebar.tsx`

**Status (2026-06-10):** Hand-rewrite of `sidebar.tsx` to match official shadcn v4 (commit `5a61965`) did not fully resolve collapse bug. Sidebar still buggy — see Sprint E for regression. **Re-open this task; do not close until Sprint E confirmed fixed.**

**Original problem:** `SidebarMenuButton` renders as `<button>` (default `asChild={false}`) with `<Link>` as child inside. Creates nested `<button><a>` — invalid HTML. shadcn CVA classes (`h-8 text-sm`, `overflow-hidden rounded-md p-2`) apply to the button, not the Link. When collapsed to icon mode (`size-8!`), the inner `<Link>` with `flex items-center gap-3` overflows and gets clipped. Nav items appear broken when sidebar is collapsed.

**Also fix `ProfileDropdown`:** Uses `position: absolute; bottom: 0` in `profile-dropdown.tsx`. `SidebarFooter` is a flex column child — `absolute` inside it breaks layout flow in collapsed state.

**Fix — `app-sidebar.tsx`:** Change `SidebarMenuButton` to `asChild={true}` and pass Link as child:
```tsx
// Wrong (current):
<SidebarMenuButton isActive={isActive} tooltip={item.title}>
  <Link href={item.href} className="flex items-center gap-3">
    <Icon className="h-4 w-4" />
    <span>{item.title}</span>
  </Link>
</SidebarMenuButton>

// Correct:
<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
  <Link href={item.href} className="flex items-center gap-3">
    <Icon className="h-4 w-4" />
    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
  </Link>
</SidebarMenuButton>
```

**Fix — `profile-dropdown.tsx`:** Remove `absolute` + `bottom-0` from the root div. Let `SidebarFooter` handle layout. Keep padding/margin for spacing.

---

### Sprint E — Sidebar Regression (shadcn v4 re-install candidate)

**Status:** pending

**Summary:** After commit `5a61965` (hand-rewrite of `src/components/ui/sidebar.tsx` to match shadcn v4 docs), sidebar collapse still buggy per user report (2026-06-10, 03:00 WIB). Three likely culprits not addressed in hand-rewrite:

1. `use-mobile` hook missing — mobile sheet toggle not wired
2. `TooltipProvider` wrapper missing in `AppLayoutClient` — tooltips on collapsed nav items broken
3. `data-collapsible` selector path mismatch — `group-data-[collapsible=icon]:hidden` may target wrong element after wrapper restructure

**Options for next session:**

| Option | Action | Risk |
|--------|--------|------|
| A) Revert | `git revert 5a61965` — back to old sidebar | Loses v4 architecture, but was working |
| B) Re-install | `npx shadcn@latest add sidebar --overwrite` — clean v4 baseline | Overwrites current rewrite, may regress v4-aligned changes |
| C) Patch current | Manually fix 3 culprits above | Risk of missing other internals |

**Recommended:** Option B (re-install). Gives authoritative v4 baseline; hand-rewrite may still miss internals. Verify via Firefox DevTools after.

**Tasks:**
- [ ] Run Firefox DevTools on `localhost:3000` to capture current broken state + console errors
- [ ] Decide option A/B/C based on captured evidence
- [ ] Apply fix
- [ ] Verify collapse, expand, tooltips, mobile sheet all work

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

**Summary:** Client requested a calendar feature. Specifics pending — academic events, class schedule, or general school calendar. Needs clarification.

- [ ] Clarify calendar scope
- [ ] Design calendar data model
- [ ] Build calendar UI
- [ ] Integrate with semesters/classes

---

### Client Request — Assessment / Grading System (Penilaian)

**Status:** pending

**Source:** Obsidian `jadwal-sistren.md` — client request, 1 Juni 2026

**Summary:** Client reported "masalah penilaian". Phase 16 grade management exists (structured input + KHS). May be bug report or refinement. Needs investigation.

- [ ] Clarify specific grading issue
- [ ] Investigate Phase 16 implementation
- [ ] Determine bug vs feature
- [ ] Implement and verify

---

### Client Request — Alumni Form Flow (Nice-to-Have)

**Status:** pending

**Source:** Obsidian `sistren-decision.md` + `jadwal-sistren.md`

**Summary:** Before graduation, student needs to fill forms. Currently graduation just changes role — no form step. Nice-to-have, not MVP.

- [ ] Design alumni graduation form workflow
- [ ] Determine required forms
- [ ] Build multi-step form wizard
- [ ] Wire form completion → role change
- [ ] Test end-to-end

---

## Archived Goals

### Biome Migration (ESLint + Prettier → Biome)

**Status:** completed

**Date:** 2026-06-10

**Summary:** Migrated linting/formatting toolchain from ESLint + Prettier to Biome v2.4.16.

**Changes:**
- `biome.json` — new config (double quotes, 2-space indent, 80 line width, Tailwind CSS parser)
- `package.json` — scripts now use `biome` (lint, lint:fix, format, format:check)
- Removed: `.eslintrc*`, `.prettierrc*` configs + related deps

**Build:** passes. Typecheck: clean.

---

### Sprint A — Dead Code & Low-Hanging Fixes

**Status:** completed

**Date:** 2026-06-09

**Cross-check findings:**
- 10 Sheet/Form files were already deleted before this session (Quality Sprint)
- `src/components/ui/sidebar.tsx` — FALSE POSITIVE, imported by 3 active files (AppLayoutClient, app-sidebar, header). NOT deleted.
- Batal button fix: `payment-item-dialog.tsx` — self-contained fix: `useState` + `<DialogClose>` for internal state management
- 4 void wrappers in `academic.ts`: added explicit `Promise<void>` return type + `await`

**Changes:**
- `src/app/(app)/admin/payment-items/payment-item-dialog.tsx` — self-contained open state, Batal uses `<DialogClose asChild>`
- `src/actions/academic.ts` — 4 wrapper actions now return `Promise<void>`

**Build:** passes. Typecheck: clean.

---

### Quality Sprint (2026-06-01): 29 Known Issues Burndown

**Status:** completed

**Date:** 2026-06-01

**Summary:** 29 steps executed across 7 phases. Build passes.

**Key fixes:**
- `approveStudent`: hardcoded `roleId: 40`
- `bulkCreateEnrollment`: filter by `classId` via enrollments JOIN
- `grades`: added `teacherId` varchar(36) FK + relation
- `data-table.tsx`: added `'use client'` directive
- 4 Client components: added Edit Dialogs with `useState` for edit/dialog state
- 7 dead Sheet components deleted, legacy sidebar component referenced but NOT deleted (false positive)
- Favicon, `/attendance`, `/boarding`, `/settings/school` pages created

**Zod schemas created (not yet adopted):** enrollments, grades, payments, announcements, academic, register, settings (7 files)

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

**Gap:** Admin CRUD UI at `/admin/payment-items` exists. **No student-facing payment items catalog page.**

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
