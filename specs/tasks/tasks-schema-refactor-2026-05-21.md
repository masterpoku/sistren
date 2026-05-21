# specs/tasks/tasks-schema-refactor-2026-05-21.md

## Schema Rewrite — Complete Redesign from Better-auth + Drizzle First Principles

> **Starting from scratch.** Current schema is broken beyond repair. Complete redesign based on better-auth official requirements + Drizzle ORM idioms only. No salvage from existing code.

**Key Decisions (locked):**
- Registration: 2-phase (register → approval → complete profile + docs)
- Profiles: single table + `type` discriminator (`siswa`, `guru`, `admin`, `superadmin`)
- Attachments: polymorphic (`model_ref` + `id_ref`) — idiomatic Drizzle pattern
- Grades table: REMOVE (Rapor upload only)
- Audit log: append-only (auth, payment, document, profile events)

---

## Phase 1: Better-auth Core Tables

### 1.1 Define `users` table
**Why:** Core auth table. Only better-auth required fields + our custom `roleId`.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).notNull()`
- [ ] `email` — `varchar('email', { length: 255 }).unique().notNull()`
- [ ] `emailVerified` — `boolean('email_verified').default(false)` ← **CRITICAL: lowercase camelCase**
- [ ] `image` — `varchar('image', { length: 255 })`
- [ ] `password` — `varchar('password', { length: 255 }).notNull()`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [ ] `roleId` — `bigint('role_id', { mode: 'number' }).references(() => roles.id)` ← our custom field
- [ ] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 1.2 Define `accounts` table
**Why:** OAuth/provider accounts linked to users.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `userId` — `bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' })`
- [ ] `providerId` — `varchar('provider_id', { length: 255 }).notNull()`
- [ ] `accountId` — `varchar('account_id', { length: 255 })`
- [ ] `accessToken` — `text('access_token')`
- [ ] `refreshToken` — `text('refresh_token')`
- [ ] `idToken` — `text('id_token')`
- [ ] `expiresAt` — `timestamp('expires_at')`
- [ ] `password` — `varchar('password', { length: 255 })` ← for account-level password (OAuth with password fallback)
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 1.3 Define `sessions` table
**Why:** Session records for better-auth.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `userId` — `bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' })`
- [ ] `token` — `varchar('token', { length: 255 }).notNull().unique()`
- [ ] `expiresAt` — `timestamp('expires_at').notNull()`
- [ ] `ipAddress` — `varchar('ip_address', { length: 255 })`
- [ ] `userAgent` — `varchar('user_agent', { length: 255 })`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 1.4 Define `verifications` table
**Why:** Email verification tokens. **NO `id` column** — better-auth uses `identifier` + `token` as natural key.
- [ ] `identifier` — `varchar('identifier', { length: 255 }).notNull()`
- [ ] `token` — `varchar('token', { length: 255 }).notNull()`
- [ ] `expiresAt` — `timestamp('expires_at').notNull()`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 1.5 Define `roles` table
**Why:** Role definitions for RBAC.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).unique().notNull()`
- [ ] `description` — `varchar('description', { length: 255 })`
- [ ] `isDefault` — `boolean('is_default').default(false)` ← auto-assign on sign-up
- [ ] `level` — `int('level').default(0)` ← 100=superadmin, 80=admin, 60=guru, 40=siswa, 20=alumni
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 1.6 Define `permissions` table
**Why:** All available system permissions.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).unique().notNull()` ← e.g., `users.create`
- [ ] `description` — `text('description')`
- [ ] `resource` — `varchar('resource', { length: 100 }).notNull()` ← e.g., `users`
- [ ] `action` — `varchar('action', { length: 50 }).notNull()` ← e.g., `create`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 1.7 Define `role_permissions` table
**Why:** Role-permission pivot table.
- [ ] `roleId` — `bigint('role_id', { mode: 'number' }).notNull().references(() => roles.id, { onDelete: 'cascade' })`
- [ ] `permissionId` — `bigint('permission_id', { mode: 'number' }).notNull().references(() => permissions.id, { onDelete: 'cascade' })`

### 1.8 Define `user_permissions` table
**Why:** Per-user permission overrides (temporary grants or explicit denies).
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `userId` — `bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' })`
- [ ] `permissionId` — `bigint('permission_id', { mode: 'number' }).notNull().references(() => permissions.id, { onDelete: 'cascade' })`
- [ ] `granted` — `boolean('granted').notNull().default(true)` ← true=grant, false=deny
- [ ] `expiresAt` — `timestamp('expires_at')` ← null = permanent
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

---

## Phase 2: Academic Core Tables

### 2.1 Define `majors` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).notNull()`
- [ ] `description` — `text('description')`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 2.2 Define `classes` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).notNull()` ← e.g., "X IPA 1"
- [ ] `level` — `int('level')` ← 10, 11, 12
- [ ] `majorId` — `bigint('major_id', { mode: 'number' }).references(() => majors.id)`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 2.3 Define `subjects` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).notNull()`
- [ ] `code` — `varchar('code', { length: 50 })` ← e.g., "MAT101"
- [ ] `level` — `int('level')` ← 10, 11, 12
- [ ] `majorId` — `bigint('major_id', { mode: 'number' }).references(() => majors.id)` ← null for umum subjects
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 2.4 Define `semesters` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).notNull()` ← e.g., "Semester 1"
- [ ] `academicYear` — `varchar('academic_year', { length: 20 }).notNull()` ← e.g., "2026/2027"
- [ ] `isActive` — `boolean('is_active').default(false)`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 2.5 Define `enrollments` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `studentId` — `bigint('student_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' })`
- [ ] `semesterId` — `bigint('semester_id', { mode: 'number' }).notNull().references(() => semesters.id, { onDelete: 'cascade' })`
- [ ] `classId` — `bigint('class_id', { mode: 'number' }).notNull().references(() => classes.id, { onDelete: 'cascade' })`
- [ ] `status` — `mysqlEnum('status', ['active', 'transferred', 'dropped']).default('active')`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

---

## Phase 3: Profiles Table

### 3.1 Define `profiles` table
**Why:** Extended user data. Single table with `type` discriminator. Fixed from old PHP (all fields properly fillable, no duplicates).
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `userId` — `bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique()`
- [ ] `type` — `mysqlEnum('type', ['siswa', 'guru', 'admin', 'superadmin']).default('siswa')`
- [ ] `nisn` — `varchar('nisn', { length: 20 })` ← siswa only
- [ ] `nik` — `varchar('nik', { length: 255 })`
- [ ] `birthPlace` — `varchar('birth_place', { length: 100 })`
- [ ] `birthDate` — `date('birth_date')`
- [ ] `gender` — `mysqlEnum('gender', ['male', 'female']).default('male')`
- [ ] `religion` — `varchar('religion', { length: 50 })`
- [ ] `address` — `text('address')`
- [ ] `phone` — `varchar('phone', { length: 20 })`
- [ ] `previousSchool` — `varchar('previous_school', { length: 255 })`
- [ ] `majorId` — `bigint('major_id', { mode: 'number' }).references(() => majors.id)` ← nullable
- [ ] `section` — `varchar('section', { length: 10 })` ← A/B/C
- [ ] `enrolledAt` — `date('enrolled_at')`
- [ ] `diplomaNumber` — `varchar('diploma_number', { length: 255 })`
- [ ] `skhuNumber` — `varchar('skhu_number', { length: 255 })`
- [ ] `fatherName` — `varchar('father_name', { length: 255 })`
- [ ] `fatherNik` — `varchar('father_nik', { length: 255 })`
- [ ] `fatherOccupation` — `varchar('father_occupation', { length: 255 })`
- [ ] `fatherBirthPlace` — `varchar('father_birth_place', { length: 100 })`
- [ ] `fatherBirthDate` — `date('father_birth_date')`
- [ ] `fatherReligion` — `varchar('father_religion', { length: 50 })`
- [ ] `motherName` — `varchar('mother_name', { length: 255 })`
- [ ] `motherNik` — `varchar('mother_nik', { length: 255 })`
- [ ] `motherOccupation` — `varchar('mother_occupation', { length: 255 })`
- [ ] `motherBirthPlace` — `varchar('mother_birth_place', { length: 100 })`
- [ ] `motherBirthDate` — `date('mother_birth_date')`
- [ ] `motherReligion` — `varchar('mother_religion', { length: 50 })`
- [ ] `parentsAddress` — `text('parents_address')`
- [ ] `parentsPhone` — `varchar('parents_phone', { length: 20 })`
- [ ] `weightKg` — `int('weight_kg')`
- [ ] `heightCm` — `int('height_cm')`
- [ ] `uniformSize` — `varchar('uniform_size', { length: 10 })`
- [ ] `birthOrder` — `int('birth_order')`
- [ ] `siblingsCount` — `int('siblings_count')`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

---

## Phase 4: Attachments Table (Polymorphic)

### 4.1 Define `attachments` table
**Why:** Polymorphic file storage. Attachments for students (documents), announcements, etc. use same table via `model_ref` + `id_ref`.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `modelRef` — `varchar('model_ref', { length: 100 }).notNull()` ← e.g., `'student'`, `'announcement'`
- [ ] `idRef` — `bigint('id_ref', { mode: 'number' }).notNull()` ← FK to the referenced entity
- [ ] `documentType` — `varchar('document_type', { length: 50 }).notNull()` ← e.g., `'ijasah'`, `'skhun'`, `'kk'`, `'rapor'`, `'pass_foto'`
- [ ] `fileName` — `varchar('file_name', { length: 255 }).notNull()`
- [ ] `mimeType` — `varchar('mime_type', { length: 100 }).notNull()`
- [ ] `size` — `bigint('size', { mode: 'number' }).notNull()` ← bytes
- [ ] `data` — `mediumblob('data').notNull()` ← encrypted blob
- [ ] `uploadedBy` — `bigint('uploaded_by', { mode: 'number' }).notNull().references(() => users.id)`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `deletedAt` — `timestamp('deleted_at')` ← soft delete per file

**Document types for `document_type` field:**
- `ijasah` — Ijazah
- `skhun` — SKHUN
- `skl` — Surat Keterangan Lulus
- `akta_kelahiran` — Akta Kelahiran
- `kk` — Kartu Keluarga ← **was dropped in old system, now fixed**
- `ktp_ayah` — KTP Ayah
- `ktp_ibu` — KTP Ibu
- `kip` — KIP
- `pass_foto` — Pas Foto
- `rapor` — Rapor

---

## Phase 5: Financial Tables

### 5.1 Define `payment_methods` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `name` — `varchar('name', { length: 255 }).notNull()` ← e.g., "Bank BCA", "Cash"
- [ ] `type` — `mysqlEnum('type', ['bank', 'cash', 'virtual_account']).default('cash')`
- [ ] `accountNumber` — `varchar('account_number', { length: 50 })` ← bank account number
- [ ] `isActive` — `boolean('is_active').default(true)`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 5.2 Define `payments` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `studentId` — `bigint('student_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' })`
- [ ] `methodId` — `bigint('method_id', { mode: 'number' }).notNull().references(() => payment_methods.id)`
- [ ] `amount` — `decimal('amount', { precision: 12, scale: 2 }).notNull()`
- [ ] `period` — `varchar('period', { length: 20 }).notNull()` ← e.g., "2026-07" or "SPP-01"
- [ ] `type` — `mysqlEnum('type', ['spp', 'variable']).default('spp')`
- [ ] `description` — `varchar('description', { length: 255 })`
- [ ] `paidAt` — `timestamp('paid_at')` ← null if unpaid
- [ ] `confirmedBy` — `bigint('confirmed_by', { mode: 'number' }).references(() => users.id)` ← admin who confirmed
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

---

## Phase 6: Announcements Table

### 6.1 Define `announcements` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `title` — `varchar('title', { length: 255 }).notNull()`
- [ ] `content` — `text('content').notNull()`
- [ ] `category` — `varchar('category', { length: 50 })`
- [ ] `priority` — `mysqlEnum('priority', ['low', 'normal', 'high']).default('normal')`
- [ ] `isPublished` — `boolean('is_published').default(false)`
- [ ] `createdBy` — `bigint('created_by', { mode: 'number' }).notNull().references(() => users.id)`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`
- [ ] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [ ] `publishedAt` — `timestamp('published_at')`

### 6.2 Define `announcement_recipients` table
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `announcementId` — `bigint('announcement_id', { mode: 'number' }).notNull().references(() => announcements.id, { onDelete: 'cascade' })`
- [ ] `recipientId` — `bigint('recipient_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' })`
- [ ] `readAt` — `timestamp('read_at')` ← null if unread

---

## Phase 7: Audit Log Table

### 7.1 Define `audit_logs` table
**Why:** Append-only audit trail. Tracks auth events, payments, documents, profile changes.
- [ ] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [ ] `userId` — `bigint('user_id', { mode: 'number' })` ← nullable (for anonymous failures)
- [ ] `action` — `varchar('action', { length: 100 }).notNull()` ← `auth.login`, `auth.logout`, `auth.fail`, `auth.register`, `payment.confirmed`, `document.uploaded`, `profile.updated`
- [ ] `entityType` — `varchar('entity_type', { length: 100 })` ← e.g., `'user'`, `'payment'`, `'attachment'`
- [ ] `entityId` — `bigint('entity_id', { mode: 'number' })` ← the affected record
- [ ] `metadata` — `json('metadata')` ← additional context (IP, user agent, change summary)
- [ ] `ipAddress` — `varchar('ip_address', { length: 45 })`
- [ ] `userAgent` — `varchar('user_agent', { length: 255 })`
- [ ] `createdAt` — `timestamp('created_at').defaultNow()`

---

## Phase 8: Schema Setup

### 8.1 Create schema files
- [ ] Create `src/lib/db/schema/users.ts` — better-auth users table
- [ ] Create `src/lib/db/schema/accounts.ts` — OAuth accounts
- [ ] Create `src/lib/db/schema/sessions.ts` — sessions
- [ ] Create `src/lib/db/schema/verifications.ts` — email verification (NO id)
- [ ] Create `src/lib/db/schema/roles.ts` — roles
- [ ] Create `src/lib/db/schema/permissions.ts` — permissions
- [ ] Create `src/lib/db/schema/role_permissions.ts` — pivot
- [ ] Create `src/lib/db/schema/user_permissions.ts` — overrides
- [ ] Create `src/lib/db/schema/profiles.ts` — single table with type discriminator
- [ ] Create `src/lib/db/schema/majors.ts` — majors
- [ ] Create `src/lib/db/schema/classes.ts` — classes
- [ ] Create `src/lib/db/schema/subjects.ts` — subjects
- [ ] Create `src/lib/db/schema/semesters.ts` — semesters
- [ ] Create `src/lib/db/schema/enrollments.ts` — enrollments
- [ ] Create `src/lib/db/schema/attachments.ts` — polymorphic attachments
- [ ] Create `src/lib/db/schema/payment_methods.ts` — payment methods
- [ ] Create `src/lib/db/schema/payments.ts` — payment records
- [ ] Create `src/lib/db/schema/announcements.ts` — announcements
- [ ] Create `src/lib/db/schema/announcement_recipients.ts` — read tracking
- [ ] Create `src/lib/db/schema/audit_logs.ts` — audit trail

### 8.2 Update schema/index.ts
- [ ] Export all new schema files
- [ ] Pass full schema object to better-auth drizzleAdapter

### 8.3 Create crypto utility
- [ ] Create `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt
- [ ] Validate `DOCUMENT_ENCRYPTION_KEY` is 32 bytes at startup
- [ ] Export `encryptBlob(Buffer): Buffer` and `decryptBlob(Buffer): Buffer`

### 8.4 Create better-auth config
- [ ] Update `src/lib/auth/index.ts` with fresh config
- [ ] Configure `additionalFields: { roleId: { type: 'number' } }`
- [ ] Add `nextCookies()` plugin
- [ ] Configure `usePlural: true`
- [ ] Disable `experimental.joins` (MariaDB incompatibility)

### 8.5 Create auth client
- [ ] Create `src/lib/auth-client.ts` — client-side auth instance

### 8.6 Update AGENTS.md
- [ ] Document new env vars: `DOCUMENT_ENCRYPTION_KEY`
- [ ] Document new schema structure

### 8.7 Generate initial migration
- [ ] Run `bunx drizzle-kit generate`
- [ ] Verify migration SQL looks correct
- [ ] Run `bun run typecheck` — should pass with zero errors

### 8.8 Seed database
- [ ] Run `bun run db:seed` — creates roles, permissions, default admin account
- [ ] Verify seed data in database

---

## Verification Checklist

After all tasks:
- [ ] `bun run typecheck` passes — zero errors
- [ ] `bun run db:test` connects successfully
- [ ] `bunx drizzle-kit generate` produces clean migration
- [ ] Login/register flow works end-to-end
- [ ] Attachment upload encrypts and stores blob correctly
- [ ] Audit log captures events
- [ ] No reference to old PHP schema code anywhere in codebase