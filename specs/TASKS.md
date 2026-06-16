# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.
> Last updated: 2026-06-16 — Sprints 1, 3, 6, 7, 8, 9, 10, 11 executed and archived. Sprint 13 added — header search bar & notification bell (pending). Sprint 14 added — CRUD Uniformity (pending). Sprint 15 added — Schema Centralization (pending). Attendance still blocked on client input. Sprint 11 follow-ups: 2 blockers fixed 2026-06-14, 7 follow-ups fixed 2026-06-15 (build blocker, auth leak, chrome drift, redirects, favicon, 6x alert). 0 alert() remaining in src. Build green (40 routes, 0 new lint errors vs baseline).

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

### Sprint 13 — Header Search Bar & Notification Bell

**Status:** pending

**Date:** 2026-06-16

**Source:** Code review of `src/features/layout/header.tsx` — search bar (`MagnifyingGlass` + `<Input>`) and notification bell (`Bell` + red dot) are both 100% dummy UI with zero functionality.

**Summary:** The header contains two inert UI elements that look functional but have no event handlers, state, API calls, or behavior. Wire both with appropriate libraries.

### Search Bar

**Current state:** Static `<Input type="search" placeholder="Cari menu...">` with decorative `MagnifyingGlass` icon. No `onChange`, `onKeyDown`, `onSubmit`, or state. Hidden on mobile (`hidden md:block`).

**Library:** `cmdk` (`/dip/cmdk`, benchmark 91.8) via shadcn `command.tsx` — accessible combobox with auto-filtering, keyboard navigation, groups, empty state.

- [ ] Install dependency: `bun add cmdk`
- [ ] Add shadcn command component: `src/components/ui/command.tsx`
- [ ] Replace static `<Input>` with `<Command>` combobox filtering sidebar navigation items
- [ ] Wire selection → `router.push()` to navigate
- [ ] Support keyboard navigation (arrows, Enter, Escape)
- [ ] Show empty state when no matches
- [ ] Add `use client` directive to header (already present)

**Files touched:**
- Add: `src/components/ui/command.tsx`
- Modify: `src/features/layout/header.tsx`
- Modify: `package.json`

---

### Notification Bell

**Current state:** Static `<button>` with `Bell` icon and decorative red dot. No `onClick`. No dropdown, no count, no API.

**Architecture — two layers:**
1. **Sonner toasts** — transient popup notifications (already referenced in Sprint 10/11 as `useToast()` but `sonner` not installed)
2. **Notification center dropdown** — bell icon opens a popover listing recent notifications (custom component)

- [ ] Install dependencies: `bun add sonner @radix-ui/react-popover`
- [ ] Add shadcn popover component: `src/components/ui/popover.tsx`
- [ ] Add `<Toaster>` to root layout (`src/app/layout.tsx` or app layout)
- [ ] Create notifications DB schema in `src/lib/db/schema/notifications.ts` (id, userId, title, message, type, readAt, createdAt, deletedAt — soft delete)
- [ ] Create Zod validation schemas for notifications
- [ ] Create notification Server Actions: `src/actions/notifications.ts` (list, markRead, markAllRead)
- [ ] Replace static bell button with popover dropdown showing notification list
- [ ] Wire bell dot: show when unread notifications exist
- [ ] Integrate with existing announcement system (FR-013): when announcement published → create notification for target users
- [ ] Hardcode 2-3 seed notifications for demo/development

**Files touched:**
- Add: `src/components/ui/popover.tsx`
- Add: `src/lib/db/schema/notifications.ts`
- Add: `src/actions/notifications.ts`
- Add: `src/lib/validation/schemas/notifications.ts`
- Modify: `src/features/layout/header.tsx`
- Modify: `src/app/layout.tsx` (add `<Toaster>`)
- Modify: `src/lib/db/schema/index.ts` (export notifications)
- Modify: `src/lib/db/seed.ts` (seed notifications)
- Modify: `package.json`

---

### Sprint 14 — CRUD Uniformity: Forms, Actions & Page Consistency

**Status:** pending

**Date:** 2026-06-16

**Source:** Full audit of all 43 `.tsx` files in `src/features/` — 15 CRUD features inconsistent across form input pattern, action column pattern, page wrapper, error handling, and UI components.

**Summary:** Converge all features to one standard pattern. 5 phases, ~50 atomic tasks. Every feature must pass the consistency checklist below.

### Standard Patterns (target)

| Dimension | Standard |
|---|---|
| **Form input** | `<EntityForm>` (fields only) + `<EntityDialog>` (wraps in `<Dialog>`) for both Create and Edit. No inline Card forms. |
| **Action column — delete** | `ActionCell onDelete` with dynamic `await import()`. No raw `<Button variant="destructive">`, no `confirm()`. |
| **Action column — edit** | `<Button>` trigger that opens the entity's Dialog. |
| **Action column — extras** | `ActionCell onCustom` array. No raw buttons in action columns. |
| **Page wrapper** | `<PageShell title="..." description="...">` for all CRUD pages. |
| **Error handling** | `useToast()` for all action results. No `throw new Error()`, no `setMessage()`/`setError()`, no `alert()`. |
| **Delete confirmation** | `ActionCell` built-in confirmation. No native `confirm()`. |
| **Import — action column** | Dynamic `await import("@/actions/...")` for action handlers called from action columns. |
| **Import — form submit** | Static top-level `import` for actions passed as props to form components. |
| **Import** | No `require()` anywhere. |
| **HTML components** | shadcn `<Select>` not raw `<select>`. shadcn `<Dialog>` not raw confirm. |
| **Icons** | `@phosphor-icons/react` not `/dist/ssr`. |
| **Soft delete** | `isNull(table.deletedAt)` on every query. |

---

### Phase 1 — Create Dialog Forms (11 features)

Each task: create `<EntityForm>` + `<EntityDialog>` components, wire into Client, remove inline Card form.

**Standard pattern for each:**
- Create `src/features/{feature}/{Entity}Form.tsx` — form fields only, receives `item?` for edit mode
- Create `src/features/{feature}/{Entity}Dialog.tsx` — wraps `<Dialog>`, receives create/update actions, mode prop
- Modify `src/features/{feature}/{Entity}Client.tsx` — remove inline Card form, add "Tambah" button triggering Dialog
- All errors use `useToast()`. All successes call `router.refresh()`. No `throw`, no `setMessage`.

---

- [ ] **1. Classes Create → Dialog** — `ClassesClient.tsx:68-111` inline Card → `ClassesForm.tsx` + `ClassesDialog.tsx`. Action `createClassAction` exists at `src/actions/academic.ts:621`.
  Files: `+src/features/academic/classes/ClassesForm.tsx`, `+src/features/academic/classes/ClassesDialog.tsx`, `M src/features/academic/classes/ClassesClient.tsx`

- [ ] **2. Majors Create → Dialog (new)** — No create form exists. `createMajorAction` exists at `src/actions/academic.ts:625`. Add "Tambah" Dialog above DataTable.
  Files: `+src/features/academic/majors/MajorForm.tsx`, `+src/features/academic/majors/MajorDialog.tsx`, `M src/features/academic/majors/MajorsClient.tsx`

- [ ] **3. Subjects Create → Dialog** — `SubjectFormCard.tsx` inline Card → `SubjectForm.tsx` + `SubjectDialog.tsx`. Action `createSubjectAction` exists at `src/actions/academic.ts:629`.
  Files: `+src/features/academic/subjects/SubjectForm.tsx`, `+src/features/academic/subjects/SubjectDialog.tsx`, `-src/features/academic/subjects/SubjectFormCard.tsx`, `M src/features/academic/subjects/SubjectsClient.tsx`

- [ ] **4. Semesters Create → Dialog** — `SemesterFormCard.tsx` inline Card → `SemesterForm.tsx` + `SemesterDialog.tsx`. Action `createSemesterAction` exists at `src/actions/academic.ts:633`.
  Files: `+src/features/academic/semesters/SemesterForm.tsx`, `+src/features/academic/semesters/SemesterDialog.tsx`, `-src/features/academic/SemesterFormCard.tsx`, `M src/features/academic/semesters/SemestersClient.tsx`

- [ ] **5. Assignments Create → Dialog** — `AssignmentsClient.tsx:84-105` inline form → `AssignmentForm.tsx` + `AssignmentDialog.tsx`. Action `assignTeacher` exists at `src/actions/academic.ts` (check exact name).
  Files: `+src/features/academic/AssignmentForm.tsx`, `+src/features/academic/AssignmentDialog.tsx`, `M src/features/academic/AssignmentsClient.tsx`

- [ ] **6. Enrollments Create (single) → Dialog** — `EnrollmentsClient.tsx:139-174` inline form → `EnrollmentForm.tsx` + `EnrollmentDialog.tsx`. Action `createEnrollment` exists at `src/actions/enrollments.ts:87`.
  Files: `+src/features/enrollments/EnrollmentForm.tsx`, `+src/features/enrollments/EnrollmentDialog.tsx`, `M src/features/enrollments/EnrollmentsClient.tsx`

- [ ] **7. AdminUsers Create → Dialog** — `AdminUsersClient.tsx:96-140` inline form → `StaffAccountForm.tsx` + `StaffAccountDialog.tsx`. Action `createStaffAccount` exists at `src/actions/admin.ts:57`.
  Files: `+src/features/admin/StaffAccountForm.tsx`, `+src/features/admin/StaffAccountDialog.tsx`, `M src/features/admin/AdminUsersClient.tsx`

- [ ] **8. Announcements Create → Dialog** — `AnnouncementsClient.tsx:171-215` inline form → `AnnouncementForm.tsx` + `AnnouncementDialog.tsx`. Action `createAnnouncement` exists at `src/actions/announcements.ts:52`.
  Files: `+src/features/announcements/AnnouncementForm.tsx`, `+src/features/announcements/AnnouncementDialog.tsx`, `M src/features/announcements/AnnouncementsClient.tsx`

- [ ] **9. PaymentMethods Create → Dialog** — `PaymentMethodsClient.tsx:83-120` inline form → `PaymentMethodForm.tsx` + `PaymentMethodDialog.tsx`. Action `createPaymentMethod` exists at `src/actions/payments.ts:37`.
  Files: `+src/features/payments/PaymentMethodForm.tsx`, `+src/features/payments/PaymentMethodDialog.tsx`, `M src/features/payments/PaymentMethodsClient.tsx`

- [ ] **10. RecordPayment Create → Dialog** — `RecordPaymentForm.tsx` inline grid → `RecordPaymentDialog.tsx`. Keep `RecordPaymentForm.tsx` as form content. Modify `FinanceClient.tsx` to use Dialog.
  Files: `+src/features/finance/RecordPaymentDialog.tsx`, `M src/features/finance/FinanceClient.tsx`

- [ ] **11. DocumentUpload Create → Dialog** — `DocumentsClient.tsx` inline upload + `DocumentUploadForm.tsx` → `DocumentUploadDialog.tsx`. Uses `uploadDocument` at `src/actions/documents.ts`. File upload fields remain as-is, just wrapped in Dialog.
  Files: `+src/features/students/DocumentUploadDialog.tsx`, `M src/features/students/DocumentsClient.tsx`

---

### Phase 2 — Add Missing Edit Operations (6 features)

Server actions exist for some features but Edit is not wired in the UI. Others need new server actions.

- [ ] **12. Classes Edit → Dialog** — `updateClass` exists at `src/actions/academic.ts:100`. Wire Edit Dialog in `ClassesClient.tsx`. Reuse `ClassesForm.tsx` from Phase 1.
  Files: `M src/features/academic/classes/ClassesClient.tsx`

- [ ] **13. Announcements Edit → Dialog** — `updateAnnouncement` exists at `src/actions/announcements.ts:122`. Wire Edit Dialog in `AnnouncementsClient.tsx`. Reuse `AnnouncementForm.tsx` from Phase 1.
  Files: `M src/features/announcements/AnnouncementsClient.tsx`

- [ ] **14. PaymentMethods Edit → Dialog** — `updatePaymentMethod` exists at `src/actions/payments.ts:80`. Wire Edit Dialog in `PaymentMethodsClient.tsx`. Reuse `PaymentMethodForm.tsx` from Phase 1.
  Files: `M src/features/payments/PaymentMethodsClient.tsx`

- [ ] **15. AdminUsers Edit → Dialog** — `updateStaffAccount` server action does **not** exist. Create it at `src/actions/admin.ts` (name, email, roleId fields). Then wire Edit Dialog in `AdminUsersClient.tsx`. Reuse `StaffAccountForm.tsx` from Phase 1.
  Files: `M src/actions/admin.ts`, `M src/features/admin/AdminUsersClient.tsx`

- [ ] **16. Enrollments Edit → Dialog** — `updateEnrollment` server action does **not** exist. Create it at `src/actions/enrollments.ts` (classId, semesterId fields? Or is status change enough?). **Decision needed:** Confirm with user whether enrollment details should be editable, or if status change is sufficient.
  Files: `M src/actions/enrollments.ts` (if needed), `M src/features/enrollments/EnrollmentsClient.tsx`

- [ ] **17. Assignments Edit → Dialog** — `updateAssignment` server action does **not** exist. **Decision needed:** Confirm with user whether assignments should be re-assignable, or if delete+create is the intended pattern.
  Files: `src/actions/academic.ts` (if needed), `M src/features/academic/AssignmentsClient.tsx`

---

### Phase 3 — Action Column Uniformity (15 features)

Migrate all raw button action columns to standard pattern: `ActionCell onDelete` for delete, Dialog trigger Button for edit, `ActionCell onCustom` for extras.

- [ ] **18. Classes** — Actions column at `ClassesClient.tsx:38-50`. Replace raw `<form>` + Button delete with `ActionCell onDelete`. Add Edit Button → ClassesDialog (from Phase 1/2).
  Files: `M src/features/academic/classes/ClassesClient.tsx`

- [ ] **19. Majors** — Actions column at `MajorsClient.tsx:35-43`. Replace raw Edit Button with Dialog trigger. Replace raw Delete Button + `confirm()` with `ActionCell onDelete`.
  Files: `M src/features/academic/majors/MajorsClient.tsx`

- [ ] **20. Subjects** — Actions column at `SubjectsClient.tsx:46-55`. Same pattern as Majors: Edit Button → Dialog trigger, Delete + `confirm()` → `ActionCell onDelete`.
  Files: `M src/features/academic/subjects/SubjectsClient.tsx`

- [ ] **21. Semesters** — Actions column at `SemestersClient.tsx:46-56`. Replace Delete + `confirm()` with `ActionCell onDelete`. Replace Aktifkan raw Button with `ActionCell onCustom([{ label: "Aktifkan", variant: "outline", onClick: ... }])`. Edit Button → Dialog trigger.
  Files: `M src/features/academic/semesters/SemestersClient.tsx`

- [ ] **22. Assignments** — Actions column at `AssignmentsClient.tsx:57-62`. Already has `ActionCell onDelete`. Add Edit Button → AssignmentDialog (from Phase 1/2).
  Files: `M src/features/academic/AssignmentsClient.tsx`

- [ ] **23. Enrollments** — Actions column at `EnrollmentsClient.tsx:72-86`. Already has `ActionCell onDelete`. Replace inline `StatusChangeForm` `<Select>` with `ActionCell onCustom([{ label: "Pindah", ... }, { label: "Dropout", ... }, { label: "Lulus", ... }])` using `updateEnrollmentStatus`.
  Files: `M src/features/enrollments/EnrollmentsClient.tsx`

- [ ] **24. AdminUsers** — Actions column at `AdminUsersClient.tsx:71-78`. Already has `ActionCell onDelete`. Add Edit Button → StaffAccountDialog (from Phase 2).
  Files: `M src/features/admin/AdminUsersClient.tsx`

- [ ] **25. Approvals** — Already uses `ActionCell onCustom`. No changes needed. ✅

- [ ] **26. Announcements** — Actions column at `AnnouncementsClient.tsx:103-130`. Already has `ActionCell onDelete` + `ActionCell onCustom`. Add Edit Button → AnnouncementDialog (from Phase 2). Keep publish/unpublish in onCustom.
  Files: `M src/features/announcements/AnnouncementsClient.tsx`

- [ ] **27. Finance** — Actions column at `FinanceClient.tsx:66-76`. Replace raw conditional Button "Konfirmasi" with `ActionCell onCustom([{ label: "Konfirmasi", onClick: ... }])`.
  Files: `M src/features/finance/FinanceClient.tsx`

- [ ] **28. PaymentItems** — Already has `ActionCell onDelete` + Edit Button. No changes needed. ✅

- [ ] **29. PaymentCatalog** — Actions column at `PaymentCatalogClient.tsx:124-145`. Replace raw ghost Delete Button with `ActionCell onDelete`. Edit Dialog trigger stays.
  Files: `M src/features/payments/PaymentCatalogClient.tsx`

- [ ] **30. PaymentMethods** — Actions column at `PaymentMethodsClient.tsx:44-49`. Has `ActionCell onDelete` with `require()` — fix to dynamic `await import()`. Add Edit Button → PaymentMethodDialog (from Phase 2).
  Files: `M src/features/payments/PaymentMethodsClient.tsx`

- [ ] **31. SystemConfigs** — Actions column at `SystemConfigsClient.tsx:127-143`. Replace raw Edit Button with Dialog trigger. Replace raw Delete Button + `confirm()` with `ActionCell onDelete`.
  Files: `M src/features/settings/SystemConfigsClient.tsx`

- [ ] **32. Documents** — Actions column at `DocumentsClient.tsx:50-57`. Replace raw anchor Button with `ActionCell onCustom([{ label: "Lihat", onClick: ... }])`.
  Files: `M src/features/students/DocumentsClient.tsx`

---

### Phase 4 — Page Shell Migration (12 features)

Wrap all CRUD feature pages in `<PageShell title="..." description="...">` for consistent page structure.

PageShell takes: `title` (string), `description` (string), `children`. Import from `@/components/ui/page-shell`.

- [ ] **33. MajorsClient** — `src/features/academic/majors/MajorsClient.tsx` — bare DataTable. Wrap in PageShell.
- [ ] **34. SubjectsClient** — `src/features/academic/subjects/SubjectsClient.tsx` — bare DataTable. Wrap in PageShell.
- [ ] **35. SemestersClient** — `src/features/academic/semesters/SemestersClient.tsx` — bare DataTable. Wrap in PageShell.
- [ ] **36. AdminUsersClient** — `src/features/admin/AdminUsersClient.tsx` — manual `div.flex.flex-col.gap-6`. Wrap in PageShell.
- [ ] **37. ApprovalsClient** — `src/features/admin/ApprovalsClient.tsx` — manual `div.flex.flex-col.gap-6`. Wrap in PageShell.
- [ ] **38. AnnouncementsClient** — `src/features/announcements/AnnouncementsClient.tsx` — manual `div.flex.flex-col.gap-6.p-4.md:p-6`. Wrap in PageShell.
- [ ] **39. FinanceClient** — `src/features/finance/FinanceClient.tsx` — manual `div.flex.flex-col.gap-6.p-4.md:p-6`. Wrap in PageShell.
- [ ] **40. PaymentItemsClient** — `src/features/payments/PaymentItemsClient.tsx` — Card wrapping DataTable. Wrap in PageShell.
- [ ] **41. PaymentCatalogClient** — `src/features/payments/PaymentCatalogClient.tsx` — `div.flex.flex-col.gap-6`. Wrap in PageShell.
- [ ] **42. PaymentMethodsClient** — `src/features/payments/PaymentMethodsClient.tsx` — manual `div.flex.flex-col.gap-6.p-4.md:p-6`. Wrap in PageShell.
- [ ] **43. SystemConfigsClient** — `src/features/settings/SystemConfigsClient.tsx` — raw divs. Wrap in PageShell.
- [ ] **44. DocumentsClient** — `src/features/students/DocumentsClient.tsx` — `div.flex.flex-col.gap-6`. Wrap in PageShell.

---

### Phase 5 — Secondary Debt Cleanup (7 items)

- [ ] **45. Replace `throw new Error()` → `useToast()`** — `RecordPaymentForm.tsx:49`, `PaymentItemDialog.tsx:62,67`. These throw on failed server action, which crashes the form. Replace with `toast({ variant: "destructive", description: result.error })`.
  Files: `M src/features/finance/RecordPaymentForm.tsx`, `M src/features/payments/PaymentItemDialog.tsx`

- [ ] **46. Replace `confirm()` → `ActionCell`** — 4 files use native `confirm()`: `MajorsClient.tsx:57`, `SubjectsClient.tsx:69`, `SemestersClient.tsx:69`, `SystemConfigsClient.tsx:88`. After Phase 3, these `confirm()` calls should be eliminated. Verify no `confirm()` remains in `src/features/`.
  Files: `src/features/academic/majors/MajorsClient.tsx`, `src/features/academic/subjects/SubjectsClient.tsx`, `src/features/academic/semesters/SemestersClient.tsx`, `src/features/settings/SystemConfigsClient.tsx`

- [ ] **47. Replace `require()` → dynamic `await import()`** — `PaymentMethodsClient.tsx:49` uses `require("@/actions/payments")` which breaks bundling. Replace with `const { deletePaymentMethod } = await import("@/actions/payments")`.
  Files: `M src/features/payments/PaymentMethodsClient.tsx`

- [ ] **48. Replace raw `<select>` → shadcn `<Select>`** — 4 raw HTML `<select>` elements: `RecordPaymentForm.tsx:60,77`, `StudentAcademicClient.tsx:264`, `SystemConfigsClient.tsx:175`. Replace with shadcn `<Select>` component.
  Files: `M src/features/finance/RecordPaymentForm.tsx`, `M src/features/academic/StudentAcademicClient.tsx`, `M src/features/settings/SystemConfigsClient.tsx`

- [ ] **49. Fix `@phosphor-icons/react/dist/ssr` → `@phosphor-icons/react`** — `BoardingClient.tsx:3` imports from SSR path in a client component. Change to `@phosphor-icons/react`.
  Files: `M src/features/boarding/BoardingClient.tsx`

- [ ] **50. Standardize error handling: `setMessage()`/`setError()` → `useToast()`** — 7 files use `useState` for error messages instead of `useToast()`: `GradesClient.tsx`, `BulkEnrollmentForm.tsx`, `EnrollmentsClient.tsx`, `SystemConfigsClient.tsx`, `SchoolSettingsForm.tsx`, `LoginFormClient.tsx`, `DocumentUploadForm.tsx`. Replace with `useToast()` for transient feedback. Exception: `SchoolSettingsForm.tsx` success status can stay (persistent "Tersimpan!" text is not a toast).
  Files: `M src/features/academic/GradesClient.tsx`, `M src/features/enrollments/BulkEnrollmentForm.tsx`, `M src/features/enrollments/EnrollmentsClient.tsx`, `M src/features/settings/SystemConfigsClient.tsx`, `M src/features/auth/LoginFormClient.tsx`, `M src/features/students/DocumentUploadForm.tsx`

---

**Files created (new):**
- `src/features/academic/classes/ClassesForm.tsx`
- `src/features/academic/classes/ClassesDialog.tsx`
- `src/features/academic/majors/MajorForm.tsx`
- `src/features/academic/majors/MajorDialog.tsx`
- `src/features/academic/subjects/SubjectForm.tsx`
- `src/features/academic/subjects/SubjectDialog.tsx`
- `src/features/academic/semesters/SemesterForm.tsx`
- `src/features/academic/semesters/SemesterDialog.tsx`
- `src/features/academic/AssignmentForm.tsx`
- `src/features/academic/AssignmentDialog.tsx`
- `src/features/enrollments/EnrollmentForm.tsx`
- `src/features/enrollments/EnrollmentDialog.tsx`
- `src/features/admin/StaffAccountForm.tsx`
- `src/features/admin/StaffAccountDialog.tsx`
- `src/features/announcements/AnnouncementForm.tsx`
- `src/features/announcements/AnnouncementDialog.tsx`
- `src/features/payments/PaymentMethodForm.tsx`
- `src/features/payments/PaymentMethodDialog.tsx`
- `src/features/finance/RecordPaymentDialog.tsx`
- `src/features/students/DocumentUploadDialog.tsx`

**Files deleted:**
- `src/features/academic/subjects/SubjectFormCard.tsx`
- `src/features/academic/SemesterFormCard.tsx`

**Files modified:**
- `src/features/academic/classes/ClassesClient.tsx`
- `src/features/academic/majors/MajorsClient.tsx`
- `src/features/academic/subjects/SubjectsClient.tsx`
- `src/features/academic/semesters/SemestersClient.tsx`
- `src/features/academic/AssignmentsClient.tsx`
- `src/features/enrollments/EnrollmentsClient.tsx`
- `src/features/enrollments/BulkEnrollmentForm.tsx`
- `src/features/admin/AdminUsersClient.tsx`
- `src/features/admin/ApprovalsClient.tsx`
- `src/features/announcements/AnnouncementsClient.tsx`
- `src/features/payments/PaymentMethodsClient.tsx`
- `src/features/payments/PaymentCatalogClient.tsx`
- `src/features/payments/PaymentItemsClient.tsx`
- `src/features/finance/FinanceClient.tsx`
- `src/features/finance/RecordPaymentForm.tsx`
- `src/features/settings/SystemConfigsClient.tsx`
- `src/features/students/DocumentsClient.tsx`
- `src/features/academic/StudentAcademicClient.tsx`
- `src/features/boarding/BoardingClient.tsx`
- `src/features/academic/GradesClient.tsx`
- `src/features/auth/LoginFormClient.tsx`
- `src/actions/admin.ts` (if adding updateStaffAccount)
- `src/actions/enrollments.ts` (if adding updateEnrollment)

---

### Sprint 15 — Schema Centralization: Migrate All Zod Schemas to `src/lib/validation/schemas/`

**Status:** pending

**Date:** 2026-06-16

**Source:** Audit of all `src/actions/*.ts` files — 4 files have inline Zod schemas that should be centralized. 6 files are missing Zod schemas entirely and perform manual/string validation.

**Summary:** Centralize all validation schemas into `src/lib/validation/schemas/`. Extract existing inline schemas from action files, create schemas where missing. Update action files to import from centralized location.

**Pattern:** One schema file per action domain, matching existing `enrollments.ts`, `grades.ts`, `settings.ts` structure. Each exports named schemas. Action files import and use via `.safeParse()`. No inline `z.object()` in action files.

---

### Phase 1 — Extract Existing Inline Schemas (4 action files)

- [ ] **1. `src/actions/academic.ts`** — Extract 10 inline schemas to `src/lib/validation/schemas/academic.ts`:
  - `classSchema`, `updateClassSchema`
  - `majorSchema`, `updateMajorSchema`
  - `subjectSchema`, `updateSubjectSchema`
  - `semesterSchema`, `updateSemesterSchema`
  - `assignTeacherSchema`, `idSchema`
  Update `academic.ts` to import from `@/lib/validation/schemas/academic`.
  Files: `+src/lib/validation/schemas/academic.ts`, `M src/actions/academic.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **2. `src/actions/announcements.ts`** — Extract inline `announcementSchema` to `src/lib/validation/schemas/announcements.ts`.
  Schema fields: title (string min 1), category (string min 1), priority (string optional), description (string optional), content (string min 1).
  Files: `+src/lib/validation/schemas/announcements.ts`, `M src/actions/announcements.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **3. `src/actions/payments.ts`** — Extract 3 inline schemas to `src/lib/validation/schemas/payments.ts`:
  - `paymentMethodSchema` (name, provider, accountNumber, accountName all strings)
  - `recordPaymentSchema` (studentId uuid, paymentItemId number optional, description string required, price number, quantity number default 1)
  - `idSchema` (coerced number positive)
  Files: `+src/lib/validation/schemas/payments.ts`, `M src/actions/payments.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **4. `src/actions/register.ts`** — Extract inline `registerSchema` to `src/lib/validation/schemas/register.ts`.
  Schema fields: name, email, password (min 6), confirmPassword, nisn (optional), birthPlace (optional), birthDate (optional), gender (optional enum), religionId (optional), address (optional max 500), fatherName (optional max 100), motherName (optional max 100). Plus `.refine(data => data.password === data.confirmPassword, ...)`.
  Files: `+src/lib/validation/schemas/register.ts`, `M src/actions/register.ts`, `M src/lib/validation/schemas/index.ts`

---

### Phase 2 — Create Zod Schemas Where Missing (6 action files)

These action files currently have **no** Zod validation — manual string casts and edge-case checks only. Create schemas and wire them in.

- [ ] **5. `src/actions/admin.ts`** — Create `src/lib/validation/schemas/admin.ts`:
  - `createStaffAccountSchema`: name (string min 2 max 100), email (string email), password (string min 6), roleId (coerced number positive)
  Wire into `createStaffAccount` at line 57.
  Files: `+src/lib/validation/schemas/admin.ts`, `M src/actions/admin.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **6. `src/actions/calendar.ts`** — Create `src/lib/validation/schemas/calendar.ts`:
  - `createEventSchema`: title (string min 1 max 255), description (string max 1000 optional nullable), startAt (string datetime-local), endAt (string datetime-local optional nullable), allDay (coerced boolean), category (enum: academic, holiday, event, meeting, exam, other), isPublic (coerced boolean)
  - `updateEventSchema`: extends create + eventId (coerced number positive)
  Wire into `createEvent`, `updateEvent`, `deleteEvent` at `calendar.ts`.
  Files: `+src/lib/validation/schemas/calendar.ts`, `M src/actions/calendar.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **7. `src/actions/profile.ts`** — Create `src/lib/validation/schemas/profile.ts`:
  - `updateProfileSchema`: phone (string optional), address (string optional), fatherName (string optional), motherName (string optional), nisn (string optional), birthPlace (string optional), birthDate (string optional), gender (optional enum), religionName (string optional)
  Wire into `updateProfile` at line 9.
  Files: `+src/lib/validation/schemas/profile.ts`, `M src/actions/profile.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **8. `src/actions/paymentItems.ts`** — Create `src/lib/validation/schemas/paymentItems.ts`:
  - `createPaymentItemSchema`: code (string min 1 max 50), name (string min 1 max 255), description (optional nullable), standardPrice (coerced number min 0), type (enum: recurring, one_time, variable nullable), semesterId (coerced number positive optional nullable), isActive (coerced boolean)
  - `updatePaymentItemSchema`: extends create + itemId (coerced number positive)
  Wire into `createPaymentItem`, `updatePaymentItem`, `deletePaymentItem`.
  Files: `+src/lib/validation/schemas/paymentItems.ts`, `M src/actions/paymentItems.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **9. `src/actions/documents.ts`** — Create `src/lib/validation/schemas/documents.ts`:
  - `documentTypeSchema`: enum of 10 document types (ijasah, skhun, skl, aktaKelahiran, kk, ktpAyah, ktpIbu, kip, passFoto, rapor)
  - `uploadDocumentSchema`: studentId (string uuid), documentType (documentTypeSchema), file (see note — file validation happens on server, not via Zod)
  Wire into `uploadDocument`, `downloadDocument`, `getDocuments`, `deleteDocument`.
  Files: `+src/lib/validation/schemas/documents.ts`, `M src/actions/documents.ts`, `M src/lib/validation/schemas/index.ts`

- [ ] **10. `src/actions/auth.ts`** — Create `src/lib/validation/schemas/auth.ts`:
  - `loginSchema`: email (string email), password (string min 1)
  Wire into `loginAction`.
  Files: `+src/lib/validation/schemas/auth.ts`, `M src/actions/auth.ts`, `M src/lib/validation/schemas/index.ts`

---

**Files created (new):**
- `src/lib/validation/schemas/academic.ts`
- `src/lib/validation/schemas/announcements.ts`
- `src/lib/validation/schemas/payments.ts`
- `src/lib/validation/schemas/register.ts`
- `src/lib/validation/schemas/admin.ts`
- `src/lib/validation/schemas/calendar.ts`
- `src/lib/validation/schemas/profile.ts`
- `src/lib/validation/schemas/paymentItems.ts`
- `src/lib/validation/schemas/documents.ts`
- `src/lib/validation/schemas/auth.ts`

**Files modified:**
- `src/lib/validation/schemas/index.ts`
- `src/actions/academic.ts`
- `src/actions/announcements.ts`
- `src/actions/payments.ts`
- `src/actions/register.ts`
- `src/actions/admin.ts`
- `src/actions/calendar.ts`
- `src/actions/profile.ts`
- `src/actions/paymentItems.ts`
- `src/actions/documents.ts`
- `src/actions/auth.ts`

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