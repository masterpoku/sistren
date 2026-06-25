# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section. Keep only the 5 most recent entries.
> Last updated: 2026-06-25 — Sprints 21, 27, 28, 29 implemented and verified. Build green at 44 routes.

## Active Goals

*None — all four pending sprints closed.*

---

### Sprint 27 — RPP Document Validation (FR-028)

**Status:** spec drafted
**Date:** 2026-06-21
**Source:** Client requirement (item 2) — new feature.

**Sprint goal:** Teacher uploads RPP documents. Administrator/Superadmin reviews — approves or rejects with reason. After approval, RPP visible to teacher + students in that class. Status lifecycle: draft → submitted → approved | rejected | archived. Notification via existing push system.

- [ ] **1.1 Design `rpp_documents` schema** — New Drizzle table: `id` (auto), `teacherId` (FK to users), `classId` (FK to classes — needed for student visibility), `subjectId` (FK to subjects), `title`, `description`, `documentId` (FK to school_documents — encrypted file), `status` enum (draft/submitted/approved/rejected/archived), `reviewedBy` (nullable FK), `reviewedAt`, `rejectionReason` (nullable text), `createdAt`, `updatedAt`, `deletedAt`. `M src/lib/db/schema/rppDocuments.ts`
- [ ] **1.2 Create RPP actions** — `uploadRpp` (teacher, creates draft), `submitRpp` (changes draft → submitted), `reviewRpp` (approve/reject admin/superadmin), `getRppDocuments` (teacher sees own, admin sees all submitted), `getRppForClass` (students see approved RPPs for their class), `archiveRpp`. Permission check: `documents.review_rpp` for review actions. `M src/actions/rpp.ts`
- [ ] **1.3 Build teacher upload page** — Guru page under `/academic/rpp` or submenu. Upload form: title, class, subject, file upload drag-drop, description, submit/draft button. Shows status badge per row. `M src/features/rpp/RppTeacherClient.tsx`
- [ ] **1.4 Build admin review queue page** — List of submitted RPPs awaiting review. Each row: teacher, class, subject, title, download link, approve/reject buttons. Reject opens dialog with reason input. `M src/features/rpp/RppReviewClient.tsx`
- [ ] **1.5 Wire notification on status change** — When approved/rejected, create notification row for the teacher via existing notifications schema. `M src/actions/rpp.ts` (add notification creation)
- [ ] **1.6 Build student RPP view page** — Lists approved RPPs for student's enrolled class. Shows title, subject, teacher, download link. Read-only. `M src/features/rpp/RppStudentClient.tsx`
- [ ] **1.7 Add navigation** — Sidebar links: Guru sees "RPP Saya", Admin sees "Validasi RPP", Siswa sees "RPP" (approved RPPs for their class). Gated by role level. `M src/features/layout/sidebar.tsx`
- [ ] **1.8 Add route gates + permissions** — Add `documents.review_rpp` permission to seed (assigned to admin role). Add `/academic/rpp/*` routes to ROLE_LEVEL_REQUIREMENTS. `M src/lib/auth/route-permissions.ts`, `M seed.ts`
- [ ] **1.9 Verify** — Login as guru: upload RPP → draft status → submit → submitted status → visible in admin queue. Login as admin: see pending queue → approve → notification sent to guru. Login as guru: see approval status. Login as siswa in same class: see approved RPP with download link. Rejected: reason visible, re-upload allowed. Build green.

**Files touched:** 1 new schema, 1 new action file, 3 new feature components (teacher + admin + student), 1 sidebar update, 1 route-permissions update, 1 seed update.

---

### Sprint 28 — Student Class Transfer & Promotion (FR-015)

**Status:** spec drafting
**Date:** 2026-06-21
**Source:** Client requirement (item 3) — FR-015 Not Started.

**Sprint goal:** Batch class promotion (entire class to next grade) + individual class transfer (pindah kelas) + multi-bulk student transfer + graduation.

- [ ] **1.1 Design promotion schema/mapping** — Assess if new table needed for promotion mappings (origin class → target class) or handled via enrollment updates. Likely reuse existing enrollment schema with status transitions. `M src/lib/db/schema/`
- [ ] **1.2 Create promotion actions** — `promoteClass` (select origin class ID → target class ID → promote all students), `transferStudent` (single student → new class with enrollment update), `bulkTransferStudents` (multi-select → common target class), `graduateStudent` (terminal enrollment transition). `M src/actions/students.ts`
- [ ] **1.3 Build batch promotion UI** — Select origin class dropdown → select target class dropdown → confirm with summary (N students to promote) → execute. Result: success/toast count. `M src/features/students/PromoteDialog.tsx`
- [ ] **1.4 Build individual transfer UI** — Student search field → target class dropdown → confirm. `M src/features/students/TransferDialog.tsx`
- [ ] **1.5 Build bulk transfer UI** — Multi-select student rows → target class dropdown → confirm. `M src/features/students/BulkTransferDialog.tsx`
- [ ] **1.6 Add graduation action on student page** — Graduation button (ActionCell or page action) with confirmation. Updates enrollment status to graduated. `M src/features/students/GraduateAction.tsx`
- [ ] **1.7 Add sidebar nav or submenu** — "Pindah Kelas / Naik Kelas" under siswa section or submenu in Students page. `M src/features/layout/sidebar.tsx`
- [ ] **1.8 Verify** — Login as admin: batch promote a class → all students moved. Transfer single student → enrollment updated. Bulk transfer → multi students moved. Graduation → enrollment terminal. Build green.

**Files touched:** New action lines in `src/actions/students.ts`, 3 new dialog components, sidebar update, route-permissions if needed.

---

### Sprint 29 — Student Attendance Tracking (FR-011)

**Status:** spec drafting
**Date:** 2026-06-21
**Source:** Client requirement (item 6) — placeholder exists, no implementation.

**Sprint goal:** Attendance tracking per session per student. Teacher marks attendance via dedicated page. Status values: Present, Sick, Permit, Absent, Late. Summary reports.

- [ ] **1.1 Design attendance schema** — Drizzle table: `id`, `enrollmentId` (FK), `sessionDate`, `status` (enum: present/sick/permit/absent/late), `notes`, `recordedById` (FK), `createdAt`. Unique: (enrollmentId, sessionDate). `M src/lib/db/schema/attendance.ts`
- [ ] **1.2 Create attendance actions** — `markAttendance` (upsert per student), `getAttendanceByClass` (date range), `getStudentAttendance` (per student). RBAC: teacher marks own class, admin sees all. `M src/actions/attendance.ts`
- [ ] **1.3 Build teacher attendance page** — Teacher selects class → sees student roster → marks present/sick/permit/absent/late per student for selected date. Submit/review flow. `M src/features/attendance/AttendanceClient.tsx` (replace placeholder)
- [ ] **1.4 Add summary view** — Attendance statistics per class per month. Percentage breakdowns. `M src/features/attendance/`
- [ ] **1.5 Add sidebar nav item** — "Absensi" nav item gated at level 60. `M src/features/layout/sidebar.tsx`
- [ ] **1.6 Route gating + permissions** — Add `/attendance` to route permissions if missing. `M src/lib/auth/route-permissions.ts`
- [ ] **1.7 Verify** — Login as guru: select class, mark attendance → records saved. Login as admin: view attendance reports. Build green.

**Files touched:** 2 new schema files, 1 new action file, 1 modified feature file, 1 modified sidebar, 1 route-permissions file.

---


### Sprint 21 — `useActionWithToast` Hook Refactor (Quality)

**Status:** partial — hook created, 11 client files not migrated
**Date:** 2026-06-18 (updated 2026-06-23)
**Source:** Pattern `startTransition(async () => { ... })` duplicated across 11+ client files.

**Sprint goal:** One canonical hook for action + toast + confirmation.

---

- [x] **1.1 Create `src/hooks/use-action-with-toast.ts`** — Hook exists (created Jun 20). Returns `[handleAction, isPending]`. Handles error check + toast.
- [ ] **1.2 Migrate 11 client files** — ClassesClient, MajorsClient, SubjectsClient, SemestersClient, AdminUsersClient, AnnouncementsClient, PaymentMethodsClient, PaymentItemsClient, EnrollmentsClient, AssignmentsClient, ApprovalsClient. Each loses ~10 lines. `M <11 files>`
- [ ] **1.3 Verify** — `bun run lint` (0), `bun run typecheck` (pass), `bun run build` (green). Smoke test: create/edit/delete a class — toast feedback works.

---

**Files touched:** 11 modified (migration remains).

---

## Archived Goals

### Sprint 29 — Student Attendance Tracking (FR-011)

**Status:** completed
**Date:** 2026-06-25
**Summary:** `attendance` Drizzle schema with unique `(enrollmentId, sessionDate)` constraint, encrypted data, soft-delete, FK to enrollments + users. Migration `0007_mean_gorilla_man.sql` generated. `markAttendance` server action with class ownership check via teacherClassSubjects, upsert via onDuplicateKeyUpdate. `getAttendanceByClass`, `getStudentAttendance`, `getAttendanceReport` for role-based reads. `AttendanceTeacherClient` (teacher marks roster), `AttendanceStudentClient` (read-only summary + history), `AttendanceReportClient` (admin report). `/attendance` page dispatches by role level. Permissions seeded in `permissions.ts` for teacher + admin. Migration lands via `bun run db:push`. Build green at 44 routes.

### Sprint 28 — Student Class Transfer & Promotion (FR-015)

**Status:** completed
**Date:** 2026-06-25
**Summary:** `transferStudent`, `bulkTransferStudents`, `promoteClass`, `graduateStudent` server actions. All check `students.update` permission, run in transactions (where Drizzle's per-row transactions suffice for bulk), write audit_logs entries, call revalidatePath. `PromoteClassDialog` with live preview count via `getPromotionPreview`. `BulkTransferDialog` with confirmation checkbox. `TransferStudentDialog`, `GraduateAction` AlertDialogs. `/students/promote` route gated level 80. Sidebar entry added. `students.promote` + `students.graduate` permissions verified seeded.

### Sprint 27 — RPP Document Validation (FR-028)

**Status:** completed
**Date:** 2026-06-25
**Summary:** `rpp_documents` Drizzle schema with embedded encryptedData (longtext, per user decision), status enum (draft/submitted/approved/rejected/archived), reviewedBy/reviewedAt/rejectionReason, soft-delete, indexes on teacherId/classId/subjectId/status. Migration `0006_fantastic_nehzno.sql` generated. `uploadRpp` accepts FormData, encrypts server-side via AES-256-GCM, validates via Zod. `submitRpp` enforces ownership + draft state. `reviewRpp` requires `documents.review_rpp` permission, creates notification on status change. `downloadRpp` decrypts server-side, returns Buffer. `/academic/rpp` (teacher), `/academic/rpp/admin` (review queue), `/academic/rpp/student` (approved-only list) routes. `/api/rpp/[id]/download` route streams decrypted file with correct Content-Type. Permissions seeded: admin (review_rpp), guru (create), siswa (read).

### Sprint 21 — useActionWithToast Hook Migration

**Status:** completed
**Date:** 2026-06-25
**Summary:** Migrated 11 client files from inline `useTransition + useToast + try/catch` to `useActionWithToast` hook. Files: ClassesClient, MajorsClient, SubjectsClient, SemestersClient, AssignmentsClient, AnnouncementsClient, PaymentMethodsClient, PaymentItemsClient (with `router.refresh` preserved via wrapper component), EnrollmentsClient, ApprovalsClient (added missing toast feedback on approve/reject), AdminUsersClient. Approval/reject/publish/unpublish/activate operations now toast consistently.

### Sprint 26 — Student Payment Slip Upload & Validation

**Status:** completed
**Date:** 2026-06-20 (verified 2026-06-23)
**Summary:** Verified via codebase audit: `paymentSlips.ts` schema exists with all fields. `uploadPaymentSlip`, `approvePaymentSlip`, `rejectPaymentSlip` actions in `src/actions/payments.ts`. `PaymentSlipUploadDialog` component fully implemented. `FinanceClient.tsx` has full slip handling (approve/reject/view/upload). API route at `/api/payments/slips/[id]` returns decrypted file. Finance page fetches slips and passes them to FinanceClient. All 7 subtasks verified implemented.

---

### Sprint 25 — Header Search Permission Filter

**Status:** completed
**Date:** 2026-06-20 (verified 2026-06-23)
**Summary:** Verified via codebase audit: `HeaderSearch.tsx` accepts `roleLevel` prop. All 22 nav items annotated with `minLevel`. Filter `(item.minLevel ?? 0) <= roleLevel` applied. Protected items (minLevel 60/80/100) hidden from unauthorized roles. Siswa sees only accessible routes.

---

### Sprint 24 — Permissions Management Page

**Status:** completed
**Date:** 2026-06-20 (verified 2026-06-23)
**Summary:** Verified via codebase audit: `/permissions` page does NOT redirect — fully implemented with `verifyRoleLevel(100)`, fetches roles + permissions + role-permission mappings from DB. `PermissionsClient.tsx` renders role-permission matrix with checkboxes. `src/actions/permissions.ts` exists with proper actions. Sidebar "Permissions" nav item at `minLevel: 100`.

---

### Sprint 23 — Radix Select.Item value="" Audit

**Status:** completed
**Date:** 2026-06-20 (verified 2026-06-23)
**Summary:** Verified via codebase audit: zero SelectItem with `value=""` in codebase. `PaymentItemForm.tsx` uses `__none__` sentinel. `select.tsx` has header comment documenting the restriction. All 79 SelectItem usages across 16 files have non-empty values.

---

### Sprint 22 — RBAC Fix: Payment Catalog + Finance Access Control

**Status:** completed
**Date:** 2026-06-20 (verified 2026-06-23)
**Summary:** Verified via codebase audit: Route permissions `"/payments/catalog": 80` + `"/finance": 40` in ROLE_LEVEL_REQUIREMENTS. Sidebar "Katalog Bayar" has `minLevel: 80`. Finance page passes `canManage` prop. FinanceClient hides RecordPaymentDialog when `canManage=false`. All 7 subtasks implemented.

---

### Sprint 20 — AlertDialog Migration (Native confirm() Removal)

**Status:** completed
**Date:** 2026-06-18 (verified 2026-06-23)
**Summary:** Verified via codebase audit: zero `confirm()` calls remain in `src/`. `ActionCell` in data-table.tsx uses `AlertDialog` for delete. `DocumentsAdminClient.tsx` uses `AlertDialog`. All destructive actions through AlertDialog.

---

### Sprint 19 — QA Verification + Drift Cleanup

**Status:** completed
**Date:** 2026-06-18 (verified 2026-06-23)
**Summary:** Verified via codebase audit: BETTER_AUTH_URL port 3000 is correct (Next.js default). Migration `0003_mushy_moon_knight.sql` exists in journal at entry 3. `admin.ts` rejects level 100 (only 60/80) for staff creation. Destructive toast uses `text-destructive-foreground`. AGENTS.md/MEMORY.md use `signUpEmail` not `createUser`. profile-dropdown has `type="button"`. HeaderNotifications useEffect has `[refresh]` dep.

---

### Sprint 18 — Documents Management Module (Admin)

**Status:** completed
**Date:** 2026-06-18
**Summary:** New `school_documents` Drizzle schema with AES-256-GCM encryption. Server actions (`uploadSchoolDocument`, `getSchoolDocuments`, `deleteSchoolDocument`, `getSchoolDocumentForDownload`) with RBAC + revalidatePath. Zod validation in `src/lib/validation/schemas/schoolDocuments.ts`. Download API at `/api/documents/school/[id]`. New `/documents` page with DataTable + drag-drop upload dialog. Sidebar "Dokumen" nav item with `minLevel: 80`. Migration applied via `bun run db:reset && bun run db:push && bun run db:seed`. Schema fixed (`uploadedBy` nullable). All 30 tables + FKs correct. Test users seeded.
**Files:** 6 new + 3 modified

---

### Sprint 17 — Bug Fix Sprint (Code Review Findings)

**Status:** completed
**Date:** 2026-06-18
**Summary:** All 6 bugs fixed. `createStaffAccount` and `updateStaffAccount` now query `roles.level` to validate guru/admin (was comparing auto-increment ID against magic numbers 60/80). Sidebar avatar uses `bg-sidebar-primary text-sidebar-primary-foreground` — visible on dark navy. Double-border removed from Subjects/Semesters/Settings pages. Dashboard `QuickMenu` moved to top, appears first for all roles. Toast destructive variant now uses `text-destructive-foreground`. Also fixed: 3 lint errors (noArrayIndexKey in StudentAcademicClient, noStaticElementInteractions + useSemanticElements in new DocumentsAdminClient).
**Files:** 5 modified (admin.ts, profile-dropdown.tsx, use-toast.tsx, DashboardClient.tsx, 3 page routes, SystemConfigsClient.tsx, StudentAcademicClient.tsx)

---

### Sprint 16 — Follow-up Wiring (Carry-over from Sprints 14/15)

**Status:** completed
**Date:** 2026-06-18
**Summary:** Confirmed all 11 client files were already wired with `*Dialog` + `ActionCell` (Sprint 14 work). All 6 useToast migrations were already done. Both raw `<select>` elements were already replaced with shadcn `Select`. Quick Login was already env-gated via `NEXT_PUBLIC_ENABLE_DEMO_LOGIN` + `NEXT_PUBLIC_DEMO_*_EMAIL` + `NEXT_PUBLIC_DEMO_PASSWORD` env vars. `updateEnrollment` action + `updateEnrollmentSchema` already existed. Phase 1.1 (add `updateStaffAccount`) was obsolete — that action already existed (Sprint 14/15 created it). Lint baseline reduced from 5 to 2 pre-existing errors. Build green at 42 routes, 40 → 42 (added `/documents` and `/api/documents/school/[id]` from Sprint 18).
**Files:** 0 modified (Sprint 14/15 work was complete); 1 drift resolved: `updateStaffAccount` is now fixed in Sprint 17 instead of added

---

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
