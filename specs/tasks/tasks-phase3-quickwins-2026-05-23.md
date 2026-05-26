# tasks-phase3-quickwins-2026-05-23.md

## Phase 3: User Management — Quick Wins Decomposition

> **Status:** completed
> **Opened:** 2026-05-23
> **Completed:** 2026-05-23
> **Approach:** Each task produces a visible, testable result. Seed first, then Server Actions, then page migration.

---

## Prerequisites

- `src/actions/` is empty (all 11 action files deleted in Phase 1b cascade deletion)
- `src/app/(app)/` has layout.tsx + dashboard/page.tsx (19 lines) — remaining pages deleted
- All userId columns are `varchar(36)` (UUID string) throughout schema
- better-auth handles password hashing internally (scrypt, NOT argon2)
- `auth.api.signUpEmail()` cannot set additionalFields — must use Drizzle `update()` after creation
- `emailVerified = false` is the pending state; admin sets to `true` to approve
- `users.password` column must be NULLABLE (better-auth stores password in `accounts` table, not `users`)

---

## Tasks

### [T1] Rebuild login page at `/login`

**File:** `src/app/(auth)/login/page.tsx`
**Why:** Login is the entry point. Existing page used client-side `authClient.signIn.email()` — migrated to Server Action pattern.

- [x] Create login page (Client Component + Server Action form via `loginAction`)
- [x] Email + password form
- [x] Call `loginAction()` server function, handle `{ error }` response inline
- [x] Handle errors: wrong password, user not found
- [x] Quick login buttons pre-fill email + password for test users
- [x] Redirect to `/dashboard` on success
- [x] Show login errors inline
- **Verify:** `POST /login` with valid credentials → redirects to `/dashboard` with session cookie set. Invalid credentials → error message shown.
- **Edge cases:** already logged in → redirected to dashboard via `useEffect`. Soft-deleted user → handled by `proxy.ts` signOut + redirect.

---

### [T2] Rebuild registration page at `/register`

**File:** `src/app/(auth)/register/page.tsx`
**Why:** Student self-registration is the primary user onboarding path.

- [x] Create registration page (Client Component + Server Action form via `registerAction`)
- [x] Fields: name, email, password, NISN, birthPlace, birthDate, gender, religion, fatherName, motherName, address
- [x] Call `registerAction()` server function, handle `{ error }` response inline
- [x] After successful user creation, insert `profiles` row with `type: 'siswa'`
- [x] `emailVerified` stays `false` — pending admin approval
- [x] Redirect to `/login` on success
- [x] Show errors inline
- **Verify:** Form submit → user created in DB, profile row created with registration data, user redirected to `/login`.
- **Edge cases:** email already exists → error inline. Missing required fields → browser native validation.

---

### [T3] Create `verifySession` server-side utility

**File:** `src/lib/auth/verify-session.ts`
**Why:** All Server Actions and page components need a consistent way to get the current session + role context.

- [x] Export `verifySession()` → returns `{ userId, email, name }` or throws redirect to `/login`
- [x] Export `getOptionalSession()` → returns `{ userId, email, name } | null` (for public pages, no redirect)
- [x] Cross-check soft-delete — handled by `proxy.ts` (not in verify-session to avoid double redirect)
- **Verify:** `verifySession()` returns user object when valid session exists, throws redirect when no session. `getOptionalSession()` returns null when no session.

---

### [T4] Create `login` Server Action

**File:** `src/actions/auth.ts`
**Why:** Keep form handling logic in Server Action, not in page component.

- [x] Export `loginAction(formData: FormData)` server function
- [x] Extract email + password from formData
- [x] Call `auth.api.signInEmail({ body: { email, password } })`
- [x] On failure: return `{ error: string }`
- [x] On success: `redirect('/dashboard')`
- **Verify:** Calling `loginAction` with valid credentials returns redirect to `/dashboard`. With invalid credentials returns `{ error: "Email atau password salah." }`.
- **Edge cases:** network failure → `{ error: "Terjadi kesalahan. Silakan coba lagi." }`. Soft-deleted user → handled by `proxy.ts`.

---

### [T5] Create `register` Server Action

**File:** `src/actions/register.ts`
**Why:** Registration logic goes here — profile creation, validation, role assignment.

- [x] Export `registerAction(formData: FormData)` server function
- [x] Validate required fields (name, email, password, confirmPassword)
- [x] Check if email already exists (DB query)
- [x] Call `auth.api.signUpEmail({ body: { email, password, name } })`
- [x] Fetch created user ID from response (`'id' in result ? result.id : result.user.id`)
- [x] Insert `profiles` row with `type: 'siswa'`
- [x] Return `{ success: true }` or `{ error: string }`
- **Verify:** `registerAction` with valid data creates user row + profile row. Email taken returns error.
- **Edge cases:** `auth.api.signUpEmail` throws → catch, check for NEXT_REDIRECT, return error. Profile insert fails → error returned.

---

### [T6] Rebuild minimal dashboard at `/dashboard`

**File:** `src/app/(app)/dashboard/page.tsx`
**Why:** Currently 19-line stub. Needs session-based content once Phase 3 progresses.

- [x] Keep as Server Component
- [x] Fetch session via `verifySession()`
- [x] Show welcome message: "Selamat datang, {user.name}"
- [x] Minimal working stub (role badge + quick actions deferred — Turbopack build error with shadcn components in Server Component context)
- **Verify:** Page loads without error, shows user name, build passes.
- **Edge cases:** Not logged in → redirect to `/login` (handled by `verifySession()`).

> **Note:** Full role badge + quick action cards blocked by `TypeError: createContext is not a function` when shadcn `Badge`/`Card` components are used in a Next.js 16 Turbopack Server Component. Needs client component boundary. Deferred to Phase 11.

---

### [T7] Protect `/app` routes — verify proxy.ts is blocking correctly

**File:** `src/proxy.ts`
**Why:** All `/app/*` routes must require auth. proxy.ts is the enforcement point.

- [x] Confirm soft-delete check is present after `getSession`
- [x] Confirm no session → `/login` redirect with `callbackUrl`
- [x] Confirm level check → `/unauthorized` redirect
- [x] Confirm permission check → `/unauthorized` redirect
- **Verify:** Open `/dashboard` without session → redirects to `/login`. Open `/dashboard` with soft-deleted user → signs out via `auth.api.signOut()` + redirects to `/login`.

---

## Additional Work Completed (not in original task list)

### [T0] Create `seed.ts` — seed roles, permissions, test users

**File:** `src/lib/db/seed.ts`
**Why:** No seed script existed. `package.json` referenced `bun run src/lib/db/seed.ts` but file was missing.

- [x] Seed all 5 roles (superadmin, administrator, guru, siswa, alumni)
- [x] Seed all 42 permissions
- [x] Seed role_permission assignments per role
- [x] Create test users via `auth.api.signUpEmail()` + Drizzle `update()` for roleId
- **Test users created:**
  - `superadmin@sister.com` / `Password123!` (role: superadmin, level 100)
  - `admin@sister.com` / `Password123!` (role: administrator, level 80)
  - `guru@sister.com` / `Password123!` (role: guru, level 60)
  - `siswa@sister.com` / `Password123!` (role: siswa, level 40)
- **Verify:** `bun run db:seed` → all roles, permissions, role_permissions, and test users created without error.
- **Edge cases:** `users.password` column must be NULLABLE — MariaDB `ER_NO_DEFAULT_FOR_FIELD` if NOT NULL. Run `ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL` if seed fails on "Field 'password' doesn't have a default value".

---

## Task Order Executed

```
T0 (seed.ts)              → prerequisite: no users existed without it
T3 (verifySession)        → already existed, added getOptionalSession
T4 (loginAction)          → depends on T3
T5 (registerAction)       → depends on T3
T1 (login page)           → depends on T4
T2 (register page)       → depends on T5
T6 (dashboard)           → depends on T3
T7 (proxy.ts)            → already had soft-delete logic, added check
```

---

## What NOT included in quick wins (deferred)

These are deferred to later in Phase 3:

- Admin approval UI for pending registrations
- Staff account creation by admin
- Profile edit page
- Attachment upload
- Role permission checks on individual pages
- Alumni accounts
- Full dashboard with role badge + quick action cards (blocked by Turbopack/shadcn incompatibility)
