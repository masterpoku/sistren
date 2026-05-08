# Sistren — Implementation Plan
**Last Updated:** 2026-05-05  
**Stack:** Next.js 16.2.2, better-auth 1.5.6, Drizzle ORM, MySQL

---

## Current State Summary

| Category | Status | Notes |
|----------|--------|-------|
| Auth (better-auth) | ✅ Done | Login/Register/Logout works, proxy.ts active |
| RBAC (permissions) | ✅ Done | 47 permissions, role assignments, hooks ready |
| Database Schema | ✅ Done | 21 tables, migrations pushed, seeded |
| proxy.ts | ✅ Done | Full session + RBAC checks active |
| Feature Pages | ⚠️ Gap | Action files ready but pages still use mock data |
| Server Actions | ⚠️ Incomplete | No `verifySession()` in action files |
| Layout Auth | ⚠️ Client-only | Should be server-side auth check |
| Write Operations | ❌ 0 | No CREATE/UPDATE/DELETE for any table |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  proxy.ts                                                   │
│  - Optimistic auth check (cookie only)                     │
│  - Role level + permission check via Better Auth           │
│  - Redirect: /login or /unauthorized                       │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Route Group Layouts (auth)/(app)                           │
│  - Server Component auth check                              │
│  - Session + role from Better Auth                          │
│  - Redirect: /login if no session                           │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Feature Pages (Server Components)                          │
│  - Call Server Actions with session context                 │
│  - Render real data from DB                                  │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Server Actions (src/actions/*.ts)                          │
│  - verifySession() — validate session before mutation      │
│  - RBAC check — permission required for write ops           │
│  - Execute CRUD query                                       │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  DB Queries (src/lib/db/queries.ts)                         │
│  - READ: 11 functions (basic selects)                       │
│  - WRITE: 0 — all missing                                  │
│  - Missing: profiles, subjects, enrollments, grades         │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Wire Feature Pages to Real Data (Low Effort, High Impact)

**Goal:** Replace all `MOCK_*` imports in feature pages with real server action calls.

### 1.1 — Students Page

**Files:**
- `src/features/students/page.tsx` — currently uses `MOCK_STUDENTS`
- `src/actions/students.ts` — `fetchStudents()` ready
- `src/lib/db/queries.ts` — `getStudents()` ready

**Changes:**
```
src/features/students/page.tsx
───────────────────────────────
- Remove: import { MOCK_STUDENTS } from '@/constants'
- Add: import { fetchStudents } from '@/actions/students'
- Replace: useState(MOCK_STUDENTS) → useState<Student[]>([])
- Add: useEffect → call fetchStudents() → setStudents(result)
- Add: proper Student type (from DB schema, not constants)
```

**Validation:** Page shows real students from DB, stats cards update.

### 1.2 — Teachers Page

**Files:** `src/features/teachers/page.tsx` → `fetchTeachers()` → `getTeachers()`

### 1.3 — Finance Page

**Files:** `src/features/finance/page.tsx` → `fetchPayments()` → `getPayments()`

### 1.4 — Academic Page

**Files:** `src/features/academic/page.tsx` → `fetchAcademic()` → `getClasses/getMajors/getSemesters`

### 1.5 — Announcements Page

**Files:** `src/features/announcements/page.tsx` → `fetchAnnouncements()` → `getAnnouncements()`

### 1.6 — Users Page

**Files:** `src/features/users/page.tsx` → `fetchAllUsers()` → `getAllUsers()`

### 1.7 — Dashboard

**Files:** `src/features/dashboard/page.tsx` → `fetchDashboardStats()` → `getDashboardStats()`

**Changes:**
- Replace hardcoded `registrationData` and `chartData` with real data calls
- Use real announcement data instead of static items

---

## Phase 2: Server-Side Auth in Layouts (Medium Effort, High Impact)

**Goal:** Convert client-only auth checks to server-side using `auth.api.getSession()`.

### 2.1 — Fix App Layout (src/app/(app)/layout.tsx)

**Current:** Client-side only via `useEffect` + `localStorage`
**Target:** Server Component + Better Auth session

```typescript
// src/app/(app)/layout.tsx — Target implementation
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppLayoutClient } from '@/features/layout/AppLayoutClient'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/login')
  }

  // Get real role from DB, not hardcoded
  const user = session.user

  return (
    <AppLayoutClient
      user={{
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
        role: /* get from user's roleId mapping */,
        roleId: /* get from user's roleId */,
      }}
    >
      {children}
    </AppLayoutClient>
  )
}
```

**Split into two files:**
- `src/app/(app)/layout.tsx` — Server Component (auth check only)
- `src/features/layout/AppLayoutClient.tsx` — Client Component (full UI logic)

### 2.2 — Add Auth Layout for (auth) Route Group

**Goal:** Redirect already-logged-in users away from login/register pages.

```typescript
// src/app/(auth)/layout.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
```

### 2.3 — Fix Auth Type Mismatch

**Current:** App layout imports `UserRole` from `@/util/mock/users`
**Fix:** Get role from user's `roleId` field, map to role name

```typescript
// src/lib/auth/get-session.ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { users, roles } from '@/lib/db/schema'

export async function getSessionWithRole() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) return null

  // Fetch user's role from DB
  const user = await db.query.users.findFirst({
    where: eq(users.id, parseInt(session.user.id)),
    with: { role: true },
  })

  return {
    session,
    user: user ? {
      id: user.id.toString(),
      name: user.name || user.email,
      email: user.email,
      roleId: user.roleId as number,
      roleName: user.role?.name || 'unknown',
      roleLevel: user.role?.level || 0,
    } : null,
  }
}
```

---

## Phase 3: Server Action Auth (Medium Effort)

**Goal:** Add `verifySession()` to all action files before executing mutations.

### 3.1 — Create verifySession() Utility

```typescript
// src/lib/auth/verify-session.ts
import 'server-only'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifySession() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/login')
  }

  return {
    userId: parseInt(session.user.id),
    email: session.user.email,
    name: session.user.name,
  }
}

export async function verifyAdmin() {
  const { userId } = await verifySession()
  const { hasRoleLevel } = await import('@/lib/auth/permissions')
  const allowed = await hasRoleLevel(userId, 80)
  if (!allowed) redirect('/unauthorized')
  return userId
}
```

### 3.2 — Update Action Files

**Pattern for each action file:**

```typescript
// src/actions/students.ts
'use server'
import { verifyAdmin } from '@/lib/auth/verify-session'
import { getStudents, createStudent, updateStudent, deleteStudent } from '@/lib/db/queries'

export async function fetchStudents() {
  const session = await verifySession() // Admin or guru only
  return await getStudents()
}

export async function createStudentAction(data: CreateStudentInput) {
  await verifyAdmin() // Only admin can create
  return await createStudent(data)
}

export async function updateStudentAction(id: number, data: UpdateStudentInput) {
  await verifyAdmin()
  return await updateStudent(id, data)
}

export async function deleteStudentAction(id: number) {
  await verifyAdmin()
  return await deleteStudent(id)
}
```

**Files to update:**
- `src/actions/students.ts`
- `src/actions/teachers.ts`
- `src/actions/users.ts`
- `src/actions/payments.ts`
- `src/actions/academic.ts`
- `src/actions/announcements.ts`
- `src/actions/profile.ts`

---

## Phase 4: Add WRITE Operations (High Effort)

**Goal:** Add CREATE/UPDATE/DELETE queries for core tables.

### 4.1 — Profiles CRUD

```typescript
// src/lib/db/queries.ts — Add to queries.ts

// READ
export async function getProfile(userId: number) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: { user: true, major: true },
  })
}

// CREATE
export async function createProfile(data: typeof profiles.$inferInsert) {
  return db.insert(profiles).values(data).returning()
}

// UPDATE
export async function updateProfile(userId: number, data: Partial<typeof profiles.$inferInsert>) {
  return db.update(profiles).set(data).where(eq(profiles.userId, userId)).returning()
}

// DELETE
export async function deleteProfile(userId: number) {
  return db.delete(profiles).where(eq(profiles.userId, userId))
}
```

### 4.2 — Subjects CRUD

```typescript
// src/lib/db/queries.ts

export async function getSubjects(filters?: { majorId?: number; classId?: number }) {
  const query = db.select().from(subjects)
  if (filters?.majorId) query.where(eq(subjects.majorId, filters.majorId))
  if (filters?.classId) query.where(eq(subjects.classId, filters.classId))
  return query
}

export async function createSubject(data: typeof subjects.$inferInsert) { ... }
export async function updateSubject(id: number, data: Partial<typeof subjects.$inferInsert>) { ... }
export async function deleteSubject(id: number) { ... }
```

### 4.3 — Enrollments CRUD

```typescript
// src/lib/db/queries.ts

export async function getEnrollments(userId?: number, semesterId?: number) {
  return db.query.enrollments.findMany({
    where: and(
      userId ? eq(enrollments.userId, userId) : undefined,
      semesterId ? eq(enrollments.semesterId, semesterId) : undefined,
    ),
    with: { user: true, class: true, semester: true },
  })
}

export async function createEnrollment(data: typeof enrollments.$inferInsert) { ... }
export async function updateEnrollment(id: number, data: Partial<typeof enrollments.$inferInsert>) { ... }
export async function deleteEnrollment(id: number) { ... }
```

### 4.4 — Grades CRUD

```typescript
// src/lib/db/queries.ts

export async function getGrades(userId?: number, semesterId?: number) {
  return db.query.grades.findMany({
    where: userId ? eq(grades.userId, userId) : undefined,
    with: { user: true, subject: true, semester: true },
  })
}

export async function inputGrade(data: typeof grades.$inferInsert) { ... }
export async function updateGrade(id: number, data: Partial<typeof grades.$inferInsert>) { ... }
export async function approveGrade(id: number) { ... }
```

### 4.5 — Payments CRUD

```typescript
// src/lib/db/queries.ts

export async function createPayment(data: typeof payments.$inferInsert) { ... }
export async function updatePayment(id: number, data: Partial<typeof payments.$inferInsert>) { ... }
export async function approvePayment(id: number) { ... }
export async function getPaymentHistory(userId: number) { ... }
```

---

## Phase 5: Build UI for CRUD Operations (High Effort)

**Goal:** Add create/edit/delete forms and modals to feature pages.

### 5.1 — Students CRUD UI

**Components to add:**
- `src/components/students/StudentForm.tsx` — Create/Edit modal
- `src/components/students/StudentImport.tsx` — Import from CSV
- Table row actions: Edit, Delete (with confirmation)

**Flow:**
```
Click "Tambah Siswa" → Modal opens → Fill form → Submit → createStudentAction()
Click Edit → Modal opens → Fill form → Submit → updateStudentAction()
Click Delete → Confirmation dialog → deleteStudentAction()
```

### 5.2 — Teachers CRUD UI

Same pattern as students.

### 5.3 — Academic Management UI

**Sub-pages needed:**
- `src/app/(app)/academic/classes/page.tsx` — Class management
- `src/app/(app)/academic/majors/page.tsx` — Major/Jurusan management
- `src/app/(app)/academic/subjects/page.tsx` — Subject/Mata pelajaran management
- `src/app/(app)/academic/enrollments/page.tsx` — KRS management

### 5.4 — Finance CRUD UI

**Features:**
- Payment recording form
- Payment approval workflow (admin)
- Payment history per student

### 5.5 — Profile Edit Page

**Flow:**
```
Profile page → Click "Edit" → fetchProfile(userId) → Show form
→ Submit → updateProfile(userId, data)
```

---

## Phase 6: Role-Based UI Rendering (Medium Effort)

**Goal:** Show/hide UI elements based on permissions using RequirePermission components.

### 6.1 — Wrap Action Buttons

```tsx
// In students/page.tsx
<RequirePermission permission="students.create">
  <Button onClick={openCreateModal}>
    <Plus className="h-4 w-4" /> Tambah Siswa
  </Button>
</RequirePermission>
```

### 6.2 — Wrap Navigation Items

```tsx
// In AppLayout sidebar
<RequireRoleLevel level={80}>
  <NavItem href="/users" icon={Users}>Pengguna</NavItem>
</RequireRoleLevel>
```

### 6.3 — Wrap Page Sections

```tsx
// In academic page
<RequireRoleLevel level={60}>
  <AcademicManagementSection />
</RequireRoleLevel>
```

---

## Implementation Order

```
Phase 1: Wire Feature Pages        (1-2 hours)
Phase 2: Server-Side Auth          (2-3 hours)
Phase 3: Server Action Auth        (1-2 hours)
Phase 4: Add WRITE Operations      (3-4 hours)
Phase 5: Build CRUD UI             (4-6 hours)
Phase 6: Role-Based UI Rendering   (2-3 hours)
─────────────────────────────────────────────
Total estimated: 14-20 hours
```

---

## File Changes Summary

| Phase | Files to Create | Files to Edit |
|-------|----------------|---------------|
| 1 | 0 | 7 (feature pages) |
| 2 | 1 (AppLayoutClient.tsx), 1 (auth layout) | 2 (layouts) |
| 3 | 1 (verify-session.ts) | 7 (action files) |
| 4 | 0 | 1 (queries.ts) |
| 5 | 5-10 (form components) | 5 (feature pages) |
| 6 | 0 | All feature pages |

---

## Validation Checklist

After each phase, verify:

- [ ] `bun run build` passes
- [ ] `bun typecheck` passes
- [ ] Login/logout flow works end-to-end
- [ ] Unauthenticated users redirect to /login
- [ ] Unauthorized users redirect to /unauthorized
- [ ] Dashboard shows real stats from DB
- [ ] Feature pages show real data (not mock)
- [ ] CRUD operations work (create/read/update/delete)
- [ ] Role-based UI hides/shows correctly

---

## Notes

1. **Auth stability issue (CVE-2025-29927):** proxy.ts runs on Node.js runtime in Next.js 16 — more capable but slower. Layer 2 (layout auth) provides defense-in-depth.

2. **Better Auth session:** Call `auth.api.getSession({ headers: await headers() })` in all Server Components and Server Actions — do NOT use client-only auth checks for security.

3. **Role mapping:** User's `roleId` (1-5) maps to role name and level:
   - 1 = superadmin (level 100)
   - 2 = administrator (level 80)
   - 3 = guru (level 60)
   - 4 = siswa (level 40)
   - 5 = alumni (level 20)

4. **Next.js 16 proxy.ts:** Already implemented correctly at `src/proxy.ts`. No changes needed.