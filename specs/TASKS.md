# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section. Keep only the 5 most recent entries.
> Last updated: 2026-06-17 — Sprints 17 (Bug Fix) and 18 (Documents Module) added. Sprint 16 (Follow-up Wiring) remains active alongside Sprint 17/18.

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

### Sprint 17 — Bug Fix Sprint (Code Review Findings)

**Status:** planned
**Date:** 2026-06-17
**Source:** Code review audit — 6 confirmed bugs across the codebase: toast styling, user creation blocker, sidebar avatar visibility, table border consistency, dashboard layout ordering.

**Sprint goal:** All 6 bugs fixed. CreateStaffAccount role validation corrected so admin can create users again. Sidebar avatar visible on dark sidebar. Table borders consistent across all feature pages. Dashboard Quick Menu ordered before stats. Toast destructive variant renders proper text color. Build + typecheck pass.

---

#### Phase 1 — Critical: User creation broken (1 task)

- [ ] **1.1 Fix `createStaffAccount` role validation** — In `src/actions/admin.ts:65`, the check `![60, 80].includes(roleId)` compares DB auto-increment role ID against level values (60, 80). The role IDs are auto-increment small ints (1-5), never 60 or 80. Fix: fetch the role's `level` from DB and validate against that, or compare the resolved level directly. Also switch `auth.api.signUpEmail()` → `auth.api.createUser()` at line 76 per AGENTS.md rule (staff accounts must use createUser, not signUpEmail). `M src/actions/admin.ts`

#### Phase 2 — High: Sidebar avatar invisible (1 task)

- [ ] **2.1 Fix `ProfileDropdown` avatar text color** — In `src/features/layout/profile-dropdown.tsx:22-26`, avatar uses `bg-slate-100` as circle background with inherited sidebar foreground text (near-white on light-gray). Fix: use `bg-sidebar-primary` (gold accent) as avatar background + `text-sidebar-primary-foreground` for contrast, or set explicit dark text color on the span. `M src/features/layout/profile-dropdown.tsx`

#### Phase 3 — Medium: Double border on tables (3 tasks)

- [ ] **3.1 Remove extra border wrapper from Subjects page** — `src/app/(app)/academic/subjects/page.tsx:15-17`: remove outer `<div className="rounded-md border">`. DataTable already renders inside `DataTableShell` which has `rounded-md border bg-card`. `M src/app/(app)/academic/subjects/page.tsx`
- [ ] **3.2 Remove extra border wrapper from Semesters page** — `src/app/(app)/academic/semesters/page.tsx:15-17`: same fix. Remove outer border div. `M src/app/(app)/academic/semesters/page.tsx`
- [ ] **3.3 Remove extra border wrapper from Settings system configs** — `src/features/settings/SystemConfigsClient.tsx:153`: remove outer `<div className="rounded-md border">` around DataTable. `M src/features/settings/SystemConfigsClient.tsx`

#### Phase 4 — Low: Dashboard layout (1 task)

- [ ] **4.1 Move QuickMenu above stats sections** — In `src/features/dashboard/DashboardClient.tsx`, move `<QuickMenu roleLevel={roleLevel} />` from line 485 (after all stat sections) to before the stat cards (before the `isSiswa/isAlumni` block at line 260, or immediately after the welcome heading at line 258). Ensure QuickMenu renders first for all role levels. `M src/features/dashboard/DashboardClient.tsx`

#### Phase 5 — Medium: Toast destructive variant style (1 task)

- [ ] **5.1 Fix toast description color on destructive variant** — In `src/hooks/use-toast.tsx:70`, the description `<div>` always uses `text-muted-foreground`. On destructive toasts, text should be `text-destructive-foreground`. Fix: conditionally apply `text-destructive-foreground` when `variant === "destructive"`, otherwise `text-muted-foreground`. `M src/hooks/use-toast.tsx`

#### Phase 6 — Verify (1 task)

- [ ] **6.1 Run verification suite** — `bun run lint` (target: 0 new errors), `bun run typecheck` (target: pass), `bun run build` (target: green with MariaDB running). Manually test: create user with guru role, verify avatar visible in sidebar footer, verify Subjects/Semesters tables have single border, verify Dashboard Quick Menu appears before stats.

---

**Files touched (estimate):** 8 source files. 0 new files.

---

### Sprint 18 — Documents Management Module (Admin)

**Status:** planned
**Date:** 2026-06-17
**Source:** Client request — missing standalone documents menu for admin to upload, manage, and distribute important school files (policies, circulars, forms, reports). Current documents feature is per-student only at `/students/[id]/documents/`.

**Sprint goal:** New "Dokumen" sidebar menu item for admin role (level ≥ 80). Standalone documents page with upload (file picker + drag-drop), list table, search, delete (soft), and download. Schema for school-wide documents. Integration with existing encryption (`src/lib/crypto.ts`, AES-256-GCM). No per-student document overlap — this is a separate entity.

---

#### Phase 1 — Schema & DB (2 tasks)

- [ ] **1.1 Create `school_documents` table** — New Drizzle schema at `src/lib/db/schema/schoolDocuments.ts`. Columns: `id` (BIGINT auto PK), `title` (varchar 255), `description` (text, nullable), `fileName` (varchar 255), `fileType` (varchar 100, MIME type), `fileSize` (int, bytes), `encryptedData` (longtext, AES-256-GCM encrypted via `src/lib/crypto.ts`), `category` (varchar 50, nullable — e.g. "kebijakan", "surat_edaran", "formulir", "laporan"), `isPublic` (boolean, default false), `uploadedBy` (varchar 36 FK to users.id), `createdAt`, `updatedAt`, `deletedAt` (timestamp, soft delete). Export from `src/lib/db/schema/index.ts`. `M +schema/schoolDocuments.ts`, `M +schema/index.ts`
- [ ] **1.2 Run migration** — `bunx drizzle-kit generate` + `bunx drizzle-kit push` to create the table in MariaDB. `M src/lib/db/schema/`

#### Phase 2 — Server actions (3 tasks)

- [ ] **2.1 Create `src/actions/documents-admin.ts`** — `uploadSchoolDocument(formData: FormData)`: validate actor role ≥ 80, parse multipart (title, description, category, file), encrypt file buffer via `src/lib/crypto.ts`, insert row. `getSchoolDocuments()`: list with pagination, filter by category, search by title. `deleteSchoolDocument(id: number)`: soft delete. All actions include RBAC check + `revalidatePath`. `M +src/actions/documents-admin.ts`
- [ ] **2.2 Add `downloadSchoolDocument` API route** — At `src/app/api/documents/school/[id]/route.ts`. GET handler: verify auth, fetch document, check permission (public or same-user or admin), decrypt, return file with correct Content-Type + Content-Disposition headers. `M +src/app/api/documents/school/[id]/route.ts`
- [ ] **2.3 Add Zod validation schema** — At `src/lib/validation/schemas/schoolDocuments.ts`. `uploadSchoolDocumentSchema` with title (min 1, max 255), description (optional), category (optional enum), file (required, max 10MB). Export from schemas index. `M +src/lib/validation/schemas/schoolDocuments.ts`, `M +src/lib/validation/schemas/index.ts`

#### Phase 3 — UI pages (2 tasks)

- [ ] **3.1 Create `DocumentsAdminClient.tsx`** — In `src/features/documents/`. Client component with: DataTable listing all school documents (title, category, file type, file size, upload date, uploaded by). Search by title, filter by category dropdown. Actions per row: download, delete (soft, with confirmation dialog). Upload button opens dialog with form (title, description, category select, file upload). Drag-drop zone for file. Use `useToast()` for feedback. `M +src/features/documents/DocumentsAdminClient.tsx`
- [ ] **3.2 Create page route at `src/app/(app)/documents/page.tsx`** — Server component: verify role ≥ 80, fetch `getSchoolDocuments()`, render `PageShell` + `DocumentsAdminClient`. Add Breadcrumb. `M +src/app/(app)/documents/page.tsx`

#### Phase 4 — Sidebar menu (1 task)

- [ ] **4.1 Add "Dokumen" nav item to sidebar** — In `src/features/layout/app-sidebar.tsx`, add a new `NavItem` to `navItems[]`:
  ```ts
  { title: "Dokumen", href: "/documents", icon: File, minLevel: 80 },
  ```
  Import `File` from `@phosphor-icons/react`. Place after "Pengumuman" or in a logical group. Ensure it only shows for users with roleLevel ≥ 80. `M src/features/layout/app-sidebar.tsx`

#### Phase 5 — Verify (1 task)

- [ ] **5.1 Run verification suite** — `bun run lint` (0 errors), `bun run typecheck` (pass), `bun run build` (green). Check: sidebar shows "Dokumen" for admin/superadmin, hides for guru/siswa/alumni. Upload a file, see it in table, download it back, delete it. File is encrypted at rest (verify via DB query).

---

**Files created:** 6 new files: schema, actions, validation, page, client component, API route.
**Files modified:** 3 files: schema/index.ts, sidebar, schemas/index.ts.
**Out of scope:** Per-student document upload (already exists at `/students/[id]/documents/`). Document categories CRUD — use hardcoded enum initially.

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
