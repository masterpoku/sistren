# specs/tasks/tasks-schema-refactor-2026-05-21.md

## Schema Refactor — Better-auth + Drizzle Standard Compliance

> Refactoring schema to align with better-auth adapter requirements and store all student documents as encrypted blobs. Auth must work before any feature work begins.

---

## Phase 1: Auth Schema Fixes (CRITICAL — blocks all development)

### 1.1 Fix `accounts` table — missing fields
**Why:** Better-auth adapter expects `expiresAt`, `password`, `createdAt`, `updatedAt` fields.
- [ ] Add `expiresAt: timestamp('expires_at')` to accounts schema
- [ ] Add `password: varchar('password', { length: 255 })` to accounts schema
- [ ] Add `createdAt: timestamp('created_at').defaultNow()` to accounts schema
- [ ] Add `updatedAt: timestamp('updated_at').onUpdateNow()` to accounts schema
- [ ] Verify all fields are BIGINT (userId) matching better-auth's expected types
- [ ] Run `bunx drizzle-kit generate` after changes

### 1.2 Add `emailVerified` field to `users` table
**Why:** Better-auth requires `emailVerified` or `emailVerifiedAt` field for email verification flow.
- [ ] Add `emailVerified: boolean('email_verified').default(false)` to users schema
- [ ] OR use `emailVerifiedAt: timestamp('email_verified_at')` — choose one pattern
- [ ] Document which pattern was chosen in decision log
- [ ] Run `bunx drizzle-kit generate` after changes

### 1.3 Add `nextCookies` plugin to better-auth config
**Why:** Next.js App Router requires `nextCookies` plugin to read/write session cookies.
- [ ] Add `import { nextCookies } from 'better-auth/next-js'` to auth/index.ts
- [ ] Add `nextCookies()` to plugins array in better-auth config
- [ ] Remove `usePlural: true` if it causes conflicts with nextCookies plugin
- [ ] Test: login sets session cookie, page refresh preserves session

### 1.4 Configure `additionalFields.roleId` in better-auth
**Why:** Maps better-auth session to custom roles table for RBAC.
- [ ] Add `additionalFields: { roleId: { type: 'number' } }` to better-auth config
- [ ] Verify `roles.id` is `bigint` (mode: 'number') matching the type
- [ ] Test: `auth.api.getSession()` returns user with `roleId` field
- [ ] Document: how does roleId map to custom permissions tables?

### 1.5 Fix userId type casting in custom queries
**Why:** Better-auth returns `session.user.id` as string; DB expects BIGINT.
- [ ] Find all custom query files using `session.user.id` or `session.userId`
- [ ] Add `Number()` cast: `Number(session.user.id)`
- [ ] Search pattern: grep for `session.user` and `session.userId` across src/
- [ ] Create helper: `getUserId(session)` in auth utils to centralize casting

### 1.6 Verify sessions table compatibility
**Why:** Sessions table must work with better-auth's session management.
- [ ] Confirm sessions table has: `id`, `userId` (BIGINT), `token` (unique), `expiresAt`, `createdAt`, `updatedAt`
- [ ] Confirm sessions are deleted on user deletion (cascade)
- [ ] Test: session expires and is cleaned up properly

### 1.7 Verify verifications table compatibility
**Why:** Email verification tokens stored here.
- [ ] Confirm verifications table has: `id`, `identifier`, `token`, `expiresAt`, `createdAt`, `updatedAt`
- [ ] Test: email verification flow creates record and validates token

---

## Phase 2: Document Storage Schema (student_documents)

### 2.1 Create `student_documents` table
**Why:** Consolidates all 10 student document blobs (replacing `profile_assets` which stores file paths).
- [ ] Create `student_documents` table in `src/lib/db/schema/student_documents.ts`
- [ ] Fields: `id (PK)`, `studentId (FK→users.id)`, soft delete, timestamps
- [ ] 10 encrypted blob columns: `ijasah`, `skhun`, `skl`, `akta_kelahiran`, `kk`, `ktp_ayah`, `ktp_ibu`, `kip`, `pass_foto`, `rapor`
- [ ] All blob columns use `mediumblob()` — 16MB limit per field
- [ ] Each document type is versionable (upload new = create new record, soft-delete old)
- [ ] Add relations to users table

### 2.2 Create encryption utility
**Why:** All document blobs must be AES-256-GCM encrypted before storage.
- [ ] Create `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt using `DOCUMENT_ENCRYPTION_KEY`
- [ ] Export `encryptBlob(buffer: Buffer): Buffer` and `decryptBlob(buffer: Buffer): Buffer`
- [ ] Validate key is 32 bytes from env var
- [ ] Add tests: encrypt → decrypt returns original data

### 2.3 Update `profile_assets` deprecation
**Why:** Replaced by `student_documents`. Mark for removal after migration.
- [ ] Add comment: `@deprecated — replaced by student_documents table (encrypted blob storage)`
- [ ] DO NOT delete yet — migration path needed for existing data

### 2.4 Update schema/index.ts exports
**Why:** `student_documents` table must be exported for better-auth adapter and migrations.
- [ ] Add `export * from './student_documents'` to index.ts
- [ ] Remove `profile_assets` export only after migration is complete

---

## Phase 3: Schema Cleanup & Documentation

### 3.1 Update drizzle.config.ts
**Why:** Must pick up all schema files including new ones.
- [ ] Verify `drizzle.config.ts` includes `src/lib/db/schema/index.ts` as schema entry
- [ ] Verify no glob patterns are missing new files

### 3.2 Add env validation for DOCUMENT_ENCRYPTION_KEY
**Why:** Missing key should fail fast at startup, not at upload time.
- [ ] Add validation in `src/lib/db/index.ts` or `src/lib/crypto.ts`
- [ ] Fail with clear error if key is missing or wrong length
- [ ] Document: 32-byte key requirement in AGENTS.md env vars section

### 3.3 Update AGENTS.md env vars
**Why:** Env vars updated to include DOCUMENT_ENCRYPTION_KEY.
- [ ] Confirm DOCUMENT_ENCRYPTION_KEY (32-byte) is in the required env vars list

### 3.4 Mark grades table as future-extensibility
**Why:** Grades table exists for future structured input but not used in v1 (Rapor upload only).
- [ ] Add comment in grades.ts: `@deprecated in v1 — Rapor is uploaded PDF; grades stored for future structured input`
- [ ] No migration needed — keep table but flag it

### 3.5 Document schema decisions
**Why:** Specs must reflect actual implementation after refactor.
- [ ] Update SPECS.md decision log with: emailVerified field choice, student_documents table, encryption approach
- [ ] Update AGENTS.md if new patterns emerge during implementation

---

## Verification Checklist

After all tasks:
- [ ] `bun run typecheck` passes
- [ ] `bun run db:test` connects successfully
- [ ] Login flow works end-to-end (register → login → session persists)
- [ ] Student document upload encrypts blob and stores in DB
- [ ] Student document retrieval decrypts and serves correctly
- [ ] `bunx drizzle-kit generate` produces clean migration (no diff = no change needed)

---

## Notes

- **Better-auth ID type:** better-auth generates string IDs by default. Current schema uses BIGINT auto-increment. Cast at boundary: `Number(session.user.id)` for DB queries.
- **MariaDB max_allowed_packet:** Verify set to 64MB before testing large blob uploads.
- **experimental.joins:** Disabled — MariaDB incompatibility confirmed. Do not enable.
- **Soft delete:** All custom tables use `deletedAt` pattern. better-auth system tables (sessions, accounts, verifications) managed by better-auth.