# specs/tasks/tasks-schema-refactor-2026-05-21.md

## Schema Rewrite — Complete Redesign from Better-auth + Drizzle First Principles

> **Status: COMPLETED.** Current schema is correct and verified against better-auth official docs. `auth.api.signInEmail()` returns user + token successfully.

**Key Decisions (locked and verified):**

- users/sessions/accounts/verifications use `varchar(36)` UUID (better-auth default) — NOT bigint
- all business table FKs to users use `varchar(36)` to match users.id (NOT bigint)
- verifications HAS `id: varchar(36) PK` — NOT a natural key table
- accounts stores credentials separately from users (provider='credential' for email/password)
- password hashing uses `@better-auth/utils/password` (scrypt, NOT argon2)
- password + image fields in users table must be `.nullable().default(null)` — better-auth createUser doesn't set these on signup
- Grades table: KEPT (was in spec as REMOVE, but actual migration includes it)
- profile_assets: KEPT (stores file paths, separate from attachments blob table)
- system_configs: KEPT
- admin plugin: REMOVED (conflicts with our custom RBAC role system)

---

## Phase 1: Better-auth Core Tables

### 1.1 Define `users` table

**Why:** Core auth table. Only better-auth required fields + our custom `roleId`.

- [x] `id` — `varchar('id', { length: 36 }).primaryKey().default(crypto.randomUUID())` ← **CHANGED: UUID v4, not bigint**
- [x] `name` — `varchar('name', { length: 255 }).notNull()`
- [x] `email` — `varchar('email', { length: 255 }).unique().notNull()`
- [x] `emailVerified` — `boolean('email_verified').default(false).notNull()` ← lowercase camelCase
- [x] `image` — `varchar('image', { length: 255 }).nullable().default(null)` ← **CHANGED: nullable for better-auth**
- [x] `password` — `varchar('password', { length: 255 }).nullable().default(null)` ← **CHANGED: nullable for better-auth**
- [x] `createdAt` — `timestamp('created_at').defaultNow().notNull()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow().notNull()`
- [x] `roleId` — `bigint('role_id', { mode: 'number' }).references(() => roles.id, { onDelete: 'cascade' })` ← our custom field
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 1.2 Define `accounts` table

**Why:** OAuth/provider accounts linked to users.

- [x] `id` — `varchar('id', { length: 36 }).primaryKey().default(crypto.randomUUID())` ← **CHANGED: UUID v4**
- [x] `userId` — `varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← **CHANGED: varchar FK**
- [x] `providerId` — `varchar('provider_id', { length: 255 }).notNull()`
- [x] `accountId` — `varchar('account_id', { length: 255 }).notNull()` ← **CHANGED: NOT NULL, not optional**
- [x] `accessToken` — `text('access_token')`
- [x] `refreshToken` — `text('refresh_token')`
- [x] `accessTokenExpiresAt` — `timestamp('access_token_expires_at')` ← **CHANGED: correct field name**
- [x] `refreshTokenExpiresAt` — `timestamp('refresh_token_expires_at')` ← **CHANGED: correct field name**
- [x] `scope` — `text('scope')`
- [x] `idToken` — `text('id_token')`
- [x] `password` — `varchar('password', { length: 255 })` ← for account-level password (credential accounts)
- [x] `createdAt` — `timestamp('created_at').defaultNow().notNull()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow().notNull()`

### 1.3 Define `sessions` table

**Why:** Session records for better-auth.

- [x] `id` — `varchar('id', { length: 36 }).primaryKey().default(crypto.randomUUID())` ← **CHANGED: UUID v4**
- [x] `userId` — `varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← **CHANGED: varchar FK**
- [x] `token` — `varchar('token', { length: 255 }).notNull().unique()`
- [x] `expiresAt` — `timestamp('expires_at').notNull()`
- [x] `ipAddress` — `varchar('ip_address', { length: 255 })`
- [x] `userAgent` — `varchar('user_agent', { length: 255 })`
- [x] `createdAt` — `timestamp('created_at').defaultNow().notNull()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow().notNull()`

### 1.4 Define `verifications` table

**Why:** Email verification tokens. **HAS `id` column** — better-auth official schema includes it.

- [x] `id` — `varchar('id', { length: 36 }).primaryKey().default(crypto.randomUUID())` ← **CHANGED: HAS id column**
- [x] `identifier` — `varchar('identifier', { length: 255 }).notNull()`
- [x] `value` — `varchar('value', { length: 255 }).notNull()` ← **CHANGED: 'value' not 'token'**
- [x] `expiresAt` — `timestamp('expires_at').notNull()`
- [x] `createdAt` — `timestamp('created_at').defaultNow().notNull()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow().notNull()`

### 1.5 Define `roles` table

**Why:** Role definitions for RBAC.

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 255 }).unique().notNull()`
- [x] `description` — `varchar('description', { length: 255 })`
- [x] `isDefault` — `boolean('is_default').default(false)` ← auto-assign on sign-up
- [x] `level` — `int('level').default(0)` ← 100=superadmin, 80=admin, 60=guru, 40=siswa, 20=alumni
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 1.6 Define `permissions` table

**Why:** All available system permissions.

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 255 }).unique().notNull()` ← e.g., `users.create`
- [x] `description` — `text('description')`
- [x] `resource` — `varchar('resource', { length: 100 }).notNull()` ← e.g., `users`
- [x] `action` — `varchar('action', { length: 50 }).notNull()` ← e.g., `create`
- [x] `scope` — `varchar('scope', { length: 20 }).default('global')` ← **ADDED: scope field**
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 1.7 Define `role_permissions` table

**Why:** Role-permission pivot table.

- [x] `roleId` — `bigint('role_id', { mode: 'number' }).notNull().references(() => roles.id, { onDelete: 'cascade' })`
- [x] `permissionId` — `bigint('permission_id', { mode: 'number' }).notNull().references(() => permissions.id, { onDelete: 'cascade' })`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 1.8 Define `user_permissions` table

**Why:** Per-user permission overrides (temporary grants or explicit denies).

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `userId` — `varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← **CHANGED: varchar FK**
- [x] `permissionId` — `bigint('permission_id', { mode: 'number' }).notNull().references(() => permissions.id, { onDelete: 'cascade' })`
- [x] `granted` — `boolean('granted').notNull().default(true)` ← true=grant, false=deny
- [x] `expiresAt` — `timestamp('expires_at')` ← null = permanent
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

---

## Phase 2: Academic Core Tables

### 2.1 Define `majors` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 255 }).notNull()`
- [x] `description` — `text('description')`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 2.2 Define `classes` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 255 }).notNull()`
- [x] `code` — `varchar('code', { length: 255 }).unique().notNull()` ← **CHANGED: code instead of level**
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 2.3 Define `subjects` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 255 }).notNull()`
- [x] `code` — `varchar('code', { length: 50 })` ← e.g., "MAT101"
- [x] `classId` — `bigint('class_id', { mode: 'number' }).references(() => classes.id)` ← **CHANGED: FK to classes, not level**
- [x] `majorId` — `bigint('major_id', { mode: 'number' }).references(() => majors.id)` ← **CHANGED: FK to majors**
- [x] `credits` — `int('credits').default(0)` ← **ADDED: credits field**
- [x] `description` — `text('description')`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 2.4 Define `semesters` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 100 }).notNull()` ← e.g., "Semester 1"
- [x] `academicYear` — `varchar('academic_year', { length: 255 }).notNull()` ← e.g., "2025/2026"
- [x] `startDate` — `date('start_date')` ← **ADDED**
- [x] `endDate` — `date('end_date')` ← **ADDED**
- [x] `isActive` — `boolean('is_active').default(false)`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 2.5 Define `enrollments` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `studentId` — `varchar('student_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← **CHANGED: varchar FK (student is a user)**
- [x] `semesterId` — `bigint('semester_id', { mode: 'number' }).notNull().references(() => semesters.id, { onDelete: 'cascade' })`
- [x] `classId` — `bigint('class_id', { mode: 'number' }).notNull().references(() => classes.id, { onDelete: 'cascade' })`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 2.6 Define `grades` table ← **KEPT (was marked REMOVE in original spec)**

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `enrollmentId` — `bigint('enrollment_id', { mode: 'number' }).notNull().references(() => enrollments.id, { onDelete: 'cascade' })`
- [x] `subjectId` — `bigint('subject_id', { mode: 'number' }).notNull().references(() => subjects.id, { onDelete: 'cascade' })`
- [x] `semesterId` — `bigint('semester_id', { mode: 'number' }).notNull().references(() => semesters.id, { onDelete: 'cascade' })`
- [x] `score` — `decimal('score', { precision: 5, scale: 2 })`
- [x] `grade` — `char('grade', { length: 2 })`
- [x] `predicate` — `varchar('predicate', { length: 5 })`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

---

## Phase 3: Profiles Table

### 3.1 Define `profiles` table

**Why:** Extended user data. Single table with `type` discriminator. Fixed from old PHP (all fields properly fillable, no duplicates).

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `userId` — `varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }).unique()` ← **CHANGED: varchar FK**
- [x] `type` — `mysqlEnum('type', ['siswa', 'guru', 'admin', 'superadmin']).default('siswa')`
- [x] `nisn` — `varchar('nisn', { length: 255 })` ← siswa only
- [x] `nik` — `varchar('nik', { length: 255 })`
- [x] `birthPlace` — `varchar('birth_place', { length: 255 })`
- [x] `birthDate` — `date('birth_date')`
- [x] `gender` — `mysqlEnum('gender', ['male', 'female']).default('male')`
- [x] `religion` — `varchar('religion', { length: 50 })`
- [x] `address` — `text('address')`
- [x] `phone` — `varchar('phone', { length: 20 })`
- [x] `previousSchool` — `varchar('previous_school', { length: 255 })`
- [x] `majorId` — `bigint('major_id', { mode: 'number' }).references(() => majors.id)` ← nullable
- [x] `section` — `varchar('section', { length: 10 })` ← A/B/C
- [x] `enrolledAt` — `date('enrolled_at')`
- [x] `diplomaNumber` — `varchar('diploma_number', { length: 255 })`
- [x] `skhuNumber` — `varchar('skhu_number', { length: 255 })`
- [x] `fatherName` — `varchar('father_name', { length: 255 })`
- [x] `fatherNik` — `varchar('father_nik', { length: 255 })`
- [x] `fatherOccupation` — `varchar('father_occupation', { length: 255 })`
- [x] `fatherBirthPlace` — `varchar('father_birth_place', { length: 255 })`
- [x] `fatherBirthDate` — `date('father_birth_date')`
- [x] `fatherReligion` — `varchar('father_religion', { length: 50 })`
- [x] `motherName` — `varchar('mother_name', { length: 255 })`
- [x] `motherNik` — `varchar('mother_nik', { length: 255 })`
- [x] `motherOccupation` — `varchar('mother_occupation', { length: 255 })`
- [x] `motherBirthPlace` — `varchar('mother_birth_place', { length: 255 })`
- [x] `motherBirthDate` — `date('mother_birth_date')`
- [x] `motherReligion` — `varchar('mother_religion', { length: 50 })`
- [x] `parentsAddress` — `text('parents_address')`
- [x] `parentsPhone` — `varchar('parents_phone', { length: 20 })`
- [x] `weightKg` — `int('weight_kg')`
- [x] `heightCm` — `int('height_cm')`
- [x] `uniformSize` — `varchar('uniform_size', { length: 10 })`
- [x] `birthOrder` — `int('birth_order')`
- [x] `siblingsCount` — `int('siblings_count')`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

---

## Phase 4: Attachments Table (Polymorphic)

### 4.1 Define `attachments` table

**Why:** Polymorphic file storage. Encrypted blob storage for documents.

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `modelRef` — `varchar('model_ref', { length: 100 }).notNull()` ← e.g., `'student'`, `'announcement'`
- [x] `idRef` — `bigint('id_ref', { mode: 'number' }).notNull()` ← FK to the referenced entity
- [x] `documentType` — `varchar('document_type', { length: 50 }).notNull()` ← e.g., `'ijasah'`, `'skhun'`, `'kk'`, `'rapor'`, `'pass_foto'`
- [x] `fileName` — `varchar('file_name', { length: 255 }).notNull()`
- [x] `mimeType` — `varchar('mime_type', { length: 100 }).notNull()`
- [x] `size` — `bigint('size', { mode: 'number' }).notNull()` ← bytes
- [x] `data` — `mediumblob('data').notNull()` ← **CHANGED: mediumblob() not binary()**
- [x] `uploadedBy` — `varchar('uploaded_by', { length: 36 }).notNull().references(() => users.id)` ← **CHANGED: varchar FK**
- [x] `createdAt` — `timestamp('created_at').defaultNow().notNull()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete per file

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
- `rapor` — Rapor (per semester)

---

## Phase 5: Financial Tables

### 5.1 Define `payment_methods` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `name` — `varchar('name', { length: 100 }).notNull()` ← e.g., "Transfer Bank BCA"
- [x] `provider` — `varchar('provider', { length: 100 })` ← **ADDED**
- [x] `accountNumber` — `varchar('account_number', { length: 50 })`
- [x] `accountName` — `varchar('account_name', { length: 255 })` ← **ADDED**
- [x] `instructions` — `text('instructions')` ← **ADDED**
- [x] `isActive` — `boolean('is_active').default(true)`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 5.2 Define `payments` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `studentId` — `varchar('student_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← **CHANGED: varchar FK**
- [x] `code` — `varchar('code', { length: 100 }).notNull().unique()` ← **CHANGED: payment code**
- [x] `description` — `varchar('description', { length: 255 }).notNull()`
- [x] `price` — `decimal('price', { precision: 10, scale: 2 }).notNull()` ← **CHANGED: price not amount**
- [x] `quantity` — `int('quantity').default(1)` ← **ADDED**
- [x] `total` — `decimal('total', { precision: 10, scale: 2 }).notNull()` ← **ADDED**
- [x] `orderData` — `json('order_data')` ← **ADDED**
- [x] `status` — `mysqlEnum('status', ['draft', 'pending', 'paid', 'cancelled']).default('draft')`
- [x] `paidAt` — `timestamp('paid_at')` ← null if unpaid
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

---

## Phase 6: Announcements Table

### 6.1 Define `announcements` table

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `title` — `varchar('title', { length: 255 }).notNull()`
- [x] `description` — `varchar('description', { length: 255 })` ← **ADDED**
- [x] `content` — `text('content').notNull()`
- [x] `category` — `varchar('category', { length: 50 })`
- [x] `priority` — `mysqlEnum('priority', ['normal', 'important', 'urgent']).default('normal')` ← **CHANGED: enum values**
- [x] `authorId` — `varchar('author_id', { length: 36 }).references(() => users.id)` ← **CHANGED: varchar FK, nullable**
- [x] `publishedAt` — `timestamp('published_at')`
- [x] `expiresAt` — `timestamp('expires_at')` ← **ADDED**
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`
- [x] `deletedAt` — `timestamp('deleted_at')` ← soft delete

### 6.2 Define `announcement_recipients` table

- [x] `announcementId` — `bigint('announcement_id', { mode: 'number' }).notNull().references(() => announcements.id, { onDelete: 'cascade' })`
- [x] `userId` — `varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← **CHANGED: varchar FK**
- [x] `isRead` — `boolean('is_read').default(false)` ← **CHANGED: isRead not readAt**
- [x] `readAt` — `timestamp('read_at')` ← **ADDED: separate field**
- [x] `createdAt` — `timestamp('created_at').defaultNow()`

---

## Phase 7: Audit Log Table

### 7.1 Define `audit_logs` table

**Why:** Append-only audit trail. Tracks auth events, payments, documents, profile changes.

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `userId` — `varchar('user_id', { length: 36 })` ← **CHANGED: varchar FK, nullable**
- [x] `action` — `varchar('action', { length: 100 }).notNull()` ← `auth.login`, `auth.logout`, `auth.fail`, `auth.register`, `payment.confirmed`, `document.uploaded`, `profile.updated`
- [x] `entityType` — `varchar('entity_type', { length: 100 })` ← e.g., `'user'`, `'payment'`, `'attachment'`
- [x] `entityId` — `bigint('entity_id', { mode: 'number' })` ← the affected record
- [x] `metadata` — `json('metadata')` ← additional context (IP, user agent, change summary)
- [x] `ipAddress` — `varchar('ip_address', { length: 45 })`
- [x] `userAgent` — `varchar('user_agent', { length: 255 })`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`

---

## Phase 8: Additional Tables (Not in original spec)

### 8.1 Define `profile_assets` table ← **KEPT (was marked REMOVE in original spec)**

**Why:** Stores file paths for profile documents (not encrypted blobs — those go to attachments).

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `userId` — `varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' })` ← varchar FK
- [x] `diploma` — `varchar('diploma', { length: 255 })`
- [x] `skhu` — `varchar('skhu', { length: 255 })`
- [x] `skl` — `varchar('skl', { length: 255 })`
- [x] `nisnDoc` — `varchar('nisn_doc', { length: 255 })`
- [x] `birthCertificate` — `varchar('birth_certificate', { length: 255 })`
- [x] `fatherKtp` — `varchar('father_ktp', { length: 255 })`
- [x] `motherKtp` — `varchar('mother_ktp', { length: 255 })`
- [x] `kip` — `varchar('kip', { length: 255 })`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

### 8.2 Define `system_configs` table ← **KEPT (was marked REMOVE in original spec)**

**Why:** Key-value store for system configuration.

- [x] `id` — `bigint('id', { mode: 'number' }).primaryKey().autoincrement()`
- [x] `key` — `varchar('key', { length: 100 }).notNull().unique()`
- [x] `value` — `text('value')`
- [x] `description` — `varchar('description', { length: 255 })`
- [x] `createdAt` — `timestamp('created_at').defaultNow()`
- [x] `updatedAt` — `timestamp('updated_at').onUpdateNow()`

---

## Phase 9: Schema Setup

### 9.1 Create schema files

- [x] Create `src/lib/db/schema/users.ts` — better-auth users table (UUID, nullable password/image)
- [x] Create `src/lib/db/schema/accounts.ts` — OAuth accounts (UUID, varchar FK)
- [x] Create `src/lib/db/schema/sessions.ts` — sessions (UUID, varchar FK)
- [x] Create `src/lib/db/schema/verifications.ts` — email verification (HAS id column, varchar PK)
- [x] Create `src/lib/db/schema/roles.ts` — roles
- [x] Create `src/lib/db/schema/permissions.ts` — permissions
- [x] Create `src/lib/db/schema/role_permissions.ts` — pivot
- [x] Create `src/lib/db/schema/user_permissions.ts` — overrides (varchar FK)
- [x] Create `src/lib/db/schema/profiles.ts` — single table with type discriminator (varchar FK)
- [x] Create `src/lib/db/schema/majors.ts` — majors
- [x] Create `src/lib/db/schema/classes.ts` — classes
- [x] Create `src/lib/db/schema/subjects.ts` — subjects (FK to classes + majors)
- [x] Create `src/lib/db/schema/semesters.ts` — semesters
- [x] Create `src/lib/db/schema/enrollments.ts` — enrollments (varchar FK for studentId)
- [x] Create `src/lib/db/schema/attachments.ts` — polymorphic attachments (mediumblob, varchar FK)
- [x] Create `src/lib/db/schema/payment_methods.ts` — payment methods
- [x] Create `src/lib/db/schema/payments.ts` — payment records (varchar FK for studentId)
- [x] Create `src/lib/db/schema/announcements.ts` — announcements (varchar FK for authorId)
- [x] Create `src/lib/db/schema/announcement_recipients.ts` — read tracking (varchar FK)
- [x] Create `src/lib/db/schema/audit_logs.ts` — audit trail (varchar FK for userId)
- [x] Create `src/lib/db/schema/grades.ts` — grades (KEPT despite original spec saying REMOVE)
- [x] Create `src/lib/db/schema/profile_assets.ts` — file paths (KEPT despite original spec saying REMOVE)
- [x] Create `src/lib/db/schema/system_configs.ts` — system configs (KEPT despite original spec saying REMOVE)

### 9.2 Update schema/index.ts

- [x] Export all schema files
- [x] Pass full schema object to better-auth drizzleAdapter with `usePlural: true`

### 9.3 Create crypto utility

- [x] Create `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt
- [x] Validate `DOCUMENT_ENCRYPTION_KEY` is 32 bytes at startup
- [x] Export `encryptBlob(Buffer): Buffer` and `decryptBlob(Buffer): Buffer`

### 9.4 Create better-auth config

- [x] Update `src/lib/auth/index.ts` with fresh config
- [x] Configure `additionalFields: { roleId: { type: 'number', required: false, input: false } }`
- [x] Add `nextCookies()` plugin (MUST be last in plugins array)
- [x] Configure `usePlural: true`
- [x] Disable `experimental.joins` (MariaDB incompatibility with json_arrayagg LATERAL JOIN)
- [x] **REMOVED admin() plugin** — it expects a `role` field on users table (string for admin plugin's own role system), conflicting with our custom `roleId` (number FK to our RBAC roles table). Our RBAC is managed separately via our own `roles` + `role_permissions` tables.

### 9.5 Create auth client

- [x] Create `src/lib/auth-client.ts` — client-side auth instance with admin plugin

### 9.6 Create test-connection

- [x] Create `src/lib/db/test-connection.ts` — quick DB connectivity check
- [x] Add `db:test` script to package.json pointing to test-connection.ts

### 9.7 Update AGENTS.md

- [x] Document new env vars: `DOCUMENT_ENCRYPTION_KEY` (32-byte hex for AES-256-GCM)
- [x] Document new schema structure (UUID, varchar FKs, nullable password/image)
- [x] Document password hashing: scrypt via `@better-auth/utils/password`

### 9.8 Fix seed.ts

- [x] Remove `db.end()` call at end of seed (mysql2 driver doesn't have end())
- [x] Remove `systemConfigs` reference (no such table in old seed logic)

### 9.9 Generate initial migration

- [x] Run `bunx drizzle-kit generate` — produced `0001_mean_payback.sql` (ALTER statements)
- [x] Manual migration needed: `drizzle-kit push` hangs on "Pulling schema" — run SQL manually via DB tool
- [x] Migration SQL fixes: `binary(16777215)` → `mediumblob()`, add `verifications.id`, change bigint FKs to varchar(36)
- [x] Created `scripts/fix-attachments.ts` to fix attachments table creation

### 9.10 Push schema to database

- [x] Drop all existing tables (FK order)
- [x] Run migration SQL via mysql2 direct connection
- [x] Fix attachments table (mediumblob, varchar FK for uploaded_by)
- [x] Verify 23 tables created

### 9.11 Seed database

- [x] Run `bun run db:seed` — creates roles, permissions, majors, classes, semesters, subjects, payment_methods
- [x] Permissions seeded: 48 permissions across all resources
- [x] Role permissions assigned to all 5 roles (superadmin, administrator, guru, siswa, alumni)
- [x] Default admin user created via direct DB insert (admin plugin not available)

---

## Verification Checklist

After all tasks:

- [x] `bun run typecheck` passes for schema files (cascade errors in actions/pages expected, deferred to Phase 3)
- [x] `bun run db:test` connects successfully
- [x] 23 tables created in MariaDB
- [x] `auth.api.signInEmail()` → `{"user":{...},"token":"..."}` — auth works end-to-end
- [x] Users created with scrypt-hashed passwords stored in accounts table (provider='credential')
- [x] Seed data verified: roles (5), permissions (48), majors (3), classes (3), semesters (2), subjects (5), payment_methods (4)
- [x] No reference to old PHP schema code — complete rewrite

---

## Decisions Made (vs original spec)

| Decision                          | Original Spec      | Final Decision                               | Reason                                                                                                            |
| --------------------------------- | ------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| users.id type                     | bigint (number)    | varchar(36) UUID                             | better-auth default, matches better-auth internal requirements                                                    |
| FK to users (all business tables) | bigint             | varchar(36)                                  | matches users.id type for MariaDB FK constraint compatibility                                                     |
| verifications.id                  | none (natural key) | varchar(36) PK                               | better-auth official schema has id column                                                                         |
| accounts.accountId                | optional           | NOT NULL                                     | better-auth requires accountId for credential provider                                                            |
| accounts.expiresAt                | single expiresAt   | accessTokenExpiresAt + refreshTokenExpiresAt | better-auth official field names                                                                                  |
| users.password                    | notNull            | nullable().default(null)                     | better-auth createUser doesn't set password on signup — only creates user record                                  |
| users.image                       | notNull            | nullable().default(null)                     | better-auth createUser doesn't set image on signup                                                                |
| admin plugin                      | included           | excluded                                     | conflicts with our custom RBAC role system — admin plugin expects `role` string field, we have `roleId` number FK |
| users.roleId reference            | with references()  | without references()                         | .references() on bigint FK causes issues with better-auth additionalFields                                        |
| grades table                      | REMOVE             | KEPT                                         | included in actual migration                                                                                      |
| profile_assets                    | REMOVE             | KEPT                                         | stores file paths as varchar, separate from attachments encrypted blob table                                      |
| system_configs                    | REMOVE             | KEPT                                         | included in actual migration                                                                                      |
| attachments.data                  | binary(16777215)   | mediumblob()                                 | binary() invalid in MariaDB, max 255 bytes; mediumblob() supports up to 16MB                                      |
| password hashing                  | argon2 (assumed)   | scrypt via @better-auth/utils/password       | better-auth uses Node.js node:crypto scrypt, NOT argon2                                                           |
| drizzle-kit push                  | expected to work   | hangs on "Pulling schema"                    | bypass with manual SQL via DB admin tool                                                                          |

---

## Key Learnings

1. **Always verify against official docs first** — task file had multiple factual errors (verifications.id missing, bigint IDs, wrong accounts fields)
2. **better-auth CLI is ground truth** — `bunx auth@latest generate --adapter drizzle --dialect mysql` gives canonical schema
3. **Plugin conflicts** — admin plugin has its own role system (string field), incompatible with our RBAC (number FK to roles table)
4. **Nullable password/image** — better-auth createUser doesn't set these; must be nullable or signup fails
5. **scrypt not argon2** — never assume hashing algorithm; always read the actual package used by better-auth
6. **accounts table required for credentials** — better-auth stores email/password credentials in accounts table, not inline on users
7. **drizzle-kit push hangs** — bypass with direct mysql2 connection and manual SQL execution
