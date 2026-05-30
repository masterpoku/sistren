# Fix & Enhancement — Critical Code Hygiene

> Found via full manual code review (`surti-gerobak`, 2026-05-30).
> All 100+ source files read and analyzed.
>
> Every task has: severity, root cause, verification condition.
> Execute in priority order (P0 → P3).

---

## P0 — Broken Flows (User Facing)

### P0-1: Student registration → login loop

**Root cause:** `register.ts` creates user via `signUpEmail` but **never sets roleId**. `approveStudent()` only sets `emailVerified: true`, also **never sets roleId**. Therefore `getAuthContext()` returns `null` (because `user.roleId === null` at `permissions.ts` lines 38-40).

**Scope:**
- `src/actions/admin.ts` — `approveStudent()` must also set `roleId: 40`
- Alternatively: `register.ts` sets roleId via Drizzle update inside the transaction

**Verification:** New student registers → admin approves → student logs in to dashboard (not `/unauthorized`).

---

### P0-2: `bulkCreateEnrollment` enrolls ALL students into the selected class

**Root cause:** Query in `enrollments.ts` doesn't filter by `classId`:
```
const studentsInClass = await db.select(...)
  .where(and(eq(roles.level, 40), isNull(users.deletedAt)))
```
This fetches **every** level-40 student (X, XI, XII combined) — not students actually in that class.

**Fix:** Filter by `majorId` from `profiles`, or add student selection per class.

**Verification:** Bulk enrollment "Kelas X" → only X-level students get enrolled.

---

## P1 — Error Types & Validation (Systematic Gap)

### P1-0: No shared error/result type — ad-hoc in every action

**Current state:** Every action defines its return type inline:

```ts
// Pattern A: inline union
async function createClass(formData: FormData): Promise<{ error: string } | { success: boolean }>

// Pattern B: no return type (void wrappers)
async function createClassAction(formData: FormData) { await createClass(formData); }

// Pattern C: mixed — throws vs returns
async function verifySession(): Promise<{userId: string}> { if (!session) redirect('/login'); }

// Pattern D: returns bare Response
async function downloadDocument(): Promise<{ error: string } | Response>
```

~50 `return { error: '...' }` spread across 10 action files — all string literals, no reusable error codes, no typed payloads.

**Also: zero validation library.** Form validation is manual string checks:
```ts
if (!name?.trim() || !classId) {
  return { error: 'Nama dan kelas wajib diisi.' };
}
```

No zod, no valibot, no yup — nothing.

**Scope:**

1. **Add zod** — `bun add zod`:
   - Form validation schemas in `src/lib/validations/` — one file per domain
   - Parse + validate before any DB query
   - Reusable error messages (Indonesian, user-facing)

2. **Create shared type** — `src/lib/actions.ts`:
   ```ts
   import { z } from 'zod';

   export type ActionResult<T = void> =
     | { success: true; data?: T }
     | { success: false; error: string; code?: ErrorCode };

   export const ErrorCode = {
     VALIDATION: 'VALIDATION_ERROR',
     NOT_FOUND: 'NOT_FOUND',
     DUPLICATE: 'DUPLICATE',
     FORBIDDEN: 'FORBIDDEN',
     UNAUTHORIZED: 'UNAUTHORIZED',
     INTERNAL: 'INTERNAL_ERROR',
   } as const;
   export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
   ```

3. **Refactor all 10 action files** — replace inline `{ error } | { success }` with `ActionResult<T>`:
   - `src/actions/academic.ts` (20+ return points)
   - `src/actions/admin.ts` (10+ return points)
   - `src/actions/announcements.ts`
   - `src/actions/enrollments.ts`
   - `src/actions/payments.ts`
   - `src/actions/paymentItems.ts`
   - `src/actions/documents.ts` (fix the Response-return pattern)
   - `src/actions/profile.ts`
   - `src/actions/register.ts`
   - `src/actions/auth.ts`

4. **Fix client-side error handling** — replace every `throw new Error(result.error)` with:
   ```tsx
   const result = await action(formData);
   if (!result.success) {
     toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
   }
   ```

**Verification:**
- `ActionResult<T>` used uniformly across all actions (not inline unions)
- `result.success` is the discriminator, not `'error' in result`
- No `throw new Error(result.error)` in any page/client component
- Zod schemas validate before any DB write
- `bun run build` passes

---

## P1 — Dead Code & Unused Components

### P1-1: 10 Sheet/Dialog components — never imported by any page

**Dead components (archive or delete):**

| File | Lines | Status |
|---|---|---|
| `src/components/academic/ClassSheet.tsx` | ~120 | Never imported |
| `src/components/academic/MajorSheet.tsx` | ~115 | Never imported |
| `src/components/academic/SubjectSheet.tsx` | ~200 | Never imported |
| `src/components/academic/SemesterSheet.tsx` | ~170 | Never imported |
| `src/components/enrollments/EnrollmentSheet.tsx` | ~150 | Never imported |
| `src/components/grades/GradeSheet.tsx` | ~200 | Never imported |
| `src/components/announcements/AnnouncementSheet.tsx` | ~190 | Never imported |
| `src/components/finance/PaymentForm.tsx` | ~130 | Never imported |
| `src/components/students/StudentForm.tsx` | ~200 | Never imported |
| `src/components/teachers/TeacherForm.tsx` | ~180 | Never imported |

**Action:**
1. Check if salvageable (they have `onSubmit` props, just need wiring)
2. If no wiring planned → move to `specs/archive/components/` or delete

**Verification:**
```
grep -r "ClassSheet\|MajorSheet\|SubjectSheet\|SemesterSheet\|EnrollmentSheet\|GradeSheet\|AnnouncementSheet\|PaymentForm\|StudentForm\|TeacherForm" src/ --include='*.tsx' --include='*.ts'
```
Returns zero results outside their own definitions.

---

### P1-2: `src/components/layout/sidebar.tsx` — legacy sidebar duplicate

Two sidebar files exist:
- `app-sidebar.tsx` — actively used (`AppLayoutClient.tsx` imports this)
- `sidebar.tsx` — **unused** (legacy, non-shadcn, has its own mobile hamburger)

**Action:** Delete `sidebar.tsx` if `app-sidebar.tsx` handles mobile (collapsible sidebar works).

**Verification:** Build passes, sidebar renders correctly.

---

## P1 — Mock Data & Broken UX

### P1-3: `StudentAcademicClient.tsx` — 100% mock data

All KHS, KRS, Jadwal tabs use `MOCK_COURSES` and `MOCK_SCHEDULE` hardcoded arrays. Students see fake data.

**Fix:** Wire to `getStudentGrades()` (needs Phase 16 grades actions) or fallback to empty state.

**Quick fix (now):**
- Replace mock with `<EmptyState>` + "Data nilai belum tersedia."
- Or show a readonly table from `getEnrollments(session.userId)`

**Verification:** No `MOCK_` string exists in the file.

---

### P1-4: `usePermissions()` client hook — endpoint doesn't exist

File `src/hooks/use-permissions.ts` calls `fetch('/api/auth/permissions')` — this API route was never created.

**Root cause:** No `src/app/api/auth/permissions/route.ts` file.

**Fix:**
1. Create `src/app/api/auth/permissions/route.ts` — returns `{ permissions: string[], roleLevel, roleName }`
2. Or replace the hook with render-time props from Server Component

**Verification:** `fetch('/api/auth/permissions')` returns valid JSON, not 404.

---

## P1 — Schema Relations Missing

### P1-5: 9 schema files without `relations()` export

| File | Required Relations |
|---|---|
| `permissions.ts` | role_permissions, user_permissions |
| `role_permissions.ts` | roles, permissions |
| `user_permissions.ts` | users, permissions |
| `majors.ts` | profiles, subjects |
| `classes.ts` | enrollments, subjects, teacherClassSubjects |
| `semesters.ts` | enrollments, grades, paymentItems |
| `subjects.ts` | grades, teacherClassSubjects |
| `payment_methods.ts` | payments |
| `system_configs.ts` | — (orphan, optional) |

**Verification:** `db.query.xxx.findMany({ with: { ... } })` works for the tables above.

---

## P2 — Structural & Consistency Issues

### P2-1: `audit_logs.entityId` uses `bigint` but auth entities use UUID `varchar(36)`

Impossible to log audit entries for users, sessions, or accounts.

**Fix:** Add `entityIdVarchar` column (`varchar(36)`) or change `entityId` to `varchar(255)` to accept both ID types.

**Verification:** Audit log can record `entityType: 'user'` + `entityId: 'uuid-string'`.

---

### P2-2: `profile_assets` vs `studentDocuments` — dual document storage overlap

`profile_assets`: file path strings (ijasah, skhun, skl, kk, ktpAyah, ktpIbu, kip)
`studentDocuments`: encrypted blobs (ijasah, skhun, skl, aktaKelahiran, kk, ktpAyah, ktpIbu, kip, passFoto, rapor)

Both cover ijasah, skhun, skl, kk, ktpAyah, ktpIbu, kip. But `profile_assets` is **never referenced** from any action or page.

**Action:**
1. Remove `profile_assets` from `schema/index.ts` (keep the file for reference)
2. Or add explicit documentation that `studentDocuments` is the active table

**Verification:** Build passes, no import of `profile_assets` in any action/page file.

---

### P2-3: `grades` has no `teacherId`

No traceability for who entered a grade.

**Fix:** Add `teacherId varchar(36) references users.id` to `grades.ts` schema. Requires migration.

---

### P2-4: `enrollments` has no `majorId`

Enrollment only tracks `classId` (X/XI/XII) without major (TKJ/RPL/Automotive). But class X can have multiple majors.

**Fix (deferred):** Add `majorId` FK to `enrollments`. Needs discussion — significant schema change.

---

### P2-5: `system_configs` has no `deletedAt`

23 other tables use soft delete; `system_configs` doesn't.

**Fix:** Add `deletedAt timestamp` column to `system_configs.ts` schema.

---

## P2 — Frontend Incompleteness

### P2-6: DataTable CRUD — delete only, no edit

| DataTable | Has delete? | Has edit? | Backend edit action exists? |
|---|---|---|---|
| ClassesClient | ✅ | ❌ | ✅ `updateClass()` |
| MajorsClient | ✅ | ❌ | ✅ `updateMajor()` |
| SubjectsClient | ✅ | ❌ | ❌ (no `updateSubject`) |
| SemestersClient | ✅ | ❌ | ❌ (no `updateSemester`) |

**Fix:** Add "Edit" column to each DataTable, calling the server action or a dialog.

---

### P2-7: `/grades` page doesn't exist

Route exists in permissions reference (`grades.read_any`, `grades.input`, etc.) but no page file.

**Scope:** Create `src/app/(app)/academic/grades/page.tsx` or wait for Phase 16.

---

### P2-8: `PaymentItemDialog.tsx` — "Batal" button doesn't close the dialog

```tsx
<Button type="button" variant="outline">Batal</Button>
```
No `onClick` handler. Dialog can't be dismissed via this button.

**Fix:** Add `onClick` calling `onOpenChange(false)`.

---

## P2 — Auth & Security

### P2-9: `proxy.ts` maps `/permissions` route to wrong permission

```
'/permissions': 'system_configs.manage'
```
Should map to its own permission, e.g. `permissions.manage`.

**Fix:** Update permission in `route-permissions.ts` and seed data.

---

### P2-10: `seed-permissions.ts` uses raw SQL string interpolation

```tsx
await db.execute(
  `INSERT INTO role_permissions ... SELECT ${roleMap[roleName].id}, ...`
);
```
SQL injection risk.

**Fix:** Replace with `db.insert(rolePermissions).values(...)` pattern like `seed.ts`.

---

## P3 — Minor & Cleanup

### P3-1: `seed.ts` vs `seed-permissions.ts` — duplicated permission list

Two seed files, two nearly identical permission entry lists. `seed-permissions.ts` has `grades.read` which `seed.ts` doesn't. Data inconsistency.

**Fix:** Single source of truth for permission list. Extract to a shared constant file.

---

### P3-2: Void-returning wrapper actions (from Phase 15 TASKS.md)

```tsx
export async function createClassAction(formData: FormData) {
  await createClass(formData);
  // returns void — error silently swallowed
}
```

Four wrappers: `createClassAction`, `createMajorAction`, `createSubjectAction`, `createSemesterAction`.

**Fix:** Return the underlying function's result.

---

### P3-3: `AppHeader.tsx` — search bar and notification non-functional

- Search bar has no handler
- Bell notification always shows red dot

**Fix:** Either remove, disable, or add TODO comments.

---

### P3-4: Login page — `alumni@sister.com` in Quick Login but not in seed

Quick Login buttons exist in the UI, but `seed.ts` only creates 4 users (no alumni).

**Fix:** Add alumni user to `seed.ts`.

---

## Execution Order

```
Phase A: P0 critical
  P0-1 → Fix register/approve to set student roleId
  P0-2 → Fix bulk enrollment to filter by actual class

Phase B: P1 error types + zod validation
  P1-0a → bun add zod
  P1-0b → Create shared ActionResult<T> type + ErrorCode enum (src/lib/actions.ts)
  P1-0c → Create zod schemas per domain (src/lib/validations/*.ts)
  P1-0d → Refactor all 10 action files to ActionResult + zod validation
  P1-0e → Replace all throw new Error with toast pattern

Phase C: P1 dead code
  P1-1 → Archive/delete 10 unused components
  P1-2 → Delete legacy sidebar
  P1-3 → Replace mock data with empty state (quick fix)
  P1-4 → Create permissions API endpoint

Phase D: P1 relations
  P1-5 → Add relations() to 9 schema files

Phase E: P2 structural
  P2-1 → Fix audit_logs.entityId type
  P2-2 → Clean up profile_assets overlap
  P2-3 → Add teacherId to grades (requires migration)
  P2-5 → Add deletedAt to system_configs (requires migration)

Phase F: P2 frontend
  P2-6 → Add edit buttons to DataTables
  P2-7 → Create /grades page (or defer to Phase 16)
  P2-8 → Fix Batal button in PaymentItemDialog

Phase G: P2 auth
  P2-9 → Fix /permissions route mapping
  P2-10 → Fix seed-permissions SQL injection

Phase H: P3 minor
  P3-1 → Deduplicate seed permission lists
  P3-2 → Fix void wrapper actions
  P3-3 → Fix/disable non-functional UI elements
  P3-4 → Add alumni seed user
```
