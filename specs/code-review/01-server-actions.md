# Code Review: Server Action Files

**Project**: sistren_next | **Role**: Codebase Scout  
**Date**: 2026-06-15 | **Scope**: All 15 action files in `src/actions/`  
**Method**: Systematic review per focus area — auth, validation, error handling, revalidation, FormData, soft delete, security.

---

## Summary

| Metric | Count |
|--------|-------|
| HIGH severity | 4 |
| MEDIUM severity | 9 |
| LOW severity | 5 |
| Total files | 15 |
| Total lines | 3,404 |

**Top 3 critical fixes:**
1. `calendar.ts` — no Zod validation on 4 functions; heavy `as string` casts with runtime type assertions that are compile-time only
2. `admin.ts` approveStudent/rejectStudent — no `revalidatePath()` call, causing UI staleness
3. `documents.ts` — `studentDocuments` queries missing `isNull(deletedAt)` filter (soft-delete bypass)

---

## 1. academic.ts — 635 lines

**Auth**: ✅ Good — all functions gate with `verifyRoleLevel(60)` or `verifyRoleLevel(80)` (assignTeacher/removeAssignment).  
**Zod**: ✅ Good — all schemas defined at top, `safeParse` used consistently.  
**Error handling**: ✅ Good — returns `{error: msg}`, no silent failures.  
**Revalidation**: ✅ All mutations call `revalidatePath()`.  
**FormData**: ✅ Passed through Zod schemas.  
**Soft delete**: ✅ `isNull(table.deletedAt)` on all SELECTs; `deletedAt: new Date()` on deletes.  
**Security**: ✅ Drizzle ORM — no raw SQL.

| Severity | Line | Description |
|----------|------|-------------|
| LOW | 618-635 | `*Action` wrapper functions (`createClassAction`, etc.) are no-op wrappers. TODO comment acknowledges this. Not a bug but technical debt. |

---

## 2. admin.ts — 151 lines

**Auth**: ✅ `verifyRoleLevel(80)` on all 4 functions.  
**Zod**: ❌ **No Zod** — `createStaffAccount` uses manual validation on `as string` casts (L60-76).  
**Error handling**: ✅ Returns `{error: msg}`. Try/catch in `createStaffAccount` (L110-119).  
**Revalidation**: ❌ **Missing** — `approveStudent` and `rejectStudent` do NOT call `revalidatePath()`.  
**FormData**: ❌ **Type-unsafe** — `formData.get("name") as string` (L60-63) with no Zod validation.  
**Soft delete**: ✅ `isNull(users.deletedAt)` on SELECTs.  
**Security**: ✅ Drizzle ORM, UUID strings.

| Severity | Line | Description |
|----------|------|-------------|
| MEDIUM | 10-33 | `approveStudent` — no `revalidatePath()` call after status change. UI won't refresh. |
| MEDIUM | 35-55 | `rejectStudent` — no `revalidatePath()` call after soft-delete. |
| MEDIUM | 60-63 | `createStaffAccount` — `formData.get("name") as string` without Zod validation. Manual field checks only. |
| LOW | 69-71 | `createStaffAccount` — password length hard-checked at 6, bypasses Zod. |

---

## 3. announcements.ts — 287 lines

**Auth**: ✅ Mixed pattern — `verifySession()` + manual `getAuthContext` role check, or `verifyRoleLevel(80)`. Both work.  
**Zod**: ✅ `announcementSchema.safeParse` on all create/update.  
**Error handling**: ✅ Returns `{error: msg}`, `if (!session) return {error: ...}` — but that branch is unreachable since `verifySession()` redirects.  
**Revalidation**: ✅ All mutations call `revalidatePath("/announcements")`.  
**FormData**: ✅ Through Zod.  
**Soft delete**: ✅ `isNull(announcements.deletedAt)` on SELECTs.  
**Security**: ✅ Drizzle ORM.

| Severity | Line | Description |
|----------|------|-------------|
| LOW | 20-21 | `if (!session) return []` — unreachable; `verifySession()` already redirects. Dead code. |
| LOW | 89-90 | Same dead check pattern on `deleteAnnouncement`. |

---

## 4. auth.ts — 36 lines

**Auth**: ✅ No auth (login page).  
**Zod**: ❌ **No Zod** — manual validation with `as string` casts (L8-9).  
**Error handling**: ✅ Try/catch with `NEXT_REDIRECT` re-throw. Returns `{error: msg}`.  
**Revalidation**: ✅ Not needed (login redirect).  
**FormData**: ❌ `formData.get("email") as string` (L8-9).  
**Soft delete**: ✅ N/A.  
**Security**: ✅ Uses better-auth `signInEmail`.

| Severity | Line | Description |
|----------|------|-------------|
| MEDIUM | 8-9 | `formData.get("email") as string` without Zod. Manual length check only. |

---

## 5. calendar.ts — 227 lines

**Auth**: ✅ `getEvents` uses `getOptionalSession()` (no redirect). Mutations use `verifyRoleLevel(80)`.  
**Zod**: ❌ **No Zod** — ALL 4 functions use manual validation with `as string` casts.  
**Error handling**: ✅ Manual checks, returns `{error: msg}`.  
**Revalidation**: ✅ All mutations call `revalidatePath("/calendar")` and `revalidatePath("/dashboard")`.  
**FormData**: ❌ Heavy `as string` usage (L103-109, L150-156). No Zod for field validation.  
**Soft delete**: ✅ `isNull(calendarEvents.deletedAt)` on SELECTs.  
**Security**: ❌ **Category type assertion is compile-time only** — `category as "academic" | "holiday"` (L131-137) is a TS cast, not runtime validation. Invalid values silently pass through.

| Severity | Line | Description |
|----------|------|-------------|
| HIGH | 100-145 | `createEvent` — no Zod validation. All fields manually parsed with `as string`. |
| HIGH | 147-204 | `updateEvent` — same issue, no Zod schema validation. |
| HIGH | 131-137 | `category as "academic" | "holiday"` — TypeScript type assertion is compile-time only, no runtime validation. Invalid category strings accepted. |
| MEDIUM | 103-109 | Manual `new Date(startAtStr)` — no date format validation beyond `Number.isNaN`. |

---

## 6. dashboard.ts — 327 lines

**Auth**: ✅ `verifySession()` on all query functions.  
**Zod**: ✅ Not needed (query functions return typed data).  
**Error handling**: ✅ Returns empty arrays / 0 defaults. No silent failures.  
**Revalidation**: ✅ Not needed (read-only).  
**FormData**: ✅ No FormData (all query params).  
**Soft delete**: ✅ `isNull` on all SELECTs.  
**Security**: ⚠️ `getStudentSppStatus` (L178-185) uses raw SQL template literal.

| Severity | Line | Description |
|----------|------|-------------|
| LOW | 178-185 | `getStudentSppStatus` uses raw `sql` template literal with `${userId}`. Parameterized via Drizzle so safe in practice, but bypasses ORM abstraction. |

---

## 7. documents.ts — 232 lines

**Auth**: ✅ `verifySession()` + `getAuthContext()` with permission check.  
**Zod**: ✅ No Zod, but `isValidDocumentType()` provides enum validation.  
**Error handling**: ✅ Try/catch on encrypt/decrypt. Returns `{error: msg}`.  
**Revalidation**: ✅ All mutations call `revalidatePath()`.  
**FormData**: ✅ Acceptable — `formData.get("file") as File | null`, `as string`.  
**Soft delete**: ❌ **Missing** — `studentDocuments` queries (L52-56, L120-124, L163-167) do NOT include `isNull(deletedAt)` filter.  
**Security**: ✅ Encrypted blob storage, file size cap, MIME mapping.

| Severity | Line | Description |
|----------|------|-------------|
| HIGH | 52-56 | `getDocuments` — `studentDocuments` SELECT missing `isNull(deletedAt)` — soft-deleted documents are still returned. |
| HIGH | 120-124 | `uploadDocument` — existing document check missing `isNull(deletedAt)`. |
| MEDIUM | 163-167 | `downloadDocument` — ditto, no soft-delete filter. |

---

## 8. enrollments.ts — 320 lines

**Auth**: ✅ `verifySession()` + role check via `getAuthContext()`.  
**Zod**: ❌ `createEnrollment` (L87-138) has NO Zod validation — manual `as string` + existence checks.  
**Error handling**: ✅ Returns `{error: msg}`. Try/catch in `bulkCreateEnrollment`.  
**Revalidation**: ✅ All mutations call `revalidatePath()`.  
**FormData**: ❌ `formData.get("studentId") as string` (L95-97).  
**Soft delete**: ✅ `isNull` on SELECTs.  
**Security**: ✅ Drizzle ORM.

| Severity | Line | Description |
|----------|------|-------------|
| MEDIUM | 95-101 | `createEnrollment` — no Zod schema. Manual `as string` + manual null checks. |

---

## 9. grades.ts — 289 lines

**Auth**: ✅ `verifyRoleLevel(60)` or `verifySession()` + permission check.  
**Zod**: ✅ `gradeTypeSchema.safeParse` for type validation.  
**Error handling**: ✅ Try/catch in `bulkUpsertGrades`. Returns `{error: msg}`.  
**Revalidation**: ✅ All mutations call `revalidatePath("/academic/grades")`.  
**FormData**: ❌ `as string` on 7 fields (L119-125). `(values as any)` bypasses type safety.  
**Soft delete**: ✅ `isNull` on SELECTs.  
**Security**: ✅ Drizzle ORM. `sql` template tags in bulkUpsert are parameterized.

| Severity | Line | Description |
|----------|------|-------------|
| MEDIUM | 119-125 | `upsertGrade` — 7 `as string` casts without Zod. |
| MEDIUM | 168-170 | `(values as any)` — type-safety bypassed on insert/update. |

---

## 10. paymentItems.ts — 218 lines

**Auth**: ⚠️ **`getActivePaymentItems()` has NO auth check** — public (L60-80). Others use `verifyRoleLevel(80)`.  
**Zod**: ❌ No Zod — manual `parseFloat` / `parseInt` / NaN checks.  
**Error handling**: ✅ Returns `{error: msg}`.  
**Revalidation**: ✅ All mutations call `revalidatePath()`.  
**FormData**: ❌ `formData.get(...) as string` throughout.  
**Soft delete**: ✅ `isNull` on SELECTs.  
**Security**: ✅ Drizzle ORM.

| Severity | Line | Description |
|----------|------|-------------|
| MEDIUM | 60-80 | `getActivePaymentItems` — no auth/permission check. Anyone can list payment items. |
| MEDIUM | 85-91, 131-137 | `createPaymentItem` / `updatePaymentItem` — no Zod, manual `parseFloat` + `parseInt`. |

---

## 11. payments.ts — 302 lines

**Auth**: ✅ `verifyRoleLevel(80)` on mutations; `verifySession()` + role check on reads.  
**Zod**: ✅ `paymentMethodSchema`, `recordPaymentSchema`, `idSchema` — all via `safeParse`.  
**Error handling**: ✅ Returns `{error: msg}`.  
**Revalidation**: ✅ All mutations call `revalidatePath()`.  
**FormData**: ✅ Through Zod schemas.  
**Soft delete**: ✅ `isNull` on SELECTs.  
**Security**: ✅ Drizzle ORM.

| Severity | Line | Description |
|----------|------|-------------|
| — | — | No issues. Best-practice implementation. |

---

## 12. profile.ts — 76 lines

**Auth**: ✅ `verifySession()` on both functions.  
**Zod**: ❌ No Zod — manual `as string` (L12-15).  
**Error handling**: ✅ Returns `{error: msg}`.  
**Revalidation**: ✅ Both functions call `revalidatePath("/profile")` and `/`.  
**FormData**: ❌ `formData.get("phone") as string` (L12-15).  
**Soft delete**: ✅ `isNull(profiles.deletedAt)` on SELECT.  
**Security**: ⚠️ Avatar stored as Base64 data URL in `users.image` column — no size validation beyond 1MB (L59-61).

| Severity | Line | Description |
|----------|------|-------------|
| MEDIUM | 12-15 | `updateProfile` — 4 `as string` casts without Zod validation. |
| LOW | 66 | Avatar stored as Base64 data URL in DB — large payloads inflate DB size. |

---

## 13. register.ts — 137 lines

**Auth**: ✅ No auth (registration).  
**Zod**: ✅ `registerSchema.safeParse` — full validation with refinement for password match.  
**Error handling**: ✅ Try/catch with `NEXT_REDIRECT` re-throw. Returns `{error: msg}`.  
**Revalidation**: ✅ Not needed (redirects to login).  
**FormData**: ✅ Passed through Zod with `?? ""` fallback.  
**Soft delete**: ✅ No SELECT needed.  
**Security**: ✅ Uses `auth.api.signUpEmail`.  
**Bug**: ❌ Lines 98-99 — **duplicate code**: `fatherName` assignment repeated twice. `motherName` never checked for duplication on L100-101.

| Severity | Line | Description |
|----------|------|-------------|
| LOW | 98-101 | Duplicate `fatherName` assignment (L98-99). `motherName` on L100-101 correct but reveals copy-paste error — `fatherName` checked twice, `motherName` once. |

---

## 14. religions.ts — 13 lines

**Auth**: ✅ No auth — public reference data. Acceptable.  
**Zod**: ✅ Not needed (read-only).  
**Error handling**: ✅ Returns DB result directly.  
**Revalidation**: ✅ Not needed.  
**FormData**: ✅ No FormData.  
**Soft delete**: ✅ `isNull(religions.deletedAt)` on SELECT.  
**Security**: ✅ Drizzle ORM.

| Severity | Line | Description |
|----------|------|-------------|
| — | — | No issues. |

---

## 15. settings.ts — 154 lines

**Auth**: ✅ `verifyRoleLevel(80)` or `verifyRoleLevel(100)`.  
**Zod**: ✅ `systemConfigValueSchema`, `schoolSettingsSchema` — both via `safeParse`.  
**Error handling**: ✅ Try/catch in `createSystemConfig` (L125). Returns `{error: msg}`.  
**Revalidation**: ✅ All mutations call `revalidatePath()` for both `/settings/school` and `/settings/system`.  
**FormData**: ✅ Through Zod.  
**Soft delete**: ✅ `isNull` on SELECTs.  
**Security**: ✅ Key validation via `isSystemConfigKey()`. Drizzle ORM.

| Severity | Line | Description |
|----------|------|-------------|
| — | — | No issues. Best-practice implementation. |

---

## Cross-Cutting Findings

### Pattern: Dead code in verifySession() callers

`announcements.ts`, `enrollments.ts`, `grades.ts` — functions that call `verifySession()` (which redirects on failure) then check `if (!session) return {error: ...}` — these branches are unreachable.

Example: `announcements.ts` L20-21, L89-90, `enrollments.ts` L21 (already in patterns).

**Recommendation**: Remove unreachable `if (!session)` guards after `verifySession()` calls. Use `getOptionalSession()` when null is a valid state.

### Pattern: Zod adoption by file

| File | Uses Zod? | Risk |
|------|-----------|------|
| academic.ts | ✅ Yes | — |
| admin.ts | ❌ No | MEDIUM |
| announcements.ts | ✅ Yes | — |
| auth.ts | ❌ No | MEDIUM |
| calendar.ts | ❌ No | HIGH |
| dashboard.ts | ✅ N/A (queries) | — |
| documents.ts | ⚠️ Partial (enum check) | — |
| enrollments.ts | ❌ Some (bulk via params), Not (createEnrollment) | MEDIUM |
| grades.ts | ⚠️ Partial (gradeTypeSchema only) | MEDIUM |
| paymentItems.ts | ❌ No | MEDIUM |
| payments.ts | ✅ Yes | — |
| profile.ts | ❌ No | MEDIUM |
| register.ts | ✅ Yes | — |
| religions.ts | ✅ N/A | — |
| settings.ts | ✅ Yes | — |

### Pattern: Auth gating consistency

All files gate appropriately. The only gaps:
- `paymentItems.ts:getActivePaymentItems()` — no auth (L60-80)

---

## Severity Tally

| Severity | Count |
|----------|-------|
| HIGH | 4 |
| MEDIUM | 9 |
| LOW | 5 |
| **Total** | **18** |

## Top 3 Critical Fixes

### 1. calendar.ts — HIGH (3 findings)
**Problem**: No Zod validation on any function. `as string` casts everywhere. `category as "academic" | "holiday"` is a compile-time-only assertion — any string passes at runtime.
**Fix**: Create `createEventSchema` and `updateEventSchema` with Zod, including `z.enum()` for category.

### 2. admin.ts — MEDIUM (2 findings)
**Problem**: `approveStudent` (L10) and `rejectStudent` (L35) do not call `revalidatePath()`. After approval/rejection, `/admin/approvals` page remains stale until manual refresh.
**Fix**: Add `revalidatePath("/admin/approvals")` before returning `{success: true}`.

### 3. documents.ts — HIGH (3 findings)
**Problem**: `studentDocuments` queries in `getDocuments`, `uploadDocument`, and `downloadDocument` do not filter `isNull(studentDocuments.deletedAt)`. Soft-deleted document rows are visible and downloadable.
**Fix**: Add `isNull(studentDocuments.deletedAt)` to all three query WHERE clauses.

---

## C4 Overview

### Context
**sistren_next** — Education management system (Next.js 16, React 19, TypeScript)
Server actions are the mutation layer between UI and database.

### Container
```
[Browser] → [Next.js Server Actions] → [Drizzle ORM] → [MariaDB]
                     ↓
          [better-auth session]
```

### Components (Server Actions)
```
src/actions/
├── academic.ts      — Classes, majors, subjects, semesters, teacher assignments
├── admin.ts         — Student approval/rejection, staff account mgmt
├── announcements.ts — CRUD + publish/unpublish + read receipts
├── auth.ts          — Login
├── calendar.ts      — Event CRUD
├── dashboard.ts     — Dashboard queries (stats, GPA, schedules)
├── documents.ts     — Student document upload/download with encryption
├── enrollments.ts   — Enrollment CRUD + bulk + status changes
├── grades.ts        — Grade query, upsert, bulk upsert, delete
├── paymentItems.ts  — Payment item CRUD
├── payments.ts      — Payment method CRUD, payment records
├── profile.ts       — Profile update, avatar upload
├── register.ts      — Student self-registration
├── religions.ts     — Religion list (public)
└── settings.ts      — School/system configuration
```

### Dependency Structure Matrix
```
                 academic  admin  anncmts  auth  cal  dash  doc  enroll  grades  payItems  pays  prof  reg  rel  settings
academic          ●
admin                        ●
announcements                ●      ●
auth                                                        ●
calendar                                 ●
dashboard                           ●                           ●
documents                                                        ●
enrollments                                                                 ●
grades                                                                                ●
paymentItems                                                                                       ●
payments                                                                                             ●
profile                                                                                                ●
register                                                                                                 ●
religions                                                                                                   ●
settings                                                                                                      ●
```

**Hub module**: `academic.ts` — touches 7 tables, 25 exported functions  
**Orphan module**: `religions.ts` — single query, no deps beyond db/schema  
**Shared deps**: All files depend on `@/lib/db`, `@/lib/auth/verify-session`

### Seams (change boundaries)
- **Validation layer**: Files with Zod (academic, announcements, payments, register, settings) can change validation independently of mutation logic.
- **Auth layer**: `verifySession()` / `verifyRoleLevel()` / `verifyPermission()` — centralized in `@/lib/auth/verify-session.ts`.
- **Files without Zod** (calendar, admin, auth, profile, paymentItems, enrollments parts, grades parts) — validation mixed with mutation, harder to change independently.
