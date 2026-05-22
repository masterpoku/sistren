# tasks-phase3-quickwins-2026-05-23.md

## Phase 3: User Management — Quick Wins Decomposition

> **Status:** not-started
> **Opened:** 2026-05-23
> **Context:** Phase 1 + 1b complete. Auth works. Build passes. `src/actions/` is empty. All feature/page files deleted. Need to rebuild Phase 3 scope from scratch.
> **Approach:** Start with what's immediately usable — login page and registration flow. Each task produces a visible, testable result.

---

## Prerequisites (not tasks — context)

Before Phase 3 work begins:
- `src/actions/` is empty (all 11 action files deleted in Phase 1b cascade deletion)
- `src/features/` directories exist but feature pages deleted
- `src/app/(app)/` has layout.tsx + dashboard/page.tsx (19 lines) — remaining pages deleted
- All userId columns are `varchar(36)` (UUID string) throughout schema
- better-auth handles password hashing internally (scrypt, NOT argon2)
- `auth.api.createUser()` cannot set additionalFields — must use Drizzle `update()` after creation
- `emailVerified = false` is the pending state; admin sets to `true` to approve

---

## Tasks

### [T1] Rebuild login page at `/login`
**File:** `src/app/login/page.tsx`
**Why:** Login is the entry point. Currently no login UI — redirect from root to nowhere.

- [ ] Create login page (Server Component + Client form)
- [ ] Email + password form
- [ ] Call `auth.api.signInEmail({ body: { email, password } })` server-side
- [ ] Handle errors: wrong password, user not found, user soft-deleted
- [ ] Redirect to `/dashboard` on success
- [ ] Show login errors inline (no toast, no alert)
- **Verify:** `POST /login` with valid credentials → redirects to `/dashboard` with session cookie set. Invalid credentials → error message shown.
- **Edge cases:** already logged in → redirect to dashboard. Soft-deleted user → "Account disabled" error.

---

### [T2] Rebuild registration page at `/register`
**File:** `src/app/register/page.tsx`
**Why:** Student self-registration is the primary user onboarding path.

- [ ] Create registration page (Server Component + Client form)
- [ ] Fields: name, email, password, NISN, birthPlace, birthDate, gender, religion, fatherName, motherName, address
- [ ] Call `auth.api.signUpEmail({ body: { email, password, name } })` server-side
- [ ] After successful user creation, use Drizzle `update()` to set `nisn`, `birthPlace`, `birthDate`, `gender`, `religion`, `fatherName`, `motherName`, `address` on the profile row (created via trigger or explicit insert)
- [ ] `emailVerified` stays `false` — pending admin approval
- [ ] Show success message: "Pendaftaran berhasil. Tunggu persetujuan admin."
- **Verify:** Form submit → user created in DB with `emailVerified = false`, profile row created with registration data, user redirected to `/login` with success message.
- **Edge cases:** email already exists → error inline. NISN already registered → error inline. Missing required fields → validation error inline.

---

### [T3] Create `verifySession` server-side utility
**File:** `src/lib/auth/verify-session.ts`
**Why:** All Server Actions and page components need a consistent way to get the current session + role context. Currently each file has its own `getSession` call.

- [ ] Export `verifySession()` → returns `{ session, user }` or throws redirect to `/login`
- [ ] Export `getOptionalSession()` → returns `{ session, user }` or `null` (for public pages)
- [ ] Cross-check `users.deletedAt` — if not null, call `auth.api.signOut()` and throw redirect
- [ ] Load role data via `getAuthContext(session.user.id)` (existing helper in `permissions.ts`)
- **Verify:** `verifySession()` returns user object with role data when valid session exists. Throws redirect when no session. Throws redirect when user is soft-deleted.
- **Edge cases:** expired session → `auth.api.getSession()` returns null → redirect. Soft-deleted user with valid session cookie → sign out and redirect.

---

### [T4] Create `login` Server Action
**File:** `src/actions/auth.ts` (or `src/actions/login.ts`)
**Why:** Keep form handling logic in Server Action, not in page component.

- [ ] Export `loginAction(formData: FormData)` server function
- [ ] Extract email + password from formData
- [ ] Call `auth.api.signInEmail({ body: { email, password } })`
- [ ] On failure: return `{ error: string }`
- [ ] On success: redirect to `/dashboard` via `redirect()`
- **Verify:** Calling `loginAction` with valid credentials returns redirect to `/dashboard`. With invalid credentials returns `{ error: "Email atau password salah" }`.
- **Edge cases:** network failure → `{ error: "Gagal terhubung ke server" }`. User soft-deleted → `{ error: "Akun dinonaktifkan" }`.

---

### [T5] Create `register` Server Action
**File:** `src/actions/register.ts`
**Why:** Registration logic goes here — profile creation, validation, role assignment.

- [ ] Export `registerAction(formData: FormData)` server function
- [ ] Validate required fields (name, email, password, NISN)
- [ ] Call `auth.api.signUpEmail({ body: { email, password, name } })`
- [ ] Fetch created user ID from response
- [ ] Insert `profiles` row with registration data + `type: 'siswa'`
- [ ] Return `{ success: true }` or `{ error: string }`
- **Verify:** `registerAction` with valid data creates user row + profile row, returns `{ success: true }`. Email taken returns error. NISN taken returns error.
- **Edge cases:** `auth.api.signUpEmail` throws → propagate error. Profile insert fails → user already created (acceptable for now, cleanup is manual). Duplicate NISN → explicit check before insert.

---

### [T6] Rebuild minimal dashboard at `/dashboard`
**File:** `src/app/(app)/dashboard/page.tsx`
**Why:** Currently 19-line stub. Needs real data once Phase 3 progresses.

- [ ] Keep as Server Component
- [ ] Fetch session via `verifySession()`
- [ ] Show welcome message: "Selamat datang, {user.name}"
- [ ] Show role badge (from roleName)
- [ ] Placeholder quick actions: 3-4 buttons (Profil, Pembayaran, Pengumuman) — links only, no functionality yet
- **Verify:** Page loads without error, shows user name, shows role, renders quick action links.
- **Edge cases:** Not logged in → redirect to `/login` (handled by `proxy.ts` already).

---

### [T7] Protect `/app` routes — verify proxy.ts is blocking correctly
**File:** `src/proxy.ts`
**Why:** All `/app/*` routes must require auth. proxy.ts is the enforcement point.

- [ ] Confirm proxy.ts matches `/\/((?!_next|api/auth|login|register).*)/`
- [ ] Confirm soft-delete check is present after `getSession`
- [ ] Confirm unauthorized → `/unauthorized` redirect
- [ ] Confirm no session → `/login` redirect
- **Verify:** Open `/dashboard` without session → redirects to `/login`. Open `/dashboard` with valid session → renders. Open `/dashboard` with soft-deleted user → signs out + redirects to `/login`.
- **Edge cases:** proxy.ts may be named `middleware.ts` in older Next.js — verify file name matches Next.js 16 convention.

---

## Task Order

```
T3 (verifySession utility)  → foundation for T4, T6
T1 (login page)             → needs T3 + T4
T4 (login action)           → needs T3
T7 (proxy check)            → independent, can do anytime
T2 (register page)          → needs T5
T5 (register action)        → needs T3
T6 (dashboard)              → needs T3
```

**T3 is the first task** — it's the foundation everything else depends on.

---

## What NOT to include in quick wins

These are deferred to later in Phase 3 (not quick wins scope):
- Admin approval UI for pending registrations
- Staff account creation by admin
- Profile edit page
- Attachment upload
- Role permission checks on individual pages
- Alumni accounts