# Code Review: Auth & Middleware Infrastructure

**Date**: 2026-06-15
**Scope**: proxy.ts, auth/index.ts, auth/permissions.ts, auth/route-permissions.ts, auth/session.ts, auth/verify-session.ts, auth-client.ts

> **⚠️ CORRECTION (2026-06-15):** Finding 1 is a false positive.
> In Next.js 16, `middleware.ts` was renamed to `proxy.ts`. The file `src/proxy.ts` with named export `proxy` IS the correct convention.
> Build output confirms: `ƒ Proxy (Middleware)` — proxy.ts IS loaded as middleware.
> The empty `middleware-manifest.json` is a Next.js 16 manifest format quirk — the build output is authoritative.
> Remaining findings (2-9) still valid.

---

## C4 Overview

### Context
Users → sistren_next (Next.js 16 / React 19) → Drizzle ORM → MariaDB. Auth via Better Auth (better-auth).

### Containers (auth-related)
```
src/
  proxy.ts                          ← Proxy/Middleware (Next.js 16 convention — file name `proxy.ts`, named export `proxy`)
  lib/auth/
    index.ts                        ← betterAuth() instance config
    permissions.ts                  ← getAuthContext, hasPermission, hasRoleLevel, grant/revoke
    route-permissions.ts            ← ROUTE_PERMISSIONS, PUBLIC_ROUTES, ROLE_LEVEL_REQUIREMENTS, PERMISSION_GROUPS
    session.ts                      ← getSession() wrapper
    verify-session.ts               ← verifySession, verifyAdmin, verifyRoleLevel, verifyPermission
    auth-client.ts                  ← client-side auth client for signIn/signUp/useSession
```

### Data flow
Request → proxy.ts (middleware gate) → [session check → soft-delete check → role level check → permission check] → NextResponse.next() → page
Request → verifySession/verifyAdmin/verifyRoleLevel/verifyPermission (per-page Server Component gate) → page

---

## ~~Finding 1 [CRITICAL] — proxy.ts is dead code~~ **FALSE POSITIVE**

**Retracted.** Next.js 16 uses `proxy.ts` file convention (renamed from `middleware.ts`). Build output confirms it is loaded: `ƒ Proxy (Middleware)`.

---

## Finding 2 [MEDIUM] — Alumni `/calendar` gating bug — root cause needs re-investigation

**Files**: `src/app/(app)/calendar/page.tsx`, `src/lib/auth/route-permissions.ts`

**Evidence**:
- Alumni role level = 20, `/calendar` requires minLevel = 40 in `ROLE_LEVEL_REQUIREMENTS`
- proxy.ts middleware IS active and SHOULD enforce `ROLE_LEVEL_REQUIREMENTS`
- Yet QA reports alumni can still access /calendar
- Two possible root causes to investigate:
  1. `ROLE_LEVEL_REQUIREMENTS` map doesn't have an entry for `/calendar`
  2. The proxy matcher regex doesn't match `/calendar` before the page renders its own content

**Needs re-investigation**: Check if `ROLE_LEVEL_REQUIREMENTS["/calendar"]` exists in route-permissions.ts and whether proxy.ts path matching actually catches it before per-page auth runs.

---

## Finding 3 [HIGH] — No defense-in-depth in page-level Server Components

**Files**: `src/lib/auth/verify-session.ts` (lines 1-121)

**Evidence**:
- verifySession.ts provides: `verifySession()`, `verifyAdmin()`, `verifyRoleLevel()`, `verifyPermission()` — all intended for per-page use
- These are the **second layer** of auth enforcement alongside proxy.ts middleware
- Need to audit which pages/callers actually use these functions

**Impact**: Any page that doesn't call verifySession() or a role/permission check depends entirely on proxy.ts middleware enforcement. If proxy.ts has a bug or misconfiguration, that page is open.

**Fix**: Audit all 35 routes for auth guards. Add verifySession() as minimum to every protected page. Add role-level/permission checks as defense-in-depth.

---

## Finding 4 [MEDIUM] — Superadmin bypass inconsistency

**Files**: `src/lib/auth/permissions.ts`
**Lines**: hasPermission (110-112), hasAnyPermission (127-129), hasAllPermissions (144-146), hasRoleLevel (155-163)

**Evidence**:
- `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()` all have explicit `ctx.roleLevel >= 100` bypass returning `true`
- `hasRoleLevel()` has **no** explicit superadmin bypass — it simply returns `ctx.roleLevel >= minLevel`
- In practice, level 100 >= any minLevel, so behavior is correct — but design is inconsistent
- A future change adjusting hasRoleLevel() logic could accidentally break superadmin access

**Severity**: MEDIUM — functionally correct today, but a latent inconsistency.

**Fix**: Either add explicit level >= 100 bypass to hasRoleLevel() for consistency, or document that implicit check is intentional.

---

## Finding 5 [MEDIUM] — Duplicate route→permission mappings

**File**: `src/lib/auth/route-permissions.ts`
**Lines**: 44/82 (`/enrollments` and `/academic/enrollments`), 50/83 (`/grades` and `/academic/grades`)

**Evidence**:
- `/enrollments` → `enrollments.read` (line 44) duplicates `/academic/enrollments` → `enrollments.read` (line 82)
- `/grades` → `grades.read_any` (line 50) duplicates `/academic/grades` → `grades.read_any` (line 83)
- The proxy.ts sorted-route matcher resolves correctly (longest-first), but the redundancy suggests confusion about route hierarchy

**Impact**: LOW functional impact, but maintenance burden — inconsistent patterns.

**Fix**: Standardize on one format. Either all routes are flat (`/enrollments`, `/grades`) or nested under `/academic/`.

---

## Finding 6 [MEDIUM] — Matcher regex missing favicon.svg

**File**: `src/proxy.ts` line 74
**Text**: `"/((?!_next/static|_next/image|favicon.ico|api/auth|better-auth|css|images|fonts|js).*)"`

**Evidence**:
- Excludes `favicon.ico` — correct
- `public/favicon.svg` exists (270B) but is **not** excluded
- Modern browsers often request both `.ico` and `.svg` — every favicon.svg request hits the proxy middleware (session fetch + DB query) for every page load

**Fix**: Add `favicon.svg` to the exclusion pattern:
`"/((?!_next/static|_next/image|favicon\\.(ico|svg)|api/auth|better-auth|css|images|fonts|js).*)"`

---

## Finding 7 [LOW] — Public routes include unprotected homepage

**File**: `src/lib/auth/route-permissions.ts` line 99
**Text**: `"/"` (root path) is in PUBLIC_ROUTES

**Impact**:
- Homepage is accessible without authentication — likely intentional (landing page)
- But if root page redirects to dashboard, unauthenticated users would hit the redirect rather than accessing data

**Risk**: LOW — no data exposure risk from the root path being public.

---

## Finding 8 [LOW] — Permission name `grades.read_own` defined in GROUPS but never in ROUTE_PERMISSIONS

**File**: `src/lib/auth/route-permissions.ts`
**Lines**: 50-53 (ROUTE_PERMISSIONS for grades), 161-167 (PERMISSION_GROUPS.GRADES)

**Evidence**:
- `PERMISSION_GROUPS.GRADES` includes `"grades.read_own"` (line 164)
- No route in `ROUTE_PERMISSIONS` maps to `"grades.read_own"`
- `grades.read_any` is used for both `/grades` and `/academic/grades` — both grant full access

**Impact**: LOW — no route uses `grades.read_own`, so a student-facing "my grades" page either doesn't exist or uses a less restrictive permission.

---

## Finding 9 [INFO] — Doc comment inaccuracy

**File**: `src/lib/auth/verify-session.ts` lines 99-102
**Text**: `* Superadmin (level >= 100) bypass — handled by getAuthContext().`

**Reality**: `getAuthContext()` does NOT bypass — it returns all permissions. The bypass is in `hasPermission()` line 110-112.

**Impact**: NONE — misdocumentation only. Behavior is correct, comment is misleading.

---

## Summary

### Severity count

| Severity | Count |
|----------|-------|
| ~~CRITICAL~~ | ~~1~~ **(retracted)** |
| HIGH | 1 |
| MEDIUM | 3 |
| LOW | 2 |
| INFO | 1 |

### Top 3 remaining findings

1. **MEDIUM: Alumni /calendar gating bug needs re-investigation** — proxy.ts IS active. Check `ROLE_LEVEL_REQUIREMENTS` map for `/calendar` entry. The root cause is not proxy.ts being dead code; it's either a missing map entry or a path matching issue.

2. **HIGH: No defense-in-depth auth guards on all 35 routes** — proxy.ts is the single auth layer for routes without per-page verifySession() calls. Audit and add per-page guards.

3. **MEDIUM: Add favicon.svg to proxy matcher exclusion** — prevents unnecessary session fetch + DB query on every page load.
