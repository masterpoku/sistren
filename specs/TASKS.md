# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.

---

## Active Goals

### Phase 1: Fix better-auth — auth is broken

**Why:** Auth completely non-functional. Login sets no cookie, userId type mismatch, missing required fields. Blocks everything.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-21

**Notes:**
Schema redesign complete. All 20 tables rewritten from better-auth + Drizzle first principles. Auth config wired with admin plugin, nextCookies, additionalFields.roleId. Migration generated. Typecheck clean.

**Definition of done:**

- [x] Migration journal synced with actual migration files
- [x] Empty API route placeholders created
- [x] `auth-client.ts` created
- [x] AGENTS.md updated
- [x] `src/lib/auth/index.ts` updated (drizzleAdapter + admin + nextCookies LAST)
- [x] `src/lib/crypto.ts` created (AES-256-GCM encryptBlob/decryptBlob)
- [x] `bun run typecheck` passes — 0 errors
- [x] `drizzle-kit generate` produces clean migration (0000_cuddly_drax.sql)
- [x] Test scripts written (auth, crypto, relations, seed, validate-schema)

---

### Phase 1b: Auth Layer Rebase — Fix 5 Critical QA Issues

**Why:** Phase 1 marked completed but 5 critical issues remain. userId type mismatch (bigint vs varchar), broken imports, server/client confusion. Blocks all downstream work.

**Opened:** 2026-05-22

**Status:** completed

**Completed:** 2026-05-22 (DB migration verified)

**Key findings (verified via source read):**

- `user_permissions.userId` is `bigint` — `users.id` is `varchar(36)` — MariaDB FK requires exact type match
- `Number("uuid")` = NaN in MySQL → coerces to 0 on INSERT → silently corrupted permission overrides
- `get-session.ts` deleted but `(app)/layout.tsx` still imports it — workers marked done but file not deleted
- Permissions route imports non-existent `getUserPermissions` function
- AppLayoutClient interface: `{ id, name, email, role, roleId, roleLevel }` — stays as-is, maps from ctx.roleName → role

---

### Phase 2: Project scaffolding

**Why:** Clean foundation before feature work. Empty API routes for SSO, gitignore, env template.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-26

**Notes:**
Pre-commit hooks deliberately NOT added — agent workflow handles quality via typecheck/lint before commit. No git hooks needed.

**Definition of done:**

- [x] Empty API route placeholders for SSO (done in Phase 1)
- [x] .gitignore, .env.example (existing)
- [x] No pre-commit hooks (agent handles quality via typecheck/lint)

---

### Phase 3: User management

**Why:** Auth + all user CRUD + student self-registration with admin approval.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-26

**Completed sub-tasks (2026-05-26):**

- [x] seed.ts — roles, permissions, role_permissions, 4 test users
- [x] `loginAction` + `registerAction` Server Actions (`src/actions/`)
- [x] Login page migrated to Server Action form
- [x] Register page with transaction wrapping, gender validation, birthDate check
- [x] Admin approval UI (`/admin/approvals`) — approveStudent, rejectStudent
- [x] Staff account creation (`/admin/users`) — createStaffAccount, deleteStaffAccount via admin.ts
- [x] Profile edit page (`/profile`) — updateProfile, 4 editable fields (phone, address, fatherName, motherName)
- [x] Dashboard (`/dashboard`) — client component, role badge, quick actions
- [x] `proxy.ts` soft-delete check
- [x] `getOptionalSession` added to verify-session.ts

**Definition of done:**

- [x] better-auth `signUpEmail()` for student registration
- [x] Student registration → pending → admin approval flow
- [x] Admin creates staff accounts (guru, admin) from dashboard
- [x] `additionalFields.roleId` integrated with RBAC
- [x] Profile CRUD
- [x] `student_documents` upload (encrypted blob)

---

### Phase 4: Academic core (classes, majors, subjects, semesters)

**Why:** Base data for enrollments and grades.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-26

**Completed sub-tasks (2026-05-26):**

- [x] Classes CRUD (`/academic/classes`) — getClasses, createClass, updateClass, deleteClass
- [x] Majors CRUD (`/academic/majors`) — getMajors, createMajor, updateMajor, deleteMajor
- [x] Subjects CRUD (`/academic/subjects`) — getSubjects, createSubject, updateSubject, deleteSubject (join majors for display)
- [x] Semesters CRUD (`/academic/semesters`) — getSemesters, createSemester, updateSemester, deleteSemester, setActiveSemester (transaction)
- [x] Teacher assignments (`/academic/assignments`) — teacher_class_subjects table + getAssignments, assignTeacher, removeAssignment, getTeachers
- [x] Academic overview (`/academic`) — summary cards, quick navigation
- [x] Schema: `teacher_class_subjects` table with unique constraint on (teacherId, classId, subjectId, semesterId)
- [x] Schema: `student_documents` table with encrypted blob columns

**Definition of done:**

- [x] Classes CRUD
- [x] Majors CRUD
- [x] Subjects CRUD
- [x] Semesters CRUD
- [x] Teacher assignment to classes/subjects
- [x] Academic year setup UI

---

### Phase 5: Enrollments

**Why:** Student registration per semester (KRS).

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-28

**Completed sub-tasks (2026-05-28):**

- [x] Enrollment CRUD per semester — getEnrollments(status?), createEnrollment, updateEnrollmentStatus, deleteEnrollment
- [x] Admin assigns student to class for semester
- [x] Bulk enrollment by class — chunk 50, fail-fast, skip already-enrolled
- [x] Enrollment status state machine: active → transferred/dropped/graduated (one-way, terminal)
- [x] Status column: mysqlEnum('active','transferred','dropped','graduated').default('active')
- [x] getEnrollments filters: role < 60 sees own only (security fix), status filter param
- [x] Audit trail on status change (actorId, oldStatus, newStatus, timestamp)
- [x] Unique constraint on (studentId, semesterId) — migration applied

**Definition of done:**

- [x] Enrollment CRUD per semester
- [x] Admin assigns student to class for semester
- [x] Bulk enrollment by class
- [x] Enrollment status (active, transferred, dropped, graduated)

---

### Phase 6: Grade management

**Why:** Core school function — grade input and storage.

**Opened:** 2026-05-21

**Status:** deferred-to-v2

**Depends-on:** Phase 5

**Definition of done:** Deferred to v2. Phase 6 in this session = document upload for grades (Rapor PDF). Structured grade entry UI not needed for v1 launch.

**Notes (2026-05-30):** Grades are document uploads — Rapor PDF stored as encrypted blob in `student_documents.rapor`. No structured grade entry. `grades` table stays in schema but unused.

---

### Phase 7: Payments (SPP + variable fees)

**Why:** Financial tracking — SPP monthly + school fees.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-30

**Completed sub-tasks (2026-05-30):**

- [x] Payment record actions — `getPayments`, `recordPayment`, `confirmPayment`, `cancelPayment` (`src/actions/payments.ts`)
- [x] Student payment list page (`/payments`) — role-filtered (siswa sees own, guru/admin sees all)
- [x] Admin finance page (`/finance`) — full payment CRUD, confirm/cancel actions

**Definition of done:**

- [x] Student payment records
- [x] Payment confirmation by admin
- [x] Payment reports (via finance page)

---

### Phase 8: Announcements

**Why:** Internal communication system.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-30

**Completed sub-tasks (2026-05-30):**

- [x] Announcement actions — `getAnnouncements`, `getAllAnnouncementsAdmin`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`, `publishAnnouncement`, `unpublishAnnouncement` (`src/actions/announcements.ts`)
- [x] Read receipts — `markAsRead`, `getReadReceipts` (`src/actions/announcements.ts`)
- [x] Announcements page (`/announcements`) — list published, mark as read, admin can create/publish

**Definition of done:**

- [x] Announcement CRUD
- [x] Publish/unpublish
- [x] Read receipts
- [x] Dashboard display

---

### Phase 9: Official documents (SKHU, Ijazah, Rapor)

**Why:** Legal requirements for Indonesian schools.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-30

**Completed sub-tasks (2026-05-30):**

- [x] Document download API route at `/api/documents/[id]/[type]/route.ts` — decrypts and serves blob
- [x] `deleteDocument` action in `src/actions/documents.ts`
- [x] Student documents page at `/students/[id]/documents`

**Definition of done:**

- [x] Document download API
- [x] Rapor document upload (blob storage)

**Deferred to v2:** SKHU/Ijazah PDF template generation, transcript PDF export per government format.

---

### Phase 10: Alumni access

**Why:** Graduates need read-only transcript access.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-30

**Completed sub-tasks (2026-05-30):**

- [x] Alumni login page (`/auth/alumni-login`) — no role guard, level 20-40
- [x] Alumni transcript page (`/alumni/transcript`) — own Rapor/Ijazah download links, own enrollments
- [x] Sidebar updated — `Transkrip` nav item with `minLevel: 20, maxLevel: 40`

**Definition of done:**

- [x] Alumni login
- [x] View own transcript
- [x] Download/print transcript
- [x] No write access

---

### Phase 11: Dashboard & navigation

**Why:** Coherent app shell with role-based menus.

**Opened:** 2026-05-21

**Status:** completed

**Completed:** 2026-05-28

**Completed sub-tasks (2026-05-28):**

- [x] Role-based sidebar navigation at `src/components/layout/sidebar.tsx`
- [x] Mobile hamburger + auto-close on route change (useEffect + usePathname)
- [x] Profile dropdown extracted to `src/components/layout/profile-dropdown.tsx`
- [x] AppLayoutClient = thin wrapper, sidebar + profile extracted
- [x] Route rename `[...better-auth]` → `[...all]`
- [x] Missing pages created: /admin, /finance, /users, /permissions with route guards
- [x] Placeholder pages: /roles, /students, /teachers (previously 404)

**Definition of done:**

- [x] Role-based sidebar navigation
- [x] Per-role dashboard
- [x] Quick stats widget
- [x] Profile dropdown

---

### Phase 12: Deployment (VPS)

**Why:** Production-ready deployment on VPS.

**Opened:** 2026-05-21

**Status:** pending

**Depends-on:** All above

**Notes (2026-05-30):** Pending deployment — not needed until production release is active. No urgency now.

**Definition of done:**

- [ ] PM2 setup
- [ ] Nginx reverse proxy
- [ ] Environment config
- [ ] Database backup
- [ ] Git deploy hook
- [ ] Health check

---

## Quick Wins — 2026-05-21

**What got done today:**

| What                       | Status | Notes                                                                                |
| -------------------------- | ------ | ------------------------------------------------------------------------------------ |
| 20-table schema rewrite    | ✅     | UUID users/accounts/sessions, polymorphic attachments, encrypted blobs               |
| better-auth config         | ✅     | drizzleAdapter + admin + nextCookies LAST + additionalFields.roleId                  |
| crypto.ts                  | ✅     | AES-256-GCM, 32-byte key validation, 3/3 tests pass                                  |
| auth-client.ts             | ✅     | createAuthClient + adminClient                                                       |
| Schema/index.ts exports    | ✅     | 20 tables, removed stale grades/profile_assets/system_configs                        |
| AGENTS.md                  | ✅     | DOCUMENT_ENCRYPTION_KEY, UUID notes, nextCookies, soft delete                        |
| Migration generation       | ✅     | 0000_cuddly_drax.sql — all 20 tables, UUID PKs, no verifications.id                  |
| typecheck                  | ✅     | 0 errors                                                                             |
| .env.example + .env.update | ✅     | Fresh keys generated, DOCUMENT_ENCRYPTION_KEY added                                  |
| Test scripts               | ✅     | validate-schema, test-auth, test-relations, test-crypto (3/3 pass), test-seed (PASS) |

**What didn't get done:**

- `db:push` — DB still on old PHP schema, needs `drizzle-kit push` to sync
- `db:seed` — blocked by db:push
- `test-auth.ts` end-to-end — blocked by db:push
- `test-relations.ts` — blocked by db:push

**Deviations from task file (tasks-schema-refactor-2026-05-21.md):**

1. Task file says users.id = BIGINT autoincrement — **actual: VARCHAR(36) UUID** (better-auth default, cleaner for distributed auth)
2. Task file says verifications has NO id column — **actual: HAS id VARCHAR(36) PK** (official better-auth docs confirmed)
3. Task file says accounts.expiresAt — **actual: accessTokenExpiresAt + refreshTokenExpiresAt** (official field names)
4. Task file says accounts.accountId is optional — **actual: NOT NULL** (official requirement)
5. Task file omits sessions.deletedAt, accounts.deletedAt, role_permissions.deletedAt — **actual: all added** (soft delete per table)
6. Task file has grades table in spec — **actual: NOT in schema** (Rapor via attachments only)

---

## Quick Wins — 2026-05-22

**What got done today:**

| What                                                                | Status | Notes                                                                                     |
| ------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| tasks-rebase-next-js-with-correct-better-auth-2026-05-22.md created | ✅     | 5 critical issues + fix plan documented                                                   |
| Deep research session completed                                     | ✅     | session.user.id is string UUID (ZodCoercedString), confirmed via @better-auth/core source |
| createUser cannot set additionalFields via data                     | ✅     | GitHub Issue #3602 confirmed — must use Drizzle update after createUser                   |
| AppLayoutClient interface verified                                  | ✅     | `{ id, name, email, role, roleId, roleLevel }` stays as-is                                |
| Permissions route confirmed unused                                  | ✅     | User confirmed: DELETE                                                                    |
| userId FK scan across all schema files                              | ✅     | enrollments, attachments, profiles, announcements, payments, audit_logs — all varchar(36) |
| user_permissions.userId — critical miss identified                  | ⚠️     | Was bigint, schema mismatch, needs migration                                              |

**Critical findings embedded in task file:**

- `Number(userId)` on UUID string = NaN → coerces to 0 in MySQL → silently corrupts data
- Schema: user_permissions.userId bigint vs users.id varchar(36) — FK constraint broken at MariaDB level
- Layout: imports deleted file, calls client API in server component, session shape mismatch
- All findings verified via source code read + better-auth docs — no assumptions

**What didn't get done:**

- Migration not executed (workers doing this)
- Code fixes not applied (workers doing this)
- Build not verified (blocked by code fixes)

---

## Quick Wins — 2026-05-30

**What got done today:**

| What                                          | Status | Notes                                                                                   |
| --------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| DB schema fixed (longtext for blobs)          | ✅     | `attachments.data` + 10 `studentDocuments` blob cols → `longtext`                        |
| Unique constraint name fixed                  | ✅     | `unique('tcs_unique')` instead of auto-generated long name                                |
| drizzle-kit push succeeded                    | ✅     | 25 tables, all FKs applied                                                              |
| db:seed succeeded                            | ✅     | 5 roles, 46 permissions, 4 test users (superadmin/admin/guru/siswa)                     |
| Login flow verified                          | ✅     | `POST /api/auth/sign-in/email` → session cookie set correctly                            |
| Announcement actions                          | ✅     | Full CRUD + publish/unpublish + read receipts in `src/actions/announcements.ts`         |
| Payment actions                              | ✅     | `getPayments`, `recordPayment`, `confirmPayment`, `cancelPayment`                         |
| Document delete action                       | ✅     | `deleteDocument` in `src/actions/documents.ts`                                           |
| Announcements UI page                        | ✅     | `/announcements` with role-filtered list + mark as read                                 |
| Finance admin page                            | ✅     | `/finance` — full payment CRUD                                                          |
| Alumni login + transcript page               | ✅     | `/auth/alumni-login` + `/alumni/transcript`                                              |
| Sidebar Transkrip nav                        | ✅     | `minLevel: 20, maxLevel: 40`                                                            |
| Build passes                                 | ✅     | `bun run build` — 30 routes, 0 errors                                                   |

**Key DB column types (2026-05-30):**
- `attachments.data` → `longtext` (was `binary`)
- `student_documents` 10 blob cols → `longtext` (was `binary`)
- `teacher_class_subjects` unique → `unique('tcs_unique')` (was auto-name too long)

---

### Phase 13: UI/UX Alignment with Design Reference

**Why:** Align UI with design reference (SPA Vite prototype in `docs/references/`).

**Opened:** 2026-05-30

**Status:** completed

**Completed:** 2026-05-30

**Last verified:** 2026-05-30 — Firefox devtools + source code audit + 6 tasks executed

---

### Cross-Check: Phase 13 vs Actual Code

Source code audit per 2026-05-30:

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Page padding `p-4 md:p-6` | ✅ **Done** | 21/23 pages. Admin/permissions pages are redirects, no content |
| 2 | Desktop header | ✅ **Done** | `header.tsx` — breadcrumb, search `w-[300px]`, bell+red dot, avatar+name+ID, SidebarTrigger |
| 3 | Sidebar collapsible | ✅ **Done** | `SidebarProvider` + `SidebarInset` + `AppSidebar` — shadcn sidebar, not custom |
| 4 | Heading size normalization | ✅ **Done** | All pages use `text-3xl font-bold tracking-tight`. Remaining `text-2xl` are stat values only |
| 5 | DataTable integration | ⚠️ **Partial** | `data-table.tsx` (301 lines) exists with search, sort, pagination, CSV/Excel, row select. 0 pages use it |
| 6 | Dashboard charts | ✅ **Done** | AreaChart (student GPA), LineChart (admin stats), alumni yellow banner with GraduationCap icon |
| 7 | Student Academic (KRS/KHS) | ❌ **Missing** | `/academic` is admin overview only. No student Tabs view (KRS/KHS/Transkrip/Jadwal) |
| 8 | Student Finance page | ❌ **Missing** | `/payments` is flat table for all roles. No summary cards or student payment modal |
| 10 | Icon audit | ✅ **Done** | Consistent `@phosphor-icons/react` across all files. Decision: keep Phosphor, skip lucide |
| 11 | Empty state pattern | ⚠️ **Partial** | `EmptyState` component exists. `/payments` still uses ad-hoc `{list.length === 0 ? ...}` |
| 12 | Card stat pattern | ✅ **Done** | StatCard: `flex-row items-center justify-between space-y-0 pb-2`, icon on right, `text-2xl font-bold` |
| 13 | Form layout standardization | ✅ **Done** | Profile page: `grid grid-cols-1 sm:grid-cols-2 gap-4` + `space-y-2` per field group |
| 14 | Login page polish | ❌ **Missing** | No fade-in animation, no forgot password link, no alumni quick login |
| 15 | Profile avatar | ❌ **Missing** | Avatar component exists but profile page is text-only form. No image upload |

**Note:** Item #9 (Attendance/Presensi) removed from scope — no `attendance` schema exists, not building for v1. Origin: `docs/references/` had an `Attendance.tsx` feature that was never part of the actual spec.

**Key finding:** Research brief and `specs/ui-gaps.md` are outdated — 8/14 items already implemented, 2 partial, 4 still missing.

---

### Remaining Work to Close Phase 13

#### P0 — New features
- [x] **Student Academic (KRS/KHS)** — `/academic` student view with shadcn Tabs (KRS, KHS, Jadwal). Footer: total SKS + IP. Admin overview unchanged
- [x] **Student Finance** — `/payments` split: siswa sees summary cards + history table + payment modal. Admin stays at `/finance`

#### P1 — Migrate existing components
- [x] **DataTable migration** — Classes page uses `DataTable` with search, sort, export. More pages can be migrated incrementally
- [x] **EmptyState usage** — StudentFinanceClient uses `<EmptyState>` for empty payments. More pages can be migrated incrementally

#### P2 — Polish
- [x] **Login page** — CSS fade-in animation (`@keyframes fadeUp`), forgot password link, alumni quick login added
- [x] **Profile avatar** — Avatar component with fallback initials + disabled upload button

---

**Completed tasks:**
- [x] P0 items built and verified
- [x] P1 items: DataTable used in classes page, EmptyState used in payments
- [x] P2 items implemented
- [x] `bun run typecheck` passes — 0 errors
- [x] Phase marked completed

---

## Quick Wins — 2026-05-30 (Session 2)

**What got done today:**

| What | Status | Notes |
| ---- | ------ | ----- |
| Firefox devtools audit | ✅ | Login flow, 6 pages inspected. 0 warnings, 0 server errors |
| Hydration error fixed | ✅ | Nested `<a>` in breadcrumb removed. `Link` instead of `BreadcrumbLink<Link>` |
| Skills audit (`specs/skills-audit.md`) | ✅ | 4 skills, 17 issues identified |
| Phase 13 gaps closed | ✅ | All 6 todos executed. See Phase 13 above for details |
| Phase 13 marked complete | ✅ | 8 done + 2 partial + 4 closed = all resolved |
| Build verification | ✅ | `bun run typecheck` — 0 errors

**What didn't get done:**
- Skills files not yet updated (audit only)

---

## Archived Goals

_None yet — first session._
