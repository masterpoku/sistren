# SISTREN - Implementation Memory

**Project:** Sistem Informasi Terpadu (Highschool Management System)
**Last Updated:** 2026-05-12
**Status:** ✅ AUTH WORKING - Better Auth login FIXED

---

## 🔧 FIXED: Better Auth Login Issues (2026-05-12)

### Root Causes Found & Fixed

| Bug | Cause | Fix |
|-----|-------|-----|
| **Wrong config property** | Used `adapter:` instead of `database:` | Changed to `database: drizzleAdapter(...)` |
| **Password hash mismatch** | DB stored argon2, Better Auth expects scrypt | Re-hashed all passwords |
| **Missing session field** | `sessions` table had no `token` column | Added `token` column |
| **Missing session fields** | `ipAddress`, `userAgent` not in schema | Added both columns |
| **Duplicate route** | Had `/auth/` AND `/api/auth/` routes | Deleted `/auth/` route |

### Bug #1: Wrong Config Property

```typescript
// ❌ SALAH - adapter tidak diproses Better Auth
adapter: drizzleAdapter(db, { ... })

// ✅ BENAR - sesuai dokumentasi resmi
database: drizzleAdapter(db, { ... })
```

Better Auth pakai property `database`, bukan `adapter`. Tanpa ini, adapter tidak di-load.

### Bug #2: Password Hash Format

```
Better Auth pakai:    scrypt (format: salt:hexkey)
Database lama pakai:  argon2id (format: $argon2id$v=19$...)
```

Better Auth coba parse argon2 hash → gagal → `Invalid password hash`

**Script created:** `scripts/rehash-passwords.ts` untuk convert password.

### Bug #3: Sessions Table Schema

Better Auth expect session table punya:
- `token` ← **missing, added**
- `ipAddress` ← **missing, added**
- `userAgent` ← **missing, added**

### Bug #4: Duplicate Route Handler

```
src/app/auth/[...better-auth]/     ← BROKEN (404), DELETED
src/app/api/auth/[...better-auth]/  ← WORKING (200), KEPT
```

---

## ✅ COMPLETED WORK

### Auth System (Working)

- Better Auth integration with drizzle adapter
- Password hashing using scrypt (Better Auth format)
- Session management with token, ipAddress, userAgent
- `database:` config property (NOT `adapter:`)
- Route at `/api/auth/[...better-auth]` only

### MariaDB Compatibility

Replaced Drizzle's `with: { role: true }` relations (uses `json_array()` which MariaDB doesn't support) with manual LEFT JOIN queries:

**Files:**
- `src/lib/db/queries-user.ts` - getUserWithRole(), getUserByEmailWithRole()
- `src/lib/db/queries-joins.ts` - getEnrollmentsWithRelations(), getGradesWithRelations()
- `src/lib/auth/permissions.ts` - uses queries-user.ts
- `src/lib/auth/get-session.ts` - uses queries-user.ts

### Role-Based Features

- Nav items filtered by `user.roleLevel`
- Route permissions for `/profile/edit`, `/academic/*`
- RBAC wrapper components

---

## 📁 Files Changed (2026-05-12)

```
Modified:
  src/lib/auth/index.ts              - adapter → database
  src/lib/db/schema/sessions.ts      - added token, ipAddress, userAgent

Deleted:
  src/app/auth/[...better-auth]/     - duplicate broken route

New:
  scripts/rehash-passwords.ts         - one-time password rehash script
```

---

## 🔑 Better Auth Config Checklist

1. ✅ Use `database:` property (NOT `adapter:`)
2. ✅ Passwords hashed with Better Auth's scrypt format
3. ✅ Sessions table has: token, ipAddress, userAgent
4. ✅ Only one route handler at `/api/auth/`
5. ✅ `usePlural: true` for plural table names (users, accounts, etc.)
6. ✅ `baseURL` set to app URL

---

## 📊 DB Tables (Current State)

```sql
-- Better Auth tables:
users        - ✅ 2 rows (superadmin, admin)
accounts     - ✅ 2 rows (credential provider, scrypt hashed passwords)
sessions     - ✅ sessions created on login
verifications - ✅ 0 rows

-- All columns present:
sessions: id, user_id, token, expires_at, ip_address, user_agent, created_at, updated_at
```

---

## 🧪 Useful Scripts

```bash
# Rehash passwords to Better Auth format
bun scripts/rehash-passwords.ts

# Test login via curl
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@sister.com","password":"Password123!"}'

# Test get-session
curl http://localhost:3000/api/auth/get-session \
  -H "Cookie: better-auth.session_token=<token>"
```

---

## 📝 Git Commit History

```
501877e fix(auth): resolve Better Auth login issues
a80af62 fix(auth): add debug logger and document MariaDB compatibility
c7879e5 fix(auth): set usePlural to true for model lookup
```

Branch is 4 commits ahead of origin/main.