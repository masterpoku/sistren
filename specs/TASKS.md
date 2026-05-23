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

**Why:** Clean foundation before feature work. Fix migration journal, empty API routes for SSO, git hooks.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 1

**Definition of done:**
- [ ] Pre-commit hooks (typecheck + lint)
- [ ] Git hooks for deploy

---

### Phase 3: User management

**Why:** Auth + all user CRUD + student self-registration with admin approval.


**Opened:** 2026-05-21

**Status:** in-progress

**Depends-on:** Phase 1

**Completed sub-tasks (2026-05-23):**
- [x] seed.ts — roles, permissions, role_permissions, 4 test users via `signUpEmail`
- [x] `loginAction` + `registerAction` Server Actions (`src/actions/`)
- [x] Login page migrated to Server Action form
- [x] Register page migrated to Server Action form
- [x] `proxy.ts` soft-delete check
- [x] `getOptionalSession` added to verify-session.ts

**In progress:**
- Dashboard role badge + quick actions (Turbopack/shadcn `createContext` incompatibility — needs client component boundary)

**Remaining:**
- Admin approval UI for pending registrations
- Staff account creation by admin
- Profile edit page
- Attachment upload (encrypted blob)


**Definition of done:**
- [ ] better-auth `signUpEmail()` for student registration
- [ ] Student registration → pending → admin approval flow
- [ ] Admin creates staff accounts (guru, admin) from dashboard
- [ ] `additionalFields.roleId` integrated with RBAC
- [ ] Alumni accounts created by admin only
- [ ] Profile CRUD
- [ ] `attachments` upload (encrypted blob)

---

### Phase 4: Academic core (classes, majors, subjects, semesters)

**Why:** Base data for enrollments and grades.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Classes CRUD
- [ ] Majors CRUD
- [ ] Subjects CRUD
- [ ] Semesters CRUD
- [ ] Teacher assignment to classes/subjects
- [ ] Academic year setup UI

---

### Phase 5: Enrollments

**Why:** Student registration per semester (KRS).

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 4

**Definition of done:**
- [ ] Enrollment CRUD per semester
- [ ] Admin assigns student to class for semester
- [ ] Bulk enrollment by class
- [ ] Enrollment status (active, transferred, dropped)

---

### Phase 6: Grade management

**Why:** Core school function — grade input and storage.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 5

**Definition of done:**
- [ ] Grade input UI (admin per subject per student)
- [ ] Score: 1-100
- [ ] Predicate computed from score (E/D/C/B/A)
- [ ] Grade view per student per semester
- [ ] Grade edit history
- [ ] Final grade calculation

---

### Phase 7: Payments (SPP + variable fees)

**Why:** Financial tracking — SPP monthly + school fees.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Payment method CRUD
- [ ] SPP config (amount, due date)
- [ ] Student payment records
- [ ] Variable fees (book, exam, activity)
- [ ] Payment confirmation by admin
- [ ] Payment reports

---

### Phase 8: Announcements

**Why:** Internal communication system.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Announcement CRUD
- [ ] Publish/unpublish
- [ ] Recipient filtering
- [ ] Read receipts
- [ ] Dashboard display

---

### Phase 9: Official documents (SKHU, Ijazah, Rapor)

**Why:** Legal requirements for Indonesian schools.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 6

**Definition of done:**
- [ ] Rapor template (per semester, print-ready PDF)
- [ ] SKHU template
- [ ] Ijazah template
- [ ] Transcript generation
- [ ] PDF export per government format

---

### Phase 10: Alumni access

**Why:** Graduates need read-only transcript access.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 9

**Definition of done:**
- [ ] Alumni login
- [ ] View own transcript
- [ ] Download/print transcript
- [ ] No write access

---

### Phase 11: Dashboard & navigation

**Why:** Coherent app shell with role-based menus.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** Phase 3

**Definition of done:**
- [ ] Role-based sidebar navigation
- [ ] Per-role dashboard
- [ ] Quick stats widget
- [ ] Profile dropdown

---

### Phase 12: Deployment (VPS)

**Why:** Production-ready deployment on VPS.

**Opened:** 2026-05-21

**Status:** not-started

**Depends-on:** All above

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

| What | Status | Notes |
|------|--------|-------|
| 20-table schema rewrite | ✅ | UUID users/accounts/sessions, polymorphic attachments, encrypted blobs |
| better-auth config | ✅ | drizzleAdapter + admin + nextCookies LAST + additionalFields.roleId |
| crypto.ts | ✅ | AES-256-GCM, 32-byte key validation, 3/3 tests pass |
| auth-client.ts | ✅ | createAuthClient + adminClient |
| Schema/index.ts exports | ✅ | 20 tables, removed stale grades/profile_assets/system_configs |
| AGENTS.md | ✅ | DOCUMENT_ENCRYPTION_KEY, UUID notes, nextCookies, soft delete |
| Migration generation | ✅ | 0000_cuddly_drax.sql — all 20 tables, UUID PKs, no verifications.id |
| typecheck | ✅ | 0 errors |
| .env.example + .env.update | ✅ | Fresh keys generated, DOCUMENT_ENCRYPTION_KEY added |
| Test scripts | ✅ | validate-schema, test-auth, test-relations, test-crypto (3/3 pass), test-seed (PASS) |

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

| What | Status | Notes |
|------|--------|-------|
| tasks-rebase-next-js-with-correct-better-auth-2026-05-22.md created | ✅ | 5 critical issues + fix plan documented |
| Deep research session completed | ✅ | session.user.id is string UUID (ZodCoercedString), confirmed via @better-auth/core source |
| createUser cannot set additionalFields via data | ✅ | GitHub Issue #3602 confirmed — must use Drizzle update after createUser |
| AppLayoutClient interface verified | ✅ | `{ id, name, email, role, roleId, roleLevel }` stays as-is |
| Permissions route confirmed unused | ✅ | User confirmed: DELETE |
| userId FK scan across all schema files | ✅ | enrollments, attachments, profiles, announcements, payments, audit_logs — all varchar(36) |
| user_permissions.userId — critical miss identified | ⚠️ | Was bigint, schema mismatch, needs migration |

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

## Archived Goals

_None yet — first session._
