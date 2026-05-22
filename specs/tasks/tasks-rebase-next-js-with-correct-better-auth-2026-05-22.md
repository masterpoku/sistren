# tasks-rebase-next-js-with-correct-better-auth-2026-05-22.md

## Rebase Auth Layer — Fix Broken Better-auth Implementation

> **Status: INCOMPLETE — 5 critical issues block commit**
> **Goal:** Fix broken auth implementation. Auth layer files are correct; downstream files (app layout, action files, query files) still have type errors deferred to Phase 3.

---

## VERIFIED FACTS (DO NOT DEVIATE)

These are confirmed by source code + better-auth docs + MariaDB. Any implementation contradicting these is WRONG:

1. `session.user.id` is **string** (UUID, not number). `Number(uuid)` = `NaN`.
2. `auth.api.createUser()` **cannot** set additional fields via `data` param. Must use Drizzle `update()` after creation.
3. `emailVerified = false` is the pending state. Admin sets to `true` after approval.
4. `additionalFields.roleId` with `input: false` is NOT auto-set on any user creation path.
5. Admin plugin removed from server auth (conflicts with custom RBAC roleId FK system).
6. No DB-level FK constraint on polymorphic `attachments.idRef` — enforced at application layer only.
7. **CONFIRMED via source read:** `user_permissions.userId` is `bigint` — type mismatch with `users.id = varchar(36)`. Migration required.
8. **CONFIRMED via source read:** All other FK columns to users are already `varchar(36)` (enrollments, attachments, profiles, announcements, payments, audit_logs).

---

## ROOT CAUSE ANALYSIS

### Why C2 is catastrophic (not just a type error)

`user_permissions.userId` is `bigint` column. Code does `Number("uuid-string")` = `NaN`.

In MariaDB:
- `NaN` coerces to `0` on INSERT into bigint column
- Query `WHERE userId = NaN` matches nothing (NaN ≠ NaN in SQL)
- Every permission override write silently corrupts data (userId=0)
- Every permission override read silently returns empty

**Effect:** No user can have effective permission overrides. `grantPermission()` and `revokePermission()` are broken. The `userOverrides` query in `getAuthContext` always returns empty.

---

## CRITICAL FIX SEQUENCE

**MUST execute in order. Schema fix first, then code fixes.**

### STEP 0: Pre-flight check (verify current state)
```bash
# Verify get-session.ts still exists (should be deleted)
ls src/lib/auth/get-session.ts

# Verify permissions route still exists (should be deleted)
ls src/app/api/auth/permissions/route.ts

# Verify user_permissions.userId type (should be bigint, unfixed)
grep "userId" src/lib/db/schema/user_permissions.ts

# Verify permissions.ts has Number() casts
grep -n "Number(userId)" src/lib/auth/permissions.ts
```

---

### STEP 1: Schema migration (MUST be first)

**user_permissions.userId: bigint → varchar(36)**

```sql
-- 1a. Check for garbage data (NaN coerced to 0 in MySQL)
SELECT * FROM user_permissions WHERE user_id = 0;

-- 1b. If garbage exists, delete it
DELETE FROM user_permissions WHERE user_id = 0;

-- 1c. Drop FK constraint (MariaDB requires this before type change)
ALTER TABLE user_permissions DROP FOREIGN KEY user_permissions_ibfk_1;

-- 1d. Migrate column type
ALTER TABLE user_permissions CHANGE user_id user_id VARCHAR(36) NOT NULL;

-- 1e. Re-add FK constraint
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_ibfk_1
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 1f. Add unique constraint (prevent duplicate overrides)
ALTER TABLE user_permissions ADD UNIQUE INDEX idx_user_permission (user_id, permission_id);
```

**Execute via DB admin tool (TablePlus/phpMyAdmin).** `drizzle-kit push` hangs on pull — bypass with direct SQL.

---

### STEP 2: Fix permissions.ts — Remove ALL Number() casts

**File:** `src/lib/auth/permissions.ts`

Remove `Number()` from all three locations:

| Line | Before | After |
|------|--------|-------|
| 65 (userOverrides query) | `eq(userPermissions.userId, Number(userId))` | `eq(userPermissions.userId, userId)` |
| 151 (grantPermission) | `userId: Number(userId)` | `userId: userId` |
| 167 (revokePermission) | `userId: Number(userId)` | `userId: userId` |

**Also:** Remove unused imports `roles` from line 2 if present.

---

### STEP 3: Delete permissions route

```bash
rm src/app/api/auth/permissions/route.ts
```

**Confirmed:** Route is not used by any client-side code. User confirmed: DELETE.

---

### STEP 4: Fix (app)/layout.tsx

**Current broken imports:**
- `import { getSessionWithRole } from '@/lib/auth/get-session'` — file deleted
- `const authClient = createAuthClient({ ... })` in server component body

**Required pattern:**

```typescript
// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getAuthContext } from '@/lib/auth/permissions'
import { auth } from '@/lib/auth'
import { AppLayoutClient } from '@/features/layout/AppLayoutClient'
import { ToastProvider } from '@/hooks/use-toast'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session (session.user.id is string UUID)
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // Get full auth context (includes role data)
  const ctx = await getAuthContext(session.user.id)

  if (!ctx) {
    redirect('/login')
  }

  return (
    <ToastProvider>
      <AppLayoutClient
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: ctx.roleName,       // roles.name — maps to AppLayoutClient.role
          roleId: ctx.roleId,
          roleLevel: ctx.roleLevel,
        }}
        onLogout={handleLogout}
      >
        {children}
      </AppLayoutClient>
    </ToastProvider>
  )
}

// Server-side logout — uses auth.api.signOut, NOT createAuthClient
async function handleLogout() {
  'use server'
  const { headers } = await import('next/headers')
  await auth.api.signOut({ headers: await headers() })
}
```

---

### STEP 5: AppLayoutClient interface — verify matches

**Current interface is ALREADY correct:**
```typescript
interface User {
  id: string
  name: string
  email: string
  role: string      // roleName (roles.name)
  roleId: number
  roleLevel: number
}
```

Layout passes `ctx.roleName` as `role` — matches existing interface. **No change needed.**

---

## QA REVIEW FINDINGS (2026-05-22)

**Issues: 5 critical, 5 warning, 2 info**

### CRITICAL (block commit — must fix before any commit)

- [x] **C1: `src/app/(app)/layout.tsx` imports deleted file** — FIXED in Step 4
- [ ] **C2: `src/lib/auth/permissions.ts` — `Number(userId)` on UUID string** — FIXED in Step 1 (schema) + Step 2 (code)
- [x] **C3: `src/app/api/auth/permissions/route.ts` — missing export** — FIXED in Step 3 (delete route)
- [x] **C4: `src/app/(app)/layout.tsx` — server component calls client-side `createAuthClient`** — FIXED in Step 4
- [x] **C5: `src/app/(app)/layout.tsx` — session shape mismatch** — FIXED in Step 4

### WARNINGS (fix before commit)

- [ ] **W1: `permissions.ts` — `grantPermission`/`revokePermission` also use `Number(userId)`** — FIXED in Step 2
- [ ] **W2: `permissions.ts` — unused exported functions** — `hasAnyPermission`, `hasAllPermissions`, `grantPermission`, `revokePermission` — no usages found. Remove or mark TODO. Decision: keep for future use, no action needed for now.
- [ ] **W3: `permissions.ts` — inefficient duplicate `getAuthContext` calls** — Accept for Phase 1, optimize later
- [ ] **W4: `permissions.ts` — `roleName: user.roleName || 'unknown'`** — Not a bug, keep fallback
- [ ] **W5: `permissions.ts` — over-explained comment in proxy.ts** — Remove verbose comment

### INFO (document only, no action required)

- [x] **I1: `permissions.ts` — JSDoc comments justified** — Keep
- [x] **I2: `bun run lint` misconfigured** — Not a code problem, defer

---

## DEFINITION OF DONE (Phase 1)

| Criterion | Verification |
|---|---|
| `user_permissions.userId` migrated to `varchar(36)` | `SHOW CREATE TABLE user_permissions` confirms VARCHAR(36) |
| FK constraint re-added | `SHOW CREATE TABLE user_permissions` shows FK |
| Unique constraint on (userId, permissionId) | `SHOW CREATE TABLE user_permissions` shows INDEX |
| Zero `Number(userId)` casts in permissions.ts | `grep "Number(userId)" src/lib/auth/permissions.ts` returns nothing |
| Permissions route deleted | `ls src/app/api/auth/permissions/route.ts` → not found |
| Layout imports correct files | No reference to `get-session.ts` |
| Layout uses `auth.api.signOut` (server-side) | No `createAuthClient` in server component |
| Layout passes `role: ctx.roleName` | Shape matches AppLayoutClient interface |
| `bun run typecheck` passes | 0 errors in auth layer files |
| `bun run build` succeeds | No build errors |

---

## EDGE CASES

| Scenario | Expected Behavior |
|---|---|
| `userId` = null in `getAuthContext` | Returns null → layout redirects to /login |
| Malformed UUID passed to `getAuthContext` | Returns null → layout redirects to /login |
| Role deleted → `ctx` is null | Layout redirects to /login |
| NaN garbage in user_permissions before migration | Deleted in Step 1b |
| Concurrent `grantPermission` for same user/permission | Unique constraint prevents duplicate |
| No session | Redirect to /login |

---

## MIGRATION SUMMARY

| Step | Action | Files |
|---|---|---|
| 0 | Pre-flight check | verify state |
| 1 | Schema migration | MariaDB (SQL) |
| 2 | Remove Number() casts | permissions.ts |
| 3 | Delete permissions route | route.ts |
| 4 | Fix layout | layout.tsx |
| 5 | Verify | typecheck + build |