# SISTREN - Implementation Memory

**Project:** Sistem Informasi Terpadu (Highschool Management System)
**Last Updated:** 2026-05-08
**Status:** AUTH NOT WORKING - Better Auth login fails

---

## 🔴 CRITICAL BUG: Login Always Fails

**Error:** `[Better Auth]: User not found { email: 'superadmin@sister.com' }`

### Root Cause Analysis

Better Auth calls `internalAdapter.findUserByEmail(email, { includeAccounts: true })` which internally joins `users` → `accounts`.

The error happens at:
```javascript
// node_modules/better-auth/dist/api/routes/sign-in.mjs:211
const user = await ctx.context.internalAdapter.findUserByEmail(email, { includeAccounts: true });
if (!user) {
  ctx.context.logger.error("User not found", { email });
  throw APIError.from("UNAUTHORIZED", BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD);
}
```

### What We've Tried (All Failed)

| Attempt | Change | Result |
|---------|--------|--------|
| 1 | Created `accounts` table with `provider`, `provider_account_id` columns | Failed |
| 2 | Renamed to `account_id`, `provider_id` | Failed |
| 3 | Tried `usePlural: false` | Failed |
| 4 | Tried `usePlural: true` | Failed |
| 5 | Added `users → accounts` relation | Failed |
| 6 | Added `accounts → users` relation | Failed |
| 7 | Added `experimental.joins: true` | Failed |
| 8 | Added `image` column to users | Failed |
| 9 | Created `user`, `account`, `session`, `verification` (singular) tables | Failed |
| 10 | Created `users`, `accounts`, `sessions`, `verifications` (plural) tables | Failed |

### Current DB State (after many iterations)

**Tables:** All 4 Better Auth tables exist
- `users` - 2 rows (superadmin, admin) with password hashes
- `accounts` - 2 rows (credential accounts) with password hashes  
- `sessions` - 0 rows
- `verifications` - 0 rows

**Schema files:**
- `src/lib/db/schema/users.ts` - has `accounts: many(accounts)` relation
- `src/lib/db/schema/accounts.ts` - has `user: one(users)` relation
- `src/lib/db/schema/sessions.ts` - exists
- `src/lib/db/schema/verifications.ts` - exists

**Auth config:**
```typescript
// src/lib/auth/index.ts
adapter: drizzleAdapter(db, {
  provider: 'mysql',
  schema,
  usePlural: true,  // Our tables are plural
}),
experimental: {
  joins: true,  // Enable joins for Better Auth
},
```

### What Has NOT Been Verified

1. **Exact column mapping** - Drizzle camelCase → DB snake_case might be wrong
2. **`findUserByEmail` implementation** - Cannot find where this is implemented in adapter
3. **JOIN query** - Whether Better Auth can properly join users → accounts
4. **`usePlural` actual behavior** - Conflicting docs about what this does

### Known Facts from Source Code

```javascript
// sign-in.mjs line 211-213
const user = await ctx.context.internalAdapter.findUserByEmail(email, { includeAccounts: true });
if (!user) {
  throw APIError.from("UNAUTHORIZED", "INVALID_EMAIL_OR_PASSWORD");
}

// sign-in.mjs line 215
const credentialAccount = user.accounts.find((a) => a.providerId === "credential");
```

**Requirements:**
1. `users` table must have: `id`, `email`, `image`, `name`, `emailVerified`, `createdAt`, `updatedAt`
2. `accounts` table must have: `userId`, `providerId` (= 'credential'), `accountId`, `password`
3. JOIN must work with Drizzle relations

---

## ✅ COMPLETED WORK

### 34 Tasks Done (Phase 1-6)

All planned tasks from old MEMORY.md completed:
- Auth + RBAC system
- Server actions with CRUD
- WRITE query operations
- CRUD UI components
- Role-based wrappers
- Toast notifications

### MariaDB Compatibility Fix

Replaced Drizzle's `with: { role: true }` relations (uses `json_array()` which MariaDB doesn't support) with manual LEFT JOIN queries:

**New files:**
- `src/lib/db/queries-user.ts` - getUserWithRole(), getUserByEmailWithRole()
- `src/lib/db/queries-joins.ts` - getEnrollmentsWithRelations(), getGradesWithRelations()

**Modified files:**
- `src/lib/auth/permissions.ts` - uses queries-user.ts
- `src/lib/auth/get-session.ts` - uses queries-user.ts
- `src/lib/db/queries.ts` - manual joins instead of .with()

### Role-Based Sidebar

- Nav items filtered by `user.roleLevel`
- `<a>` replaced with `<Link>`
- `roleLevel` passed from layout

### Route Permissions

Added to `src/lib/auth/route-permissions.ts`:
- `/profile/edit`
- `/academic/enrollments`
- `/academic/grades`

---

## 📁 Current Files Modified

```
Modified (since last push):
  src/lib/auth/index.ts
  src/lib/auth/permissions.ts
  src/lib/auth/get-session.ts
  src/lib/db/schema/users.ts
  src/lib/db/schema/accounts.ts
  src/lib/db/queries.ts
  src/lib/db/queries-user.ts (NEW)
  src/lib/db/queries-joins.ts (NEW)
  src/app/(app)/layout.tsx
  src/features/layout/AppLayoutClient.tsx
  src/lib/auth/route-permissions.ts
  src/features/profile/ProfileEditClient.tsx
  src/features/profile/page.tsx
```

---

## ❌ NOT YET COMMITTED

All the MariaDB compatibility fixes, schema changes, and auth attempts are NOT committed.

---

## 🔍 NEXT STEPS TO DEBUG

### 1. Verify Drizzle Schema Exactly Matches Better Auth

Better Auth expects specific column names. Check if our schema matches exactly:

```typescript
// What Better Auth expects (from user.mjs schema):
users: {
  id: bigint("id").primaryKey().autoincrement(),
  email: varchar("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),  // NOT emailVerifiedAt
  name: varchar("name"),
  image: varchar("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}

accounts: {
  id: bigint("id").primaryKey().autoincrement(),
  userId: bigint("user_id").notNull(),  // FK
  accountId: varchar("account_id"),
  providerId: varchar("provider_id").notNull(),  // 'credential' for password
  // OAuth fields...
  password: varchar("password"),  // hashed password
}
```

### 2. Try Without Relations

The `experimental.joins: true` might be causing issues. Try removing it.

### 3. Fresh Database

Consider dropping all Better Auth tables and letting Better Auth create them via its CLI:
```bash
npx auth generate
npx drizzle-kit push
```

### 4. Check usePlural Behavior

Docs say:
- `usePlural: true` = Drizzle plural (users) → DB plural (users)
- Our tables ARE plural, so `usePlural: true` should be correct

But we created BOTH singular and plural tables trying different things.

---

## 📊 DB Tables (Current State)

```sql
-- Should exist:
users        - ✅ 2 rows
accounts     - ✅ 2 rows  
sessions     - ✅ 0 rows
verifications - ✅ 0 rows

-- Leftover from debugging (should probably drop):
user          - ❌ (singular, may conflict)
account       - ❌ (singular, may conflict)
session       - ❌ (singular, may conflict)
verification  - ❌ (singular, may conflict)
```

---

## 🧪 Scripts Created During Debugging

Located in `/scripts/`:
- `listUsers.ts` - Shows all users with password status
- Various debug scripts were created then deleted during debugging

---

## 📝 Questions That Need Answers

1. Does `usePlural: true` mean "tables ARE plural" or "convert to plural"?
2. Does Better Auth use Drizzle relations for JOINs or raw queries?
3. Is `experimental.joins: true` required or optional?
4. Why can't we find `findUserByEmail` in the adapter source?
5. Should we just delete all auth-related tables and let Better Auth regenerate them?

---

## 🤔 Recommendations

1. **Read Better Auth adapter source more carefully** - It imports from `@better-auth/core/db/adapter` which we can't see

2. **Try the nuclear option**: Delete all Better Auth tables, use `npx auth generate` to create proper schema

3. **Check if we need a specific table prefix or suffix** - Some MySQL setups have issues

4. **Consider using SQLite for development** - Avoids MySQL/MariaDB specific issues

5. **Ask the Better Auth community** - This specific error might be a known issue with drizzle-adapter + MySQL
