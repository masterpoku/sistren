# Database Review: Schema, Seed, Migrations, Permissions

**Date**: 2026-06-15
**Scope**: All schema files in `src/lib/db/schema/`, seed scripts, migration SQL files, permissions module
**Reviewer**: Codebase Scout

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 5     |
| MEDIUM   | 6     |
| LOW      | 6     |

---

## HIGH Severity

### H1. Duplicate migration 0001 file

**File**: `drizzle/migrations/0001_glorious_exodus.sql` and `drizzle/migrations/0001_mean_payback.sql`
**Lines**: both files

Two SQL files share the same migration index `0001`. The journal (`_journal.json`) references `0001_glorious_exodus`, while `0001_mean_payback.sql` also exists with different content. Drizzle-kit uses the journal to determine which migrations have been applied. The extra file is ignored by the tooling but creates ambiguity — which one reflects the true DB state?

The two files contain different changes:
- `0001_glorious_exodus.sql` — adds `calendar_events` table, `audit_logs.entity_id_str`, `grades.teacher_id`, `system_configs.deleted_at`
- `0001_mean_payback.sql` — only UUID default updates and a `PRIMARY KEY` fix for `verifications`

These represent two different branches or consecutive runs. If a fresh DB runs migrations in alphabetical order, it will apply `0001_glorious_exodus.sql` (per journal). The extra file should be removed or reconciled.

**Fix**: Delete `0001_mean_payback.sql` after confirming `0001_glorious_exodus.sql` contains all necessary changes. If not, merge them.

---

### H2. `announcement_recipients` has no PRIMARY KEY in the database

**File**: `src/lib/db/schema/announcement_recipients.ts` line 31
**Migration**: `drizzle/migrations/0000_worthless_lady_mastermind.sql` lines 18-24

The schema uses an incorrect Drizzle syntax:
```ts
(table) => ({
  pk: { columns: [table.announcementId, table.userId] },
})
```

This produces NO primary key constraint in the generated SQL. Compare with `role_permissions.ts` which correctly uses:
```ts
pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
```

The migration 0000 SQL confirms the bug — `announcement_recipients` has no `PRIMARY KEY` clause, while `role_permissions` does. Without a PK, duplicate rows with the same (announcement_id, user_id) can be inserted silently.

**Fix**: Change `pk: { columns: [...] }` to `pk: primaryKey({ columns: [...] })` and generate a migration.

---

### H3. `users.roleId` foreign key ON DELETE CASCADE

**File**: `src/lib/db/schema/users.ts` lines 29-31
**Migration**: `0000_worthless_lady_mastermind.sql` line 413

```ts
roleId: bigint("role_id", { mode: "number" }).references(() => roles.id, {
  onDelete: "cascade",
}),
```

If a role row is deleted (even accidentally), ALL users with that role are cascade-deleted. Deleting the "siswa" role wipes all students. Deleting "guru" wipes all teachers. This is dangerous in any production system.

The correct behavior is `onDelete: "set null"` — if a role is removed, users keep existing but lose their role assignment.

**Fix**: Change to `onDelete: "set null"`.

---

### H4. `verifications` relation references `accounts.accountId` instead of `accounts.id`

**File**: `src/lib/db/schema/verifications.ts` lines 14-18

```ts
export const verificationsRelations = relations(verifications, ({ one }) => ({
  account: one(accounts, {
    fields: [verifications.identifier],
    references: [accounts.accountId],
  }),
}));
```

This creates an ORM relation that maps `verifications.identifier` → `accounts.accountId`. But `accounts.accountId` is NOT a unique key — it stores the OAuth/IDP account identifier (e.g., "google_12345"), and multiple accounts rows can have the same `accountId` (e.g., the same Google account linked to different users). This is not a valid one-to-one relationship.

The `verifications` table is a Better Auth internal table and likely doesn't need a Drizzle relation at all — or it should reference `accounts.id` with proper semantics.

**Fix**: Remove the relation, or change to reference `accounts.id` and use `verifications.identifier` as a string reference (acknowledging it's a loose lookup, not a FK).

---

### H5. Churn from `crypto.randomUUID()` in `default()` pollutes every migration

**Files**: `users.ts` line 23, `accounts.ts` line 6, `sessions.ts` line 6, `verifications.ts` line 6
**Files affected**: All migration files 0001-0009

Every schema file uses `default(crypto.randomUUID())` for the `id` column. Each time `drizzle-kit generate` runs, a new UUID is generated, producing a `MODIFY COLUMN ... DEFAULT 'new-uuid'` statement in every subsequent migration.

This is visible across migrations 0001-0009 — every single one contains 4x `ALTER TABLE ... MODIFY COLUMN id ... DEFAULT 'some-uuid'` for accounts, sessions, verifications, and users. These are no-op changes that bloat the migration history and create merge conflicts.

**Fix**: Remove `default(crypto.randomUUID())` from schema definitions. Let the application layer (or DB trigger) set the UUID on insert. Or use a fixed UUID that never changes after initial migration.

---

## MEDIUM Severity

### M1. Missing `deletedAt` on 6 tables

**Files**:
- `src/lib/db/schema/accounts.ts` — no `deletedAt`
- `src/lib/db/schema/sessions.ts` — no `deletedAt`
- `src/lib/db/schema/verifications.ts` — no `deletedAt`
- `src/lib/db/schema/announcement_recipients.ts` — no `deletedAt`
- `src/lib/db/schema/audit_logs.ts` — no `deletedAt`
- `src/lib/db/schema/profile_assets.ts` — no `deletedAt`

Memory rule states: "Soft delete: `isNull(table.deletedAt)` on every query". But these tables have no soft delete column. If the project requires soft delete everywhere, these need `deletedAt` added.

Accounts, sessions, and verifications may be intentional (Better Auth tables where hard delete is acceptable). But announcement_recipients, audit_logs, and profile_assets should have soft delete.

---

### M2. `users` schema relations are incomplete — missing many child table relations

**File**: `src/lib/db/schema/users.ts` lines 37-43

```ts
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { ... }),
  accounts: many(accounts),
}));
```

Missing `many()` relations for:
- `enrollments` (user as student)
- `payments` (user as student)
- `teacherClassSubjects` (user as teacher)
- `grades` (user as teacher)
- `announcements` (user as author)
- `announcementRecipients` (user as recipient)
- `auditLogs` (user as actor)
- `profileAssets`
- `studentDocuments`
- `calendarEvents` (user as creator)
- `attachments` (user as uploader)
- `userPermissions` (user having permission overrides)

Without these relations, Drizzle ORM cannot generate proper queries that walk from a user to their related entities. The individual child tables define their `one(user)` relation correctly, but the inverse `many()` on `users` is missing for most child tables.

---

### M3. Missing index on frequently queried FK columns

The following foreign key columns lack explicit indexes. MariaDB does NOT auto-index FKs (unlike InnoDB):

| Table | Column | Query pattern |
|-------|--------|---------------|
| `enrollments` | `student_id` | "What is student X enrolled in?" |
| `payments` | `student_id` | "What payments does student X have?" |
| `teacher_class_subjects` | `teacher_id` | "What does teacher X teach?" |
| `teacher_class_subjects` | `class_id` | "Who teaches class X?" |
| `teacher_class_subjects` | `semester_id` | "What's taught this semester?" |
| `grades` | `teacher_id` | "What grades did teacher X enter?" |
| `audit_logs` | `user_id` | "What did user X do?" |
| `announcement_recipients` | `user_id` | "What announcements for user X?" |
| `sessions` | `user_id` | "What sessions does user X have?" |
| `profiles` | `user_id` | (one-to-one, already efficient) |
| `calendar_events` | `created_by_id` | "What events did user X create?" |

The composite unique indexes on `enrollments(student_id, semester_id)` and on `grades(enrollment_id, subject_id, type)` provide partial coverage for their leftmost column. But the others are unindexed.

**Impact**: Sequential scans on these FK lookups as data grows.

---

### M4. `teacherClassSubjects` missing `updatedAt` column

**File**: `src/lib/db/schema/teacherClassSubjects.ts` line 31-32

Almost every other table has both `createdAt` and `updatedAt` with `onUpdateNow()`. This table only has `createdAt` and `deletedAt`. Minor inconsistency but means no automatic timestamp on updates.

---

### M5. No `payments.delete` permission defined

**File**: `src/lib/db/permissions.ts`

CRUD exist for every resource (users, students, teachers, enrollments, announcements), but payments only has `payments.create` + `payments.read_any` + `payments.read_own` + `payments.update` + `payments.approve` + `payments.generate_report`. No `payments.delete`.

This may be intentional (financial records are immutable) but the inconsistency should be documented.

---

### M6. `seedPermissions()` is an independent script that duplicates main seed logic

**File**: `src/lib/db/seed-permissions.ts`

The `seedPermissions()` function re-implements the same permission-seeding logic found in `seed.ts` lines 102-211. Both check for existing entries, handle soft-delete restoration, and assign permissions to roles. If one is updated but not the other, they drift.

**Risk**: If you run `seed.ts` (main seed) after `seed-permissions.ts`, or vice versa, they may conflict or double-create entries.

**Fix**: Either merge them into one path, or have `seed-permissions.ts` call the shared logic from `seed.ts`.

---

## LOW Severity

### L1. `religions` table has no `description` column

**File**: `src/lib/db/schema/religions.ts`

Other reference tables (majors, permissions) include a `description` text column. Religions only has `id`, `name`, `createdAt`, `updatedAt`, `deletedAt`. Minor inconsistency.

---

### L2. Permission list: missing domain coverage

**File**: `src/lib/db/permissions.ts`

No permissions defined for these features/domains:
- `audit_logs` — no read/export permission for audit trail
- `student_documents` — no upload/read/delete permissions
- `attachments` — no upload/read/delete permissions
- `profile_assets` — only `profile.assets.upload`, no `profile.assets.read` or `profile.assets.delete`
- `payment_items` — no manage permission (payment_items catalog management)
- `religions` — no manage permission for reference data

These may be gated by role level or not yet implemented. Flagging for awareness.

---

### L3. `alumni` role has only 2 permissions

**File**: `src/lib/db/permissions.ts` line 392

```ts
alumni: ["grades.read_own", "profile.edit_own"],
```

Alumni cannot read announcements, calendar events, or their own enrollment history. This seems overly restrictive for a read-only alumni role. Consider adding at minimum `announcements.read` and `calendar.read`.

---

### L4. `classes` schema imports `enrollments` but never uses it in a relation

**File**: `src/lib/db/schema/classes.ts` lines 3, 17-18

Imports `enrollments` from `./enrollments`, uses it in `many(enrollments)`. But the inverse relation from `enrollments` already points to `classes`. The `classesRelations` correctly declares `enrollments: many(enrollments)`. No bug, just noting the cross-import is necessary for the bidirectional relation.

---

### L5. Migrations 0002-0009 all contain UUID default churn

Already covered in H5 — each migration blindly updates the UUID defaults for 4 tables. This bloats the migration history by ~4 lines per migration × 8 migrations = 32 lines of no-op SQL.

---

### L6. `profiles` imports `religions` directly instead of from `./index`

**File**: `src/lib/db/schema/profiles.ts` line 13

```ts
import { religions } from "./religions";
```

Most other schema files import from `"./index"` (which re-exports all schemas). Direct import is inconsistent with the rest of the codebase — `subjects.ts` imports `classes, majors` from `"./index"`, `teacherClassSubjects.ts` imports from `"./index"`. No functional problem, just style inconsistency.

---

## Top 3 Critical Fixes

1. **H2 — `announcement_recipients` has no PK**: Wrong Drizzle syntax means the table has no primary key constraint. Duplicate rows possible. Fix the schema syntax and generate migration.

2. **H3 — `users.roleId` cascade deletes users when role deleted**: Change to `onDelete: "set null"` to prevent catastrophic data loss from accidental role deletion.

3. **H1 — Duplicate migration 0001 file**: Two SQL files with the same index create ambiguity. Remove `0001_mean_payback.sql` after verifying `0001_glorious_exodus.sql` covers all needed changes.
