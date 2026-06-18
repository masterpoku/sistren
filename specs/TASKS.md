# Sistren — TASKS

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section. Keep only the 5 most recent entries.
> Last updated: 2026-06-18 — Sprints 16/17/18 executed and completed. Sprints 19/20/21 added for tomorrow's follow-ups (QA verification, drift fixes, debt cleanup).
## Active Goals

### Sprint 19 — QA Verification + Drift Cleanup (Tomorrow)

**Status:** pending
**Date:** 2026-06-18
**Source:** End-of-sprint code review and Firefox QA for Sprints 16/17/18 surfaced 5 follow-up issues. Plus 2 pre-existing lint errors to clean up.

**Sprint goal:** All 3 QA scenarios pass against the running app. AGENTS.md and MEMORY.md are reconciled. Lint baseline returns to 0.

---

#### Phase 1 — Manual QA verification (3 tasks)

- [ ] **1.1 Verify `/documents` page after migration push** — Run `bunx drizzle-kit push` for `drizzle/migrations/0003_mushy_moon_knight.sql`, then load `/documents` in Firefox. Upload a PDF, see it in the table, download it back, soft-delete it. Verify file is encrypted at rest (`SELECT encryptedData FROM school_documents LIMIT 1` returns base64). Sidebar "Dokumen" should hide for guru/siswa/alumni. `M drizzle/`
- [ ] **1.2 Create guru user end-to-end** — Log in as superadmin → `/admin/users` → Tambah Akun → fill name/email/password, select guru role → submit (Sprint 17.1.1/1.2 fix). Edit same user, change role to administrator. Try creating a superadmin user (should be rejected — level 100 not in [60, 80]). `M src/actions/admin.ts`
- [ ] **1.3 Verify destructive toast color** — Trigger a destructive toast (wrong password at /login, or invalid form submission). Verify description text is white (`text-destructive-foreground`) on the red background, not dark gray. Visual check via Firefox screenshot. `M src/hooks/use-toast.tsx`

#### Phase 2 — Doc drift fixes (1 task)

- [ ] **2.1 Reconcile AGENTS.md `createUser` rule** — AGENTS.md says "Staff accounts: `auth.api.createUser()` only. Not signUpEmail". This is wrong: `createUser` doesn't exist in this better-auth version (typecheck proves it). MEMORY.md fact "signUpEmail() for student self-registration only — not staff" is also wrong. Update both files to reflect: staff accounts use `signUpEmail` + Drizzle update for `roleId`. Remove the aspirational `createUser` reference. `M AGENTS.md`, `M MEMORY.md`

#### Phase 3 — Pre-existing lint cleanup (2 tasks)

- [ ] **3.1 Add `type="button"` to logout button** — `src/features/layout/profile-dropdown.tsx:28` — `<button onClick={onLogout}>` is missing `type="button"`. Defaults to type="submit" — could cause issues if ever placed in a form. 1-line fix. `M src/features/layout/profile-dropdown.tsx`
- [ ] **3.2 Fix HeaderNotifications useEffect dep** — `src/features/layout/HeaderNotifications.tsx:53` — useEffect missing `refresh` dependency. `bunx biome check --write` auto-fixes. `M src/features/layout/HeaderNotifications.tsx`

#### Phase 4 — Verify (1 task)

- [ ] **4.1 Final verification** — `bun run lint` (target: 0 errors), `bun run typecheck` (pass), `bun run build` (green). Run all 3 Phase 1 manual QA scenarios against the running app.

---

**Files touched (estimate):** 3 source files + 2 docs. 0 new files.

---

### Sprint 20 — AlertDialog Migration (Next Week, Debt Cleanup)

**Status:** pending
**Date:** 2026-06-18
**Source:** All Sprint 16-18 work is done but native `confirm()` calls remain. `ActionCell` (used by 11+ features) still calls `confirm()` internally. The "no native `confirm()`" goal in NFR-006/007 is not fully satisfied.

**Sprint goal:** Zero `confirm()` calls in the app. All destructive actions go through shadcn `AlertDialog`.

---

- [ ] **1.1 Replace `confirm()` in `ActionCell` with `AlertDialog`** — `src/components/ui/data-table.tsx:157-161` — useState for open state, `<AlertDialog>` triggered by trash button, call onDelete on confirm. Pattern: shadcn's standard `<AlertDialog><AlertDialogTrigger asChild><Button>...</Button></AlertDialogTrigger><AlertDialogContent>...</AlertDialogContent></AlertDialog>`. Reuse for the inline `confirm()` in `DocumentsAdminClient.tsx` delete button. `M src/components/ui/data-table.tsx`, `M src/features/documents/DocumentsAdminClient.tsx`
- [ ] **1.2 Grep for remaining `confirm(` calls** — `grep -rn "confirm(" src/` — replace any stragglers (e.g., the "Hapus konfigurasi" in SystemConfigsClient is now handled by ActionCell). `M <found files>`
- [ ] **1.3 Verify** — `bun run lint` (0 errors), `bun run typecheck` (pass), `bun run build` (green). Manual: click "Hapus" in any feature → AlertDialog opens → confirm deletes, cancel closes. `M `

---

**Files touched (estimate):** 1-3 source files. 0 new files.

---

### Sprint 21 — `useActionWithToast` Hook Refactor (Next Week, Quality)

**Status:** pending
**Date:** 2026-06-18
**Source:** The pattern `if (!confirm(...)) return; startTransition(async () => { const { action } = await import(...); const result = await action(...); if ("error" in result) toast({ variant: "destructive", description: result.error }); else toast({ description: "..." }); });` is duplicated across 11+ client files.

**Sprint goal:** One canonical hook. Future `confirm()` → `AlertDialog` swap is a 1-line change.

---

- [ ] **1.1 Create `src/hooks/use-action-with-toast.ts`** — Hook returns `(data) => Promise<void>`. Args: `actionPath: string` (e.g., `"@/actions/payments"`), `successMessage: string`, optional `confirmMessage: string`. Internally: dynamic `import(actionPath)`, call default action export, check `"error" in result`, toast accordingly. Optional `confirmMessage` triggers an inline `AlertDialog` (uses the new one from Sprint 20). `M +src/hooks/use-action-with-toast.ts`
- [ ] **1.2 Migrate 11 client files to use the hook** — ClassesClient, MajorsClient, SubjectsClient, SemestersClient, AdminUsersClient, AnnouncementsClient, PaymentMethodsClient, PaymentItemsClient, EnrollmentsClient, AssignmentsClient, ApprovalsClient. Each loses ~10 lines of duplicated boilerplate. `M <11 files>`
- [ ] **1.3 Verify** — `bun run lint` (0 errors), `bun run typecheck` (pass), `bun run build` (green). Smoke test: create/edit/delete a class — toast feedback works. `M `

---

**Files touched (estimate):** 12 source files (1 new + 11 modified). Net: ~100 fewer lines of code.

---

## Archived Goals

### Sprint 18 — Documents Management Module (Admin)

**Status:** completed
**Date:** 2026-06-18
**Summary:** New `school_documents` Drizzle schema with AES-256-GCM encryption. Server actions (`uploadSchoolDocument`, `getSchoolDocuments`, `deleteSchoolDocument`, `getSchoolDocumentForDownload`) with RBAC + revalidatePath. Zod validation in `src/lib/validation/schemas/schoolDocuments.ts`. Download API at `/api/documents/school/[id]`. New `/documents` page with DataTable + drag-drop upload dialog. Sidebar "Dokumen" nav item with `minLevel: 80`. Migration `0003_mushy_moon_knight.sql` generated. Build green at 42 routes.
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
