# tasks-phase3-completion-plus-phase4-2026-05-24.md

## Phase 3 Completion + Phase 4: Academic Core

> **Status:** not-started
> **Opened:** 2026-05-24
> **Context:** Phase 3 quick wins done but T5/T6 incomplete. Phase 4 (academic) is next critical path. Both merged into one file for parallel execution.
> **Coder agents:** Agent A = Phase 3 completion. Agent B = Phase 4 academic core. Work in parallel.

---

## PART A — Phase 3 Completion

### [A1] Fix registerAction — save registration data to profile

**File:** `src/actions/register.ts`
**Spec violation:** Registration form collects nisn, birthPlace, birthDate, gender, religion, fatherName, motherName, address but they are NOT saved. Only `type: 'siswa'` is inserted.

**What to fix:**

- Extract all registration fields from FormData: `nisn`, `birthPlace`, `birthDate`, `gender`, `religion`, `fatherName`, `motherName`, `address`
- Save all fields to the `profiles` row alongside `userId` and `type: 'siswa'`
- Field mapping: `formData.get('fieldName')` → `profiles.fieldName`

**After fix:**

```ts
await db.insert(profiles).values({
  userId,
  type: 'siswa',
  nisn: formData.get('nisn') as string,
  birthPlace: formData.get('birthPlace') as string,
  birthDate: new Date(formData.get('birthDate') as string),
  gender: formData.get('gender') as 'male' | 'female',
  religion: formData.get('religion') as string,
  fatherName: formData.get('fatherName') as string,
  motherName: formData.get('motherName') as string,
  address: formData.get('address') as string,
});
```

**Verify:** Register a new student → query DB → `profiles` row has all 9 fields populated.

---

### [A2] Fix dashboard — add role badge + quick action links

**File:** `src/app/(app)/dashboard/page.tsx`
**Spec violation:** Dashboard shows only "Selamat datang, {name}" — no role badge, no quick action links.

**What to fix:**

- Fetch user role data via `getAuthContext(session.user.id)` from `permissions.ts`
- Show role badge (Badge component with role name)
- Add 3-4 quick action links as buttons/cards:
  - `/profile` — "Profil Saya" (all logged-in users)
  - `/payments` — "Pembayaran" (siswa role)
  - `/announcements` — "Pengumuman" (all roles)
  - `/academic` for admin/guru

**IMPORTANT — Turbopack shadcn incompatibility:**

- `Badge` and `Card` from shadcn use `createContext` which fails in Next.js 16 Turbopack Server Components
- **Workaround:** Extract interactive parts (badge, cards) into a separate Client Component file (e.g., `src/app/(app)/dashboard/components.tsx` with `'use client'`)
- Parent `page.tsx` stays as Server Component, passes data to client component

**Verify:** Dashboard shows: welcome text + role badge + quick action buttons. Build passes.

---

### [A3] Admin approval UI — list pending students

**File:** `src/app/(app)/admin/approvals/page.tsx` (new) + `src/actions/admin.ts`
**Feature:** Admin views all students with `emailVerified = false` (pending approval), can approve or reject.

**What to build:**

- Server Component page at `/admin/approvals`
- Fetch all users where `emailVerified = false`
- Show table: name, email, NISN, registration date
- Each row: "Approve" button + "Reject" (soft-delete) button
- Approve: `db.update(users).set({ emailVerified: true }).where(eq(users.id, userId))`
- Reject: `db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId))`
- Requires `verifyRoleLevel(80)`

**Server actions in `src/actions/admin.ts`:**

- `approveStudent(userId)` + `rejectStudent(userId)`

**Verify:** Admin visits `/admin/approvals` → sees pending students → Approve → student can login.

---

### [A4] Staff account creation by admin

**File:** `src/app/(app)/admin/users/page.tsx` (new) + `src/actions/admin.ts`
**Feature:** Admin creates staff accounts (guru, administrator). NOT using signUpEmail — uses `auth.api.createUser()`.

**What to build:**

- Page at `/admin/users` — list all users (filterable by role)
- "Add User" button → form: name, email, password, role dropdown (guru, administrator)
- On submit:
  1. `auth.api.createUser({ body: { email, password, name } })`
  2. `db.update(users).set({ roleId: targetRoleId, emailVerified: true })`
- List view: name, email, role, status, created date
- Delete: soft-delete (`deletedAt = new Date()`)
- Requires `verifyRoleLevel(80)`

**Note:** `auth.api.createUser()` for admin-created staff (approved immediately). `auth.api.signUpEmail()` for student self-registration (emailVerified=false, pending).

**Verify:** Admin creates guru account → user can login immediately → has guru role.

---

### [A5] Profile edit page

**File:** `src/app/(app)/profile/page.tsx` (new) + `src/actions/profile.ts`
**Feature:** User edits their own profile.

**What to build:**

- Server Component at `/profile`
- Uses `verifySession()` → own userId only
- Pre-fill form with current profile data from `profiles` table
- Editable: phone, address, father/mother fields (NOT nisn, birthPlace, birthDate)
- Save → `updateProfile(userId, formData)` → `db.update(profiles).set(...).where(eq(profiles.userId, userId))`

**Verify:** User visits `/profile` → edits phone → saves → data persisted.

---

### [A6] Attachment upload (encrypted blob)

**File:** `src/app/(app)/students/[id]/documents/page.tsx` (new) + `src/actions/documents.ts`
**Feature:** Upload student documents as encrypted blob. Uses `encryptBlob` from `src/lib/crypto.ts`.

**What to build:**

- Page at `/students/[id]/documents` — list + upload form
- Document types: `ijasah`, `skhun`, `skl`, `akta_kelahiran`, `kk`, `ktp_ayah`, `ktp_ibu`, `kip`, `pass_foto`, `rapor`
- Upload action `uploadDocument(formData)`:
  1. Extract `file`, `studentId`, `documentType` from formData
  2. Read file as `ArrayBuffer` → `Buffer`
  3. Encrypt: `encryptBlob(buffer)` → encrypted buffer
  4. Insert into `attachments` table
- List: type, filename, upload date
- Download: decrypt blob on retrieval, serve as PDF
- Permission: `profile.edit_any` (admin/guru) or own profile

**Server actions in `src/actions/documents.ts`:** `uploadDocument`, `getDocuments(studentId)`, `downloadDocument(attachmentId)`

**Verify:** Admin uploads KK PDF → encrypted blob in DB → downloads → PDF renders.

---

## PART B — Phase 4: Academic Core

> All tables exist in schema. No schema changes needed. Build Server Actions + Pages only.

### Schema reference (existing files)

```
src/lib/db/schema/classes.ts   — id, name, code, level, createdAt, deletedAt
src/lib/db/schema/majors.ts     — id, name, code, description, createdAt, deletedAt
src/lib/db/schema/subjects.ts   — id, name, code, level, majorId, createdAt, deletedAt
src/lib/db/schema/semesters.ts  — id, name, academicYear, isActive, createdAt, deletedAt
src/lib/db/schema/roles.ts      — id (BIGINT), name, level
```

### [B1] Classes CRUD

**Files:** `src/actions/academic.ts` + `src/app/(app)/academic/classes/page.tsx`

**Server actions in `src/actions/academic.ts`:**

- `getClasses()` → list all active classes
- `createClass(formData)` → `db.insert(classes).values(...)`
- `updateClass(classId, formData)` → `db.update(classes).set(...).where(eq(classes.id, classId))`
- `deleteClass(classId)` → soft-delete: `db.update(classes).set({ deletedAt: new Date() })`

**Page:** Table of classes (name, code, level) + "Add Class" button → modal or inline form.
Requires `classes.manage` permission (`verifyRoleLevel(60)` minimum).

**Verify:** Admin adds class "X IPA 1" → appears in list → can edit name → can soft-delete.

---

### [B2] Majors CRUD

**Files:** `src/actions/academic.ts` (add functions) + `src/app/(app)/academic/majors/page.tsx`

**Server actions:**

- `getMajors()` → list all active majors
- `createMajor(formData)` → `db.insert(majors).values(...)`
- `updateMajor(majorId, formData)` → `db.update(majors).set(...).where(eq(majors.id, majorId))`
- `deleteMajor(majorId)` → soft-delete

**Page:** Table of majors + "Add Major" form.
Requires `majors.manage` permission.

**Verify:** Admin adds major "IPA" → appears in list → can edit → can soft-delete.

---

### [B3] Subjects CRUD

**Files:** `src/actions/academic.ts` (add) + `src/app/(app)/academic/subjects/page.tsx`

**Server actions:**

- `getSubjects()` → list all active subjects (join with majors to show major name)
- `createSubject(formData)` → `db.insert(subjects).values(...)`
- `updateSubject(subjectId, formData)`
- `deleteSubject(subjectId)` → soft-delete

**Page:** Table: name, code, level, major. + "Add Subject" form.
Requires `subjects.manage` permission.

**Verify:** Admin adds subject "Matematika" → appears in list with correct major.

---

### [B4] Semesters CRUD

**Files:** `src/actions/academic.ts` (add) + `src/app/(app)/academic/semesters/page.tsx`

**Server actions:**

- `getSemesters()` → list all semesters (show academic year + active status)
- `createSemester(formData)` → name, academicYear, isActive
- `updateSemester(semesterId, formData)`
- `deleteSemester(semesterId)` → soft-delete
- `setActiveSemester(semesterId)` → sets `isActive: true` for this semester, `false` for all others (transaction)

**Page:** Table: semester name, academic year, active flag. Only ONE semester can be active at a time.
Requires `semesters.manage` permission.

**Verify:** Admin creates "Semester Ganjil 2025/2026" → marks active → only one active at a time.

---

### [B5] Teacher assignment to classes/subjects

**Files:** `src/actions/academic.ts` (add) + `src/app/(app)/academic/assignments/page.tsx`

**Feature:** Assign a teacher (guru) to a class + subject combination. This is needed for Phase 5 enrollments + Phase 6 grades.

**Schema:** `teacher_class_subjects` table — id, teacherId (FK to users), classId (FK to classes), subjectId (FK to subjects), semesterId (FK to semesters), createdAt.

**Server actions:**

- `getAssignments(semesterId)` → list all assignments (join teacher name, class name, subject name)
- `assignTeacher(formData)` → `db.insert(teacherClassSubjects).values(...)`
- `removeAssignment(assignmentId)` → soft-delete
- `getTeachers()` → list all users with role `guru` (for dropdown selection)

**Page:** Table: teacher, class, subject, semester. "Assign Teacher" form: select teacher, class, subject, semester.
Requires `teachers.assign_class` or `teachers.assign_subject` permission.

**Verify:** Admin assigns guru@sister.com to class "X IPA 1" + subject "Matematika" + semester "Ganjil 2025/2026" → assignment shows in list.

---

### [B6] Academic year setup UI

**File:** `src/app/(app)/academic/page.tsx` (overview/dashboard for academic module)
**Feature:** Landing page for academic module — shows summary of classes, majors, subjects, current semester.

**What to build:**

- Server Component at `/academic`
- Shows stats: total classes, total majors, total subjects, active semester
- Links to sub-pages: Classes, Majors, Subjects, Semesters, Assignments
- Quick action: "Set Active Semester" inline

**Verify:** Admin visits `/academic` → sees summary cards → can navigate to sub-sections.

---

## Task Execution Notes

**Agent A — Phase 3 Completion (A1-A6):**

```
A1 → A2 → A3 → [A4, A5, A6 can parallel]
```

**Agent B — Phase 4 Academic Core (B1-B6):**

```
B1 → B2 → B3 → B4 → B5 → B6 [sequential: each builds on previous]
```

B1-B5 are independent CRUD pages. B6 is the overview page that depends on all others being done first.

**Shared dependencies:**

- Both agents use `verifySession()`, `verifyRoleLevel()`, `hasPermission()` from existing files
- Both agents use existing `db` from `@/lib/db`
- Both agents use existing `cn()` from `@/lib/utils`
- No new schema files needed — all tables already defined in `src/lib/db/schema/`
- Use shadcn components: `Button`, `Card`, `Table`, `Input`, `Label`, `Select`, `Badge`, `Dialog` via `bunx shadcn@latest add`
- Server Components by default — `'use client'` only for forms/interactivity

**Soft delete pattern:**

```ts
// Delete
db.update(table).set({ deletedAt: new Date() }).where(eq(table.id, targetId));

// Query active only
db.select().from(table).where(isNull(table.deletedAt));
```

**Verify before finishing each task:**

- `bun run typecheck` — 0 errors
- `bun run build` — passes
- Feature works end-to-end (not just "code exists")

---

## What NOT included (deferred)

- Admin approval list styling (basic table OK for now)
- Staff account edit by admin (create + delete only for MVP)
- Bulk enrollment (Phase 5)
- Rapor upload UI (Phase 6)
- Profile page full form validation
- Document download streaming optimization
