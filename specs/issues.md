# specs/issues.md — better-auth Implementation Audit

> Devil's advocate review against official better-auth docs.
> Created: 2026-05-21

---

## Issue 1: CRITICAL — `sessions.userId` and `accounts.userId` are BIGINT, better-auth expects STRING

**Severity:** CRITICAL
**Confidence:** HIGH
**Status:** not-started

### Problem

Better Auth's core schema defines `session.userId` and `account.userId` as `string` (FK to `user.id`). The current Drizzle schema uses `bigint('user_id', { mode: 'number' })`.

When better-auth queries sessions, it compares string userId against numeric userId. This causes `getSession()` to fail silently — user appears logged out after page refresh.

**Same type mismatch affects:**

- `sessions.userId`
- `accounts.userId`

### Evidence

- Better Auth core schema: `userId: string — FK to user.id` ([source](https://better-auth.com/docs/concepts/database))
- GitHub Issue #6200: model/field mismatch causes silent failures ([source](https://github.com/better-auth/better-auth/issues/6200))
- GitHub Issue #5879: user cannot login after createUser — account-user link fails ([source](https://github.com/better-auth/better-auth/issues/5879))

### Fix Required

1. Change `sessions.userId` from `bigint('user_id', { mode: 'number' })` to `varchar('user_id', { length: 255 })` or `text`
2. Change `accounts.userId` from `bigint('user_id', { mode: 'number' })` to `varchar('user_id', { length: 255 })` or `text`
3. Update all code that passes userId to better-auth — must be string, not number
4. Update `getUserWithRole()` and related queries — must use string userId for better-auth linked records

### Tasks

- [ ] Change `sessions.userId` column type to string
- [ ] Change `accounts.userId` column type to string
- [ ] Update `users.id` to `varchar` to match better-auth's string ID expectation
- [ ] Update `proxy.ts` — `session.user.id` is already string (no change needed)
- [ ] Update `verify-session.ts` — `parseInt(session.user.id)` becomes unnecessary (session.user.id is already string)
- [ ] Update `permissions.ts` — `getUserPermissions()` receives string userId, not number
- [ ] Update `createUser()` in `actions/users.ts` — when creating account record, pass userId as string
- [ ] Run migration

---

## Issue 2: CRITICAL — `accounts` table missing required fields

**Severity:** CRITICAL
**Confidence:** HIGH
**Status:** not-started

### Problem

Better Auth `account` schema requires specific fields. Current `accounts` table is missing:

- `refreshTokenExpiresAt` — OAuth refresh token expiry
- `scope` — OAuth scope not persisted
- `accountId` is nullable but should be NOT NULL

### Evidence

Better Auth core schema ([source](https://better-auth.com/docs/concepts/database)):

```
accountId: string — NOT NULL
scope?: string
refreshTokenExpiresAt?: Date
```

### Fix Required

Add missing columns to `accounts` table:

- `refreshTokenExpiresAt: timestamp('refresh_token_expires_at')`
- `scope: varchar('scope', { length: 500 })`
- Make `accountId` NOT NULL

### Tasks

- [ ] Add `refreshTokenExpiresAt` column to `accounts`
- [ ] Add `scope` column to `accounts`
- [ ] Make `accountId` NOT NULL
- [ ] Run migration

---

## Issue 3: CRITICAL — Missing `nextCookies` plugin

**Severity:** CRITICAL
**Confidence:** HIGH
**Status:** not-started

### Problem

Better Auth docs explicitly state that cookies won't be set when calling `signInEmail`, `signUpEmail`, or other session-mutating actions from Server Actions. The `nextCookies` plugin is required.

Users cannot log in via Server Actions — the session cookie is never set.

### Evidence

> "When you call a function that needs to set cookies, like `signInEmail` or `signUpEmail` in a server action, cookies won't be set. This is because server actions need to use the `cookies` helper from Next.js to set cookies. To simplify this, you can use the `nextCookies` plugin." ([source](https://better-auth.com/docs/integrations/next))

### Fix Required

Add `nextCookies` plugin to auth config. Must be **last plugin** in the array.

### Tasks

- [ ] Install `nextCookies` from `better-auth/next-js`
- [ ] Add `nextCookies()` plugin to `auth()` config, as last entry in `plugins` array
- [ ] Test login via Server Action — verify session cookie is set

---

## Issue 4: CRITICAL — `emailVerified` field missing from users table

**Severity:** CRITICAL
**Confidence:** HIGH
**Status:** not-started

### Problem

Better Auth user schema includes `emailVerified: boolean` as a core field. The current `users` table has `confirmed: boolean` which is not mapped — it's ignored by better-auth.

Email verification status is not tracked by better-auth internally.

### Evidence

Better Auth core schema ([source](https://better-auth.com/docs/concepts/database)):

```
emailVerified: boolean
```

### Fix Required

Rename/migrate `confirmed` to `emailVerified`, or add new boolean field mapped correctly.

### Tasks

- [ ] Add `emailVerified: boolean('email_verified').default(false)` to `users` schema
- [ ] OR rename existing `confirmed` column and update Drizzle mapping
- [ ] Run migration

---

## Issue 5: HIGH — No `additionalFields` config for custom user fields

**Severity:** HIGH
**Confidence:** MODERATE
**Status:** not-started

### Problem

The `users` table has custom fields (`roleId`, `lastLoginAt`, `deletedAt`) that are not declared in better-auth's `additionalFields`. These are invisible to better-auth's session and user queries.

### Evidence

> "To add custom fields, use the `additionalFields` property in the `user` or `session` object of your auth config." ([source](https://better-auth.com/docs/concepts/database))

### Fix Required

Declare `roleId`, `lastLoginAt`, etc. in `additionalFields` config so better-auth can read/write them.

### Tasks

- [ ] Add `additionalFields` to `user` config in `auth()`
- [ ] Declare `roleId`, `lastLoginAt`, `deletedAt` as additionalFields
- [ ] Verify fields are accessible via `auth.api.getSession()`

---

## Issue 6: HIGH — API route uses `[...better-auth]` instead of `[...all]`

**Severity:** HIGH
**Confidence:** HIGH
**Status:** not-started

### Problem

Docs recommend `/api/auth/[...all]` but the project uses `/api/auth/[...better-auth]`.

### Evidence

> "Create a route file inside `/api/auth/[...all]` directory." ([source](https://better-auth.com/docs/integrations/next))

### Fix Required

Rename directory from `[...better-auth]` to `[...all]`.

### Tasks

- [ ] Rename `/src/app/api/auth/[...better-auth]/` to `/src/app/api/auth/[...all]/`
- [ ] Verify all auth endpoints still work (login, logout, session)

---

## Issue 7: MODERATE — Soft delete blind spot in `proxy.ts`

**Severity:** MODERATE
**Confidence:** HIGH
**Status:** not-started

### Problem

The `proxy.ts` middleware calls `auth.api.getSession()` which is blind to soft-delete. A soft-deleted user with an active session cookie can still pass through `proxy.ts` because better-auth only checks session validity, not user `deletedAt`.

### Evidence

Better Auth adapter doesn't know about `deletedAt`. Session validity != user active status.

### Fix Required

After `auth.api.getSession()` succeeds in `proxy.ts`, cross-check user `deletedAt` in custom query. If deleted, destroy session and redirect.

### Tasks

- [ ] In `proxy.ts`, after `auth.api.getSession()` succeeds, query `users` table for `deletedAt`
- [ ] If `deletedAt` is not null, call `auth.api.signOut()` and redirect to `/login`
- [ ] Alternatively: add soft-delete check in `verifySession()` wrapper

---

## Issue 8: MODERATE — No expired session cleanup

**Severity:** MODERATE
**Confidence:** MODERATE
**Status:** not-started

### Problem

Sessions table grows indefinitely. No cleanup mechanism for expired sessions.

### Evidence

Better Auth docs: session cleanup is developer's responsibility for database adapters.

### Fix Required

Add MySQL event or cron job to purge expired sessions, OR use better-auth's programmatic migration hooks.

### Tasks

- [ ] Implement session cleanup (MySQL event or cron script)
- [ ] Add to deployment docs/runbook

---

## Issue 9: MODERATE — No `authClient` created

**Severity:** MODERATE
**Confidence:** HIGH
**Status:** not-started

### Problem

Better Auth docs recommend creating an `authClient` for client-side usage. The project doesn't have one.

### Evidence

> "Create a client instance. You can name the file anything you want. Here we are creating `auth-client.ts` file inside the `lib/` directory." ([source](https://better-auth.com/docs/integrations/next))

### Fix Required

Create `auth-client.ts` using `createAuthClient` from `better-auth/react`.

### Tasks

- [ ] Create `src/lib/auth-client.ts` with `createAuthClient`
- [ ] Export `authClient` for client components
- [ ] Update client-side auth usage (if any) to use `authClient`

---

## Dependency Graph

```
Issue 3 (nextCookies)          ──► Issue 1 (BIGINT→STRING)
Issue 4 (emailVerified)         ──► Issue 1 (schema change)
Issue 5 (additionalFields)     ──► Issue 1 (schema change)
Issue 2 (accounts fields)      ──► Issue 1 (schema change)

Issue 6 (route rename)          ──► Independent
Issue 7 (soft-delete proxy)    ──► Independent (but depends on Issue 1 working)
Issue 8 (session cleanup)      ──► Independent
Issue 9 (authClient)           ──► Independent
```

**Critical path:** Issue 1 (BIGINT→STRING) blocks everything — auth doesn't work at all.
