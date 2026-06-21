# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section. Keep only the 5 most recent entries.
> Last updated: 2026-06-21 — Sprint 27: RPP validation spec'd. Sprint 28: Student transfer/promotion spec drafting. Sprint 29: Attendance spec drafting. Sprint 26: Payment slip pending.

## Active Goals

### Sprint 27 — RPP Document Validation (FR-028)

**Status:** spec drafted
**Date:** 2026-06-21
**Source:** Client requirement (item 2) — new feature.

**Sprint goal:** Teacher uploads RPP documents. Waka Kurikulum reviews — approves or rejects with reason. Status lifecycle: draft → submitted → approved | rejected | archived. Notification via existing push system.

- [ ] **1.1 Design `rpp_documents` schema** — New Drizzle table: `id` (auto), `teacherId` (FK to users), `classId` (FK to classes — scope TBD with client), `subjectId` (FK to subjects), `title`, `description`, `documentId` (FK to school_documents — encrypted file), `status` enum (draft/submitted/approved/rejected/archived), `reviewedBy` (nullable FK), `reviewedAt`, `rejectionReason` (nullable text), `createdAt`, `updatedAt`, `deletedAt`. `M src/lib/db/schema/rppDocuments.ts`
- [ ] **1.2 Create RPP actions** — `uploadRpp` (teacher, creates draft), `submitRpp` (changes draft → submitted), `reviewRpp` (approve/reject waka), `getRppDocuments` (teacher sees own, waka sees all submitted), `archiveRpp`. Permission check: `documents.review_rpp` for review actions. `M src/actions/rpp.ts`
- [ ] **1.3 Build teacher upload page** — Guru page under `/academic/rpp` or submenu. Upload form: title, class, subject, file upload drag-drop, description, submit/draft button. Shows status badge per row. `M src/features/rpp/RppTeacherClient.tsx`
- [ ] **1.4 Build Waka review queue page** — List of submitted RPPs awaiting review. Each row: teacher, class, subject, title, download link, approve/reject buttons. Reject opens dialog with reason input. `M src/features/rpp/RppReviewClient.tsx`
- [ ] **1.5 Wire notification on status change** — When approved/rejected, create notification row for the teacher via existing notifications schema. `M src/actions/rpp.ts` (add notification creation)
- [ ] **1.6 Add navigation** — Sidebar links: Guru sees "RPP Saya" (guru), Waka sees "Validasi RPP" (waka). Both gated by permission/role. `M src/features/layout/sidebar.tsx`
- [ ] **1.7 Add route gates + permissions** — Add `documents.review_rpp` permission to seed. Add `/academic/rpp/*` routes to ROUTE_PERMISSIONS. `M src/lib/auth/route-permissions.ts`, `M seed.ts`
- [ ] **1.8 Verify** — Login as guru: upload RPP → draft status → submit → submitted status → visible in waka queue. Login as waka: see pending queue → approve → notification sent to guru. Login as reviewed guru: see approval status. Rejected: reason visible, re-upload allowed. Build green.

**Files touched:** 1 new schema, 1 new action file, 2 new feature components, 1 sidebar update, 1 route-permissions update, 1 seed update.

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

### Sprint 26 — Student Manual Payment Slip Upload + Validation

**Status:** pending
**Date:** 2026-06-20
**Source:** QA finding — students currently cannot submit manual payment proofs. The flow requires: student uploads a payment slip (transfer receipt), admin reviews and approves/rejects it.

**Sprint goal:** Siswa can submit a payment slip (upload image/PDF) linked to an existing payment record. Admin can view pending slips in `/finance` and approve or reject with a reason.

- [ ] **1.1 Design `payment_slips` schema** — New Drizzle table: `id`, `paymentId` (FK to `payments`), `studentId` (FK to `users`), `slipUrl` (encrypted file path), `slipFilename`, `uploadedAt`, `status` (`pending | approved | rejected`), `reviewedBy` (nullable FK to `users`), `reviewedAt` (nullable timestamp), `rejectionReason` (nullable text). `M src/lib/db/schema/payments.ts` (or new file)
- [ ] **1.2 Add `uploadPaymentSlip` action** — siswa uploads a file (image/PDF, max ~5MB). File stored/encrypted via existing `crypto.ts` pattern. Creates `payment_slips` row with `status: pending`. `M src/actions/payments.ts`
- [ ] **1.3 Add `approvePaymentSlip` and `rejectPaymentSlip` actions** — admin reviews. On approve: update `payment.status` to `paid`. On reject: update slip status + store rejection reason. `M src/actions/payments.ts`
- [ ] **1.4 Update `/finance` page for admin** — Show pending slips as a separate section or badge on the payment row. Add "Lihat Bukti" and "Setujui" / "Tolak" actions inline.
- [ ] **1.5 Update siswa `/finance` view** — Siswa can see their own pending payments. Add "Upload Bukti Bayar" button on pending payment rows. Opens a simple upload dialog (file input only).
- [ ] **1.6 Add route for serving slip files** — `/api/payments/slips/[id]` — returns decrypted slip file. Gated: siswa sees own slips only, admin sees all. `M src/app/api/payments/slips/[id]/route.ts`
- [ ] **1.7 Verify** — Login as siswa: see own pending payments, upload a slip → status becomes pending. Login as admin: see pending slips, approve → payment marked paid. Reject → rejection reason shown to siswa.

**Files touched:** New schema, `src/actions/payments.ts`, new API route, updated `FinanceClient.tsx`, new slip upload dialog component.

---

### Sprint 25 — Header Search Not Protected by Permissions

**Status:** pending
**Date:** 2026-06-20
**Source:** QA finding — the header search bar (cmdk-based, Sprint 13) shows all sidebar nav items regardless of the user's role/permissions. A siswa can open the search (⌘K) and see admin-only routes.

**Sprint goal:** Header search results are filtered to only show routes the user has permission to access.

- [ ] **1.1 Audit HeaderSearch component** — Find the cmdk-based search component. Check how nav items are populated — likely a static list that doesn't respect permissions. `M src/features/layout/HeaderSearch.tsx`
- [ ] **1.2 Filter by permissions** — On render/open, fetch user's role level from session and filter the command list accordingly. For example, if `roleLevel < 80`, hide admin-only nav items from results.
- [ ] **1.3 Verify** — Login as siswa → open search (⌘K) → only siswa-accessible routes appear. Login as admin → admin+ routes also appear.

**Files touched:** `src/features/layout/HeaderSearch.tsx`.

---

### Sprint 24 — Permissions Management Page (Not Wired)

**Status:** pending
**Date:** 2026-06-20
**Source:** QA finding — `/permissions` page exists but redirects to `/admin/users`. The page is not wired to a permissions management feature. Needs a proper permissions CRUD UI.

**Sprint goal:** `/permissions` page renders a permissions management interface. superadmin can view and manage role-permission mappings.

- [ ] **1.1 Investigate current `/permissions` page** — `src/app/(app)/permissions/page.tsx`. Check what it currently renders and why it redirects. `M src/app/(app)/permissions/page.tsx`
- [ ] **1.2 Design permissions management UI** — List roles with their permissions. Add/remove permissions per role. Uses existing `roles` and `permissions` tables. `M <new feature files>`
- [ ] **1.3 Wire server actions** — Create/extend actions for assigning/revoking permissions to roles. `M src/actions/permissions.ts`
- [ ] **1.4 Verify** — Login as superadmin → `/permissions` loads with role-permission table. Login as admin → `/permissions` returns 403.

**Files touched:** `src/app/(app)/permissions/page.tsx`, new feature component(s), new/modified action file(s).

---

### Sprint 22 — RBAC Fix: Payment Catalog + Finance Access Control

**Status:** pending
**Date:** 2026-06-20
**Source:** QA feedback — two RBAC gaps found:

1. **`/payments/catalog`** — accessible to any authenticated user with `payments.read_own` permission. Should be restricted to `superadmin` (level 100) and `admin` (level 80) only. Current page-level `canManage` guard is correct but the route itself is open.
2. **`/finance`** — route gated at level 80 (`ROLE_LEVEL_REQUIREMENTS`), so `siswa` (level 40) cannot access it at all. Should show the page for siswa too, filtered to their own payments only. Admin+ sees all + can record payments. siswa sees only their own + no record button.

**Sprint goal:** Both pages have correct role-based access. No leakage to unauthorized roles.

---

#### Task 1 — Restrict `/payments/catalog` to admin+ only

- [ ] **1.1 Add route-level gate** — Add `"/payments/catalog": 80` to `ROLE_LEVEL_REQUIREMENTS` in `src/lib/auth/route-permissions.ts`. Change `ROUTE_PERMISSIONS` entry from `payments.read_own` to `payments.manage` (since only admin manages the catalog). `M src/lib/auth/route-permissions.ts`
- [ ] **1.2 Verify sidebar nav** — "Katalog Pembayaran" nav item must be hidden for roles below level 80. Check how sidebar reads permissions — if it reads from `ROUTE_PERMISSIONS` alone, it may still show for siswa. Ensure sidebar respects `ROLE_LEVEL_REQUIREMENTS` level gates too. `M <sidebar nav>`
- [ ] **1.3 Verify** — Login as siswa (level 40): `/payments/catalog` should 403/redirect. Login as admin (level 80): page loads with full CRUD.

#### Task 2 — Allow siswa to view `/finance` (own payments only)

- [ ] **2.1 Change route-level gate** — Move `"/finance"` from level 80 to level 40 in `ROLE_LEVEL_REQUIREMENTS`. `M src/lib/auth/route-permissions.ts`
- [ ] **2.2 Refactor finance page** — Remove `verifyRoleLevel(80)`. Use `getAuthContext` to get `roleLevel`. Pass `canManage = roleLevel >= 80` prop to `FinanceClient`. For siswa (level 40), query only their own payments via `studentId = session.userId`. `M src/app/(app)/finance/page.tsx`, `M src/actions/payments.ts` (add optional `studentId` filter to `getPayments`)
- [ ] **2.3 Update `FinanceClient` props** — Add `canManage: boolean` prop. Hide `<RecordPaymentDialog>` trigger when `canManage` is false. For siswa, pre-fill student selector from session (hide it). `M src/features/finance/FinanceClient.tsx`
- [ ] **2.4 Verify** — Login as siswa: page loads, sees own payments only, no "Catat" button. Login as admin: sees all payments + record button.

#### Task 3 — Verify

- [ ] **3.1** — `bun run lint` (0 errors), `bun run typecheck` (pass), `bun run build` (green).
- [ ] **3.2** — Manual: siswa login → `/finance` accessible, own payments shown. Admin login → `/finance` all payments + record button. Siswa login → `/payments/catalog` → 403 or redirect.

---

**Files touched:** `src/lib/auth/route-permissions.ts`, `src/app/(app)/finance/page.tsx`, `src/actions/payments.ts`, `src/features/finance/FinanceClient.tsx`, sidebar nav.

---

### Sprint 23 — Audit: Radix `Select.Item` Empty String `value=""` Pattern

**Status:** pending
**Date:** 2026-06-20
**Source:** Radix UI `Select.Item` rejects `value=""` — the component uses an empty string internally to represent "cleared/placeholder" state, so an item with `value=""` causes a runtime error. Found in 2 components:
- `RecordPaymentForm.tsx` — payment item Select placeholder item → **fixed** (controlled state, sentinel `""` removed)
- `PaymentItemForm.tsx` — semester Select placeholder item → **fixed** (sentinel changed to `"__none__"`)

**Sprint goal:** Zero Radix `Select.Item` components with `value=""` in the codebase. Pattern: always use a non-empty sentinel value (`"__none__"`, `"__empty__"`, or a UUID) for placeholder/empty-state items in controlled Radix Selects.

---

- [ ] **1.1 Audit all SelectItem usages** — `grep -rn "SelectItem" src/ --include="*.tsx"`. For each, check if `value` is empty string. Fix any remaining instances.
- [ ] **1.2 Document the pattern** — Add a note in `src/components/ui/select.tsx` header comment: "Note: Select.Item value must be non-empty string. Use `__none__` as sentinel for placeholder/empty-state items in controlled Selects."
- [ ] **1.3 Verify** — `bun run typecheck` (pass). No runtime errors on any Select in the app.

---

**Files touched (estimate):** 1 comment fix. 0 new files.

---

### Sprint 19 — QA Verification + Drift Cleanup

**Status:** pending (⚠ 2 blockers)
**Date:** 2026-06-18
**Source:** QA cross-check surfaced: (1) `BETTER_AUTH_URL` env points to port 3000 but app runs on 8000. (2) `/documents` page returns 500 — migration never pushed.

**Sprint goal:** All QA scenarios pass. Lint baseline 0. Migration pushed. Auth port fixed.

---

- [ ] **1.0 Pre-flight: Fix 2 blockers** — (A) `BETTER_AUTH_URL` in `.env` → port 8000. Restart dev server. (B) `bunx drizzle-kit push` for `0003_mushy_moon_knight.sql`. `M .env`, `M drizzle/`
- [ ] **1.2 Create guru user end-to-end** — Log in as superadmin → `/admin/users` → Tambah Akun → fill form, select guru role → submit. Edit same user, change role to administrator. Try creating a superadmin (should be rejected — level 100 not in [60, 80]). `M src/actions/admin.ts`
- [ ] **1.3 Verify destructive toast color** — Trigger a destructive toast. Verify text is white on red background. Visual check via Firefox. `M src/hooks/use-toast.tsx`
- [ ] **2.1 Reconcile AGENTS.md `createUser` rule** — `auth.api.createUser` doesn't exist in this better-auth version. Staff accounts use `signUpEmail` + Drizzle update for `roleId`. Update both AGENTS.md and MEMORY.md. `M AGENTS.md`, `M MEMORY.md`
- [ ] **3.1 Add `type="button"` to logout button** — `src/features/layout/profile-dropdown.tsx:28`. 1-line fix. `M src/features/layout/profile-dropdown.tsx`
- [ ] **3.2 Fix HeaderNotifications useEffect dep** — `src/features/layout/HeaderNotifications.tsx:53`. `bunx biome check --write` auto-fixes. `M src/features/layout/HeaderNotifications.tsx`
- [ ] **4.1 Final verification** — `bun run lint` (0 errors), `bun run typecheck` (pass), `bun run build` (green).

---

**Files touched (estimate):** 3 source files + 2 docs. 0 new files.

---

### Sprint 20 — AlertDialog Migration (Next Week, Debt Cleanup)

**Status:** pending
**Date:** 2026-06-18
**Source:** Native `confirm()` calls remain in `ActionCell` (11+ features). "No native `confirm()`" goal in NFR-006/007 not fully satisfied.

**Sprint goal:** Zero `confirm()` calls. All destructive actions go through shadcn `AlertDialog`.

---

- [ ] **1.1 Replace `confirm()` in `ActionCell` with `AlertDialog`** — `src/components/ui/data-table.tsx:157-161` — useState + `<AlertDialog>` pattern. Reuse for `DocumentsAdminClient.tsx` delete button. `M src/components/ui/data-table.tsx`, `M src/features/documents/DocumentsAdminClient.tsx`
- [ ] **1.2 Grep for remaining `confirm(` calls** — `grep -rn "confirm(" src/`. Replace any stragglers. `M <found files>`
- [ ] **1.3 Verify** — `bun run lint` (0 errors), `bun run typecheck` (pass), `bun run build` (green). Manual: click "Hapus" → AlertDialog opens → confirm/cancel works.

---

**Files touched (estimate):** 1-3 source files. 0 new files.

---

### Sprint 21 — `useActionWithToast` Hook Refactor (Next Week, Quality)

**Status:** pending
**Date:** 2026-06-18
**Source:** Pattern `if (!confirm(...)) return; startTransition(async () => { ... })` duplicated across 11+ client files.

**Sprint goal:** One canonical hook. Future `confirm()` → `AlertDialog` swap is a 1-line change.

---

- [ ] **1.1 Create `src/hooks/use-action-with-toast.ts`** — Hook returns `(data) => Promise<void>`. Args: `actionPath`, `successMessage`, optional `confirmMessage`. Internally: dynamic `import`, call action, check `"error" in result`, toast accordingly. `M +src/hooks/use-action-with-toast.ts`
- [ ] **1.2 Migrate 11 client files** — ClassesClient, MajorsClient, SubjectsClient, SemestersClient, AdminUsersClient, AnnouncementsClient, PaymentMethodsClient, PaymentItemsClient, EnrollmentsClient, AssignmentsClient, ApprovalsClient. Each loses ~10 lines. `M <11 files>`
- [ ] **1.3 Verify** — `bun run lint` (0), `bun run typecheck` (pass), `bun run build` (green). Smoke test: create/edit/delete a class — toast feedback works.

---

**Files touched (estimate):** 12 source files (1 new + 11 modified). Net: ~100 fewer lines of code.

---

## Archived Goals

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
