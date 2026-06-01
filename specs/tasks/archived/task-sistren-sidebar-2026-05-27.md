# task-sistren-sidebar-2026-05-27.md

## Phase 11 Dashboard + Phase 5/7/8 Features

> **Status:** not-started
> **Opened:** 2026-05-26
> **Updated:** 2026-05-28 — added route rename task, enrollment state machine, bulk enrollment pattern, Drizzle+MySQL notes from deepresearch
> **Worker:** yanto-gercep

---

## RESEARCH FINDINGS (2026-05-28)

### better-auth Route Naming

- **Docs say:** recommended route is `/api/auth/[...all]` (not `[...better-auth]`)
- **Risk:** Non-standard route name can cause 404 on API endpoints (GitHub Issue #6671)
- **Action:** Task [A0b] added below — rename route folder

### Enrollment Status — State Machine Pattern

- **active** → **transferred** (one way, irreversible)
- **active** → **dropped** (one way, irreversible)
- **transferred** → **dropped**
- NOT reversible. Status is business state, `deletedAt` is audit state — different things.

### Bulk Enrollment Pattern (Drizzle + MySQL)

- Use `db.transaction()` with conditional insert (skip already-enrolled)
- MySQL: no `.returning()` — use `insertId` pattern after insert
- Batch API available but not needed for school scale (~1000 students)

---

## PART A — App Shell: Sidebar Navigation

### [A0a] Quick Fix: Missing Pages (404 routes from QA)

**Files:** Multiple (new pages)

**Why:** QA found 404 on sidebar links — routes exist in nav but pages missing.

**What to fix:**

- `/roles` — page missing. Either create list page or remove from sidebar (if not needed for MVP).
- `/students` — list page 404. Need `src/app/(app)/students/page.tsx` (simple table of students with link to `/students/[id]/documents`).
- `/teachers` — page missing (referenced in dashboard quick actions). Need `src/app/(app)/teachers/page.tsx`.

**Decision:** For MVP, create simple placeholder pages (table with "coming soon" or minimal list) rather than full CRUD, to avoid 404. Remove from sidebar if not ready.

**Verify:** All sidebar links return 200, not 404.

---

### [A0b] Route Rename: `[...better-auth]` → `[...all]`

**File:** `src/app/api/auth/[...better-auth]` → rename to `src/app/api/auth/[...all]`

**Why:** better-auth official docs recommend `/api/auth/[...all]`. Non-standard route name can cause 404 on some API endpoints (GitHub Issue #6671 confirmed).

**Steps:**

1. Rename folder `src/app/api/auth/[...better-auth]` to `src/app/api/auth/[...all]`
2. Verify all auth endpoints still work: login, logout, session
3. Run `bun run typecheck && bun run build`

**Note:** `next.config.ts` already has `serverActions.bodySizeLimit: 16 * 1024 * 1024` — verify this is still valid in Next.js 16 (config key may have changed).

**Verify:** Login works, logout works, session persists. Build passes.

---

### [A1] Sidebar — Layout + Role-Based Menu

**File:** `src/components/layout/sidebar.tsx` (new) + `src/app/(app)/layout.tsx` (edit)

**What to build:**

- Server Component sidebar with client interactive parts (collapsible on mobile)
- Role-based menu items:
  - **Superadmin (100) / Admin (80):** Dashboard, Academic (classes/majors/subjects/semesters), Students, Teachers, Enrollments, Payments, Announcements, Admin (users/approvals), Profile
  - **Guru (60):** Dashboard, Academic, Students, Announcements, Profile
  - **Siswa (40):** Dashboard, Announcements, Profile, Payments (own)
  - **Alumni (20):** Dashboard, Profile (read-only)

- Each menu item: icon + label + href
- Active state highlight
- Collapsible on mobile (hamburger menu)
- User avatar + name at bottom (profile dropdown)

**Shadcn components:** `Button`, `Collapsible`, `DropdownMenu`, `Avatar`

**Server Component** — sidebar shell as Server Component, interactive parts (dropdown, collapsible) extracted to Client Components.

**Permission check:** Use `getAuthContext()` for role-based rendering.

**Verify:** Sidebar renders correct menu items per role. Build passes.

---

### [A2] App Layout — Integrate Sidebar

**File:** `src/app/(app)/layout.tsx` (edit)

**What to fix:**

- Current `(app)/layout.tsx` is unknown state — verify current implementation
- Integrate `Sidebar` component into layout
- Ensure `proxy.ts` auth check still works
- Add mobile responsive wrapper (sidebar collapses on small screens)
- Profile dropdown at top-right corner

**Verify:** All routes under `(app)` show sidebar. Auth still works via proxy.ts.

---

### [A3] Profile Dropdown

**File:** `src/components/layout/profile-dropdown.tsx` (new)

**What to build:**

- Client Component dropdown
- Shows: avatar, name, role badge
- Menu items: "Profil Saya" (/profile), "Keluar" (logout)
- Logout: call `auth.api.signOut()` then redirect to `/login`

**Shadcn components:** `DropdownMenu`, `Avatar`, `Menu`

**Verify:** Profile dropdown works, logout redirects to /login.

---

## PART B — Phase 5: Enrollments

### [B1] Enrollments CRUD

**Files:** `src/actions/enrollments.ts` (edit existing) + `src/app/(app)/enrollments/page.tsx` (edit existing)

**Schema:** `enrollments` table exists (bigint PK, studentId varchar FK to users, semesterId FK, classId FK).

**IMPORTANT — Enrollment Status State Machine:**

```
active → transferred (one way, cannot revert)
active → dropped (one way, cannot revert)
transferred → dropped
```

- Status field: `enum('active', 'transferred', 'dropped')` — default `'active'`
- Transitions are directional — no reversibility
- `deletedAt` is soft delete (audit) — different from `status` (business state)

**Server actions:**

- `getEnrollments(semesterId?, status?)` — list all, join student name + class name + semester name, filter by status
- `getEnrollmentsByStudent(studentId)` — list enrollments for a student
- `createEnrollment(formData)` → `db.insert(enrollments).values(...)` with `status: 'active'`
- `updateEnrollmentStatus(enrollmentId, newStatus)` → validate transition (active→transferred/dropped only, transferred→dropped only), then `db.update(...)`
- `deleteEnrollment(enrollmentId)` → soft-delete (NOT status change — different operation)

**Drizzle + MySQL note:** No `.returning()` on insert. If you need the inserted ID, use `insertId` from the insert result in a transaction.

**Page:** Table of enrollments (student name, class, semester, **status badge**). Status badges: green=active, yellow=transferred, red=dropped.

- "Add Enrollment" form: select student, semester, class → status defaults to 'active'
- Status change dropdown per row (admin/TU only): change to transferred/dropped

**Permissions:** `enrollments.create` (admin/guru), `enrollments.read` (all authenticated)

**Verify:** Admin can create enrollment → appears in list with green "active" badge. Admin can change status to transferred/dropped (badge updates). Status change is one-way — cannot revert.

---

### [B2] Bulk Enrollment

**File:** `src/app/(app)/enrollments/bulk/page.tsx` (new)

**Feature:** Assign all students in a class to a semester in one action.

**IMPORTANT — Implementation Pattern:**

```typescript
// Use db.transaction() with conditional insert
await db.transaction(async (tx) => {
  // Fetch all students in class who don't already have enrollment for this semester
  const existingEnrollments = await tx
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.semesterId, semesterId),
        eq(enrollments.classId, classId),
        isNull(enrollments.deletedAt)
      )
    );

  const existingStudentIds = new Set(
    existingEnrollments.map((e) => e.studentId)
  );

  // Insert only students not already enrolled
  for (const student of studentsToEnroll) {
    if (!existingStudentIds.has(student.id)) {
      await tx.insert(enrollments).values({
        studentId: student.id,
        semesterId,
        classId,
        status: 'active',
      });
    }
  }
});
```

**Drizzle + MySQL note:** No `.returning()` on insert. If you need the inserted enrollment IDs, run a select after the transaction. For bulk enrollment we only need count, not IDs.

**Server action:** `bulkEnroll(semesterId, classId)` — fetch all students in class, insert enrollment for each student who doesn't already have one for that semester. Return count of inserted.

**Page:** Form: select semester, select class. Button: "Assign All Students". Show count of students assigned + count skipped (already enrolled).

**Permissions:** `enrollments.create` (admin only)

**Verify:** Bulk assign → enrollments created for all students not already enrolled. Already-enrolled students are skipped (not duplicated).

---

## PART C — Phase 7: Payments

### [C1] Payment Methods CRUD

**Files:** `src/actions/payments.ts` (add) + `src/app/(app)/payments/methods/page.tsx` (new)

**Schema:** `payment_methods` table exists.

**Server actions:**

- `getPaymentMethods()` → list all active
- `createPaymentMethod(formData)` → `db.insert(payment_methods).values(...)`
- `updatePaymentMethod(methodId, formData)`
- `deletePaymentMethod(methodId)` → soft-delete

**Page:** Table of payment methods (name, account number, type). "Add Method" form.

**Permissions:** `payment_methods.manage` (admin only)

**Verify:** Admin can add payment method → appears in list.

---

### [C2] Payment Records CRUD

**Files:** `src/actions/payments.ts` (add) + `src/app/(app)/payments/records/page.tsx` (new)

**Schema:** `payments` table exists (studentId FK, methodId FK, amount, period, status, paidAt, paidBy).

**Server actions:**

- `getPayments(studentId?)` — list all (admin) or own payments (siswa)
- `createPayment(formData)` → `db.insert(payments).values(...)`
- `approvePayment(paymentId)` → set `status: 'paid'`, `paidAt: new Date()`
- `getPaymentStats(semesterId?)` — summary: total paid, total outstanding per class

**Page:** Table of payments (student, method, amount, period, status, date). Filter by class/semester.

- Admin: see all payments, can approve (mark as paid)
- Siswa: see own payments only, status only

**Permissions:** `payments.create` (admin), `payments.read_own` (siswa), `payments.approve` (admin), `payments.read_any` (admin/guru)

**Verify:** Admin creates payment → appears in list → admin approves → status updated.

---

### [C3] Payment Report

**File:** `src/app/(app)/payments/report/page.tsx` (new)

**Feature:** Summary report per class per month.

**Server action:** `getPaymentReport(semesterId?)` — aggregate: class, total students, total paid, total outstanding.

**Page:** Cards per class showing payment summary. "Download Report" button (future: PDF export).

**Permissions:** `payments.generate_report` (admin only)

**Verify:** Report shows correct aggregates.

---

## PART D — Phase 8: Announcements

### [D1] Announcements CRUD

**Files:** `src/actions/announcements.ts` (new) + `src/app/(app)/announcements/page.tsx` (new)

**Schema:** `announcements` table exists, `announcement_recipients` table exists.

**Server actions:**

- `getAnnouncements(recipientRole?)` — list announcements (admin: all, siswa: own + public)
- `createAnnouncement(formData)` → `db.insert(announcements).values(...)` + optionally insert into `announcement_recipients`
- `publishAnnouncement(announcementId)` → set `publishedAt: new Date()`
- `deleteAnnouncement(announcementId)` → soft-delete

**Page:** Table of announcements (title, content excerpt, publishedAt, recipient count).

- Admin: create form (title, content, category: 'info'|'urgent'|'academic'), publish toggle
- All: list view with published announcements only

**Permissions:** `announcements.create` (admin), `announcements.read` (all authenticated), `announcements.publish` (admin)

**Verify:** Admin creates announcement → appears in list.

---

### [D2] Announcements on Dashboard

**File:** `src/app/(app)/dashboard/components.tsx` (edit)

**Feature:** Show latest 3 announcements on dashboard for all authenticated users.

**Server action:** `getAnnouncements(recipientRole?)` limit 3, ordered by `createdAt DESC`

**Page:** Add "Pengumuman Terbaru" section in DashboardClient component — announcement list with title + date + "Lihat Semua" link to /announcements.

**Permissions:** `announcements.read`

**Verify:** Dashboard shows latest announcements. Build passes.

---

## PART E — Documentation Sync

### [E1] Sync TASKS.md

**File:** `specs/TASKS.md`

**Update:**

- Phase 1: status "completed" (already done)
- Phase 1b: status "completed" (already done)
- Phase 2: status "completed" — pre-commit hooks NOT added (agent workflow handles quality)
- Phase 3: status "completed" (already in progress from earlier edit)
- Phase 4: status "completed" (already in progress from earlier edit)
- Phase 5 (Enrollments): status "in-progress" — add completed sub-tasks after B1+B2 done
- Phase 7 (Payments): status "in-progress" — add completed sub-tasks after C1+C2+C3 done
- Phase 8 (Announcements): status "in-progress" — add completed sub-tasks after D1+D2 done
- Phase 11 (Dashboard): status "in-progress" — add completed sub-tasks after A1+A2+A3 done

---

### [E2] Sync issues.md

**File:** `specs/issues.md`

**Update:**

- Issue 1 (BIGINT→STRING): status "resolved" ✅
- Issue 2 (accounts fields): status "resolved" ✅
- Issue 3 (nextCookies): status "resolved" ✅
- Issue 4 (emailVerified): status "resolved" ✅
- Issue 5 (additionalFields): status "resolved" ✅
- Issue 6 (API route): status "resolved" ✅
- Issue 7 (soft-delete proxy): status "resolved" ✅
- Issue 8 (session cleanup): status "not-started" (still needed — add to deployment runbook)
- Issue 9 (authClient): status "resolved" ✅

---

## Task Execution Order

```
[A0] Quick fix: Missing pages (/roles, /students, /teachers) — QA blocker
    ↓
[A1] Sidebar layout → [A2] App layout → [A3] Profile dropdown
    ↓
[B1] Enrollments CRUD → [B2] Bulk enrollment
    ↓
[C1] Payment methods → [C2] Payment records → [C3] Payment report
    ↓
[D1] Announcements CRUD → [D2] Dashboard announcements
    ↓
[E1] Sync TASKS.md → [E2] Sync issues.md
```

**Note:** A1, B1, C1, D1 can start in parallel (different files). A2 depends on A1. D2 depends on D1.

**Dependencies:**

- A1-A3: No DB schema changes
- B1-B2: enrollments table exists (no schema change)
- C1-C3: payment_methods + payments tables exist (no schema change)
- D1-D2: announcements + announcement_recipients tables exist (no schema change)
- E1-E2: Only text edits to specs/ files

---

## Effort Estimates

| Task                        | Effort    | Priority |
| --------------------------- | --------- | -------- |
| A1: Sidebar layout          | 2-3 hours | 🔴 HIGH  |
| A2: App layout integration  | 1 hour    | 🔴 HIGH  |
| A3: Profile dropdown        | 1 hour    | 🔴 HIGH  |
| B1: Enrollments CRUD        | 1-2 hours | 🟡 MED   |
| B2: Bulk enrollment         | 1 hour    | 🟡 MED   |
| C1: Payment methods         | 1 hour    | 🟡 MED   |
| C2: Payment records         | 2 hours   | 🟡 MED   |
| C3: Payment report          | 1 hour    | 🟡 MED   |
| D1: Announcements CRUD      | 1-2 hours | 🟡 MED   |
| D2: Dashboard announcements | 30 min    | 🟡 MED   |
| E1: Sync TASKS.md           | 15 min    | 🔴 HIGH  |
| E2: Sync issues.md          | 15 min    | 🔴 HIGH  |

**Total estimated:** ~12-15 hours

---

## QA Findings (2026-05-26)

**404 Routes — need pages:**

1. `/roles` — sidebar has "Guru" link but page doesn't exist. Need roles list page or remove from sidebar.
2. `/students` — list page 404, but `/students/[id]/documents` works. Need student list page or redirect.

**Config:** 3. `serverActions` deprecated in Next.js 16 — remove from next.config.ts entirely. Server action body size may have changed default. Verify document upload with >1MB file.

**Performance (✅ good):**

- registerAction: 116ms
- loginAction: 95-113ms
- Pages after cache: 20-60ms

**Not implemented (expected):**

- `/finance` 404 — Phase 7 (payments) not started
- `/announcements` 404 — Phase 8 not started
- `/teachers` 404 — not in current task file

---

## Pre-Sprint Quality Review (2026-05-26)

**Build:** Passes | **Lint:** Passes | **Format:** 121 files need formatting

### Critical Issues (must fix before deploy)

1. **next.config.ts** — `serverActions.bodySizeLimit` is NOT valid in Next.js 16. Config key changed. A6 document upload silently fails at >1MB. Research correct Next.js 16 path for server action body size limit.
2. **Duplicate imports** in assignments/page.tsx — merge into single import line

### High Priority

3. **Format regression** — run `bun run format` to fix 121 files
4. **Magic number** `roleId === 1` in deleteStaffAccount — replace with `roleLevel >= 100`

### Medium Priority

5. **Inline type duplication** in teacherList/classList map — use typeof pattern or TS inference
6. **Ambiguous union type** in downloadDocument — consider typed result wrapper (defer to MVP)

### Code Review Findings

- `documents` guard in StudentDocumentsPage — defensive, works, leave as-is
- Form error throwing pattern — consistent, correct for MVP
- Document type validation — correct SQL injection prevention
- No rate limiting on uploadDocument — note for production hardening

### Action: Fix #1 (next.config.ts) → test A6 with 2MB file → fix #2-#4 → commit

---

## What NOT included

- Phase 6 (Rapor — per semester grade upload)
- Phase 9 (SKHU/Ijazah/PDF documents)
- Phase 10 (Alumni access)
- Phase 12 (Deployment)

---

## Prerequisites

- All previous tasks (A1-A6, B1-B6) complete ✅
- DB schema for enrollments, payment_methods, payments, announcements — all existing
- No new schema files needed
- No pre-commit hooks (per user decision)
