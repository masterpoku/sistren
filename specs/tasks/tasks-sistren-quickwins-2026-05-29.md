# specs/tasks/tasks-sistren-quickwins-2026-05-29.md

## Context

**Completed:**
- Phase 5 (Enrollments) ✅
- Phase 11 (Dashboard & navigation) ✅

**Next up (from TASKS.md):**
- Phase 6: Grade management (depends on Phase 5 ✅ — now unblocked)
- Phase 7: Payments (depends on Phase 3)
- Phase 8: Announcements (depends on Phase 3)

**From task-sistren-sidebar-2026-05-27.md — remaining items:**
- A6: Document upload page (student_documents table exists in schema)
- Quick stats widget for dashboard

**Technical debt (from pre-sprint review):**
- Format regression: 121 files need `bun run format`
- next.config.ts: `serverActions.bodySizeLimit` may be invalid in Next.js 16
- Magic number `roleId === 1` in deleteStaffAccount → should use roleLevel >= 100

---

## Quick Wins — 2026-05-29

Target: things that can be done in one session, unblock next phases, no dependency on incomplete work.

---

### T1 — Format regression fix

**File:** `bun run format` (project-wide)

**What:** 121 files need formatting. Run `bun run format` to fix all.

**Why:** Pre-sprint review found format regression. Clean codebase before next sprint.

**Verify:** `bun run format && bun run typecheck && bun run build` — must pass.

---

### T2 — next.config.ts serverActions.bodySizeLimit research

**File:** `next.config.ts`

**What:** Research if `serverActions.bodySizeLimit: 16 * 1024 * 1024` is still valid in Next.js 16 (Turbopack). The config key may have changed. Document upload (A6) silently fails at >1MB if this is wrong.

**Research:** Check official Next.js 16 docs for server action body size limit config key.

**Fix if needed:** Update next.config.ts with correct key.

**Verify:** Upload 2MB test document → should succeed without 413.

---

### T3 — Document upload page (A6)

**File:** `src/app/(app)/students/[id]/documents/page.tsx` (may already exist)

**Schema:** `student_documents` table already in schema — has blob columns for ijasah, skhun, skl, akta_kelahiran, kk, ktp_ayah, ktp_ibu, kip, pass_foto, rapor.

**What:** Build document upload page:
- List existing documents with download links
- Upload form per document type (FormData → server action)
- AES-256-GCM encryption on upload (encryptBlob from crypto.ts)
- Decrypt on download (decryptBlob)
- Max file sizes per doc type (1-2MB)

**Files to create/modify:**
- `src/app/(app)/students/[id]/documents/page.tsx` — check if exists
- `src/actions/documents.ts` — uploadDocument, downloadDocument, deleteDocument
- `src/lib/crypto.ts` — already exists, verify encryptBlob/decryptBlob

**Note:** Document types were specified in SPECS.md. Use those.

**Verify:** Upload a test document → retrieve it → matches original.

---

### T4 — Grades action layer (Phase 6 foundation)

**File:** `src/actions/grades.ts` (new)

**Schema:** Grades table exists. No structured grade input in v1 (Rapor via blob). But action layer for grades is quick to scaffold.

**What:**
- `getGrades({ studentId?, semesterId? })` — list grades
- `getGrade(studentId, subjectId, semesterId)` — single grade
- `inputGrade` — admin only (role >= 80)
- `updateGrade` — with audit log

**Rationale:** Phase 6 (Grade management) is next. Building the action layer now means Phase 6 UI is just wiring.

**Note:** Rapor is blob storage (Phase 9), not structured grades. Keep them separate.

**Verify:** `bun run typecheck && bun run build`

---

### T5 — Dashboard quick stats widget

**File:** `src/app/(app)/dashboard/page.tsx` (currently minimal stub)

**What:** Add quick stats cards to dashboard based on user role:

For admin (role >= 80):
- Total students (count users where roleLevel = 40, deletedAt IS NULL)
- Total teachers (count users where roleLevel = 60)
- Active enrollments this semester
- Pending announcements

For guru (role 60):
- Classes assigned this semester
- Subjects taught
- Pending grade inputs

For siswa (role 40):
- Own enrollment status
- Upcoming announcements

**Implementation:** Use `getSession()` to get role, then data queries. SSR — no client fetching needed.

**Note:** Keep it simple. Don't build full analytics — just snapshot cards.

**Verify:** Dashboard renders correct cards per role. Build passes.

---

### T6 — Magic number fix: `roleId === 1`

**File:** `src/actions/users.ts` (or wherever deleteStaffAccount lives)

**What:** Replace `roleId === 1` with `roleLevel >= 100` (superadmin check).

**Why:** Magic number. Role 1 may not always be superadmin. Use roleLevel.

**Search:** Grep for `roleId === 1` across all action files.

**Verify:** `bun run typecheck && bun run build`

---

### T7 — Payments schema + actions (Phase 7 foundation)

**Files:** `src/lib/db/schema/payments.ts` (exists), `src/actions/payments.ts` (new)

**Schema:** Already has payments table + payment_methods table.

**What:** Scaffold payment actions:
- `getPaymentMethods()` — admin only
- `createPaymentMethod` — admin only
- `getPayments({ studentId?, status? })` — role-filtered (siswa sees own only)
- `recordPayment` — admin creates payment entry for student
- `confirmPayment` — admin marks as paid

**Rationale:** Phase 7 is payments. Scaffold actions now so UI is just wiring later.

**Note:** SPP config (amount, due date) — stored in system_configs table or separate table? Check schema. If not there, defer as separate task.

**Verify:** `bun run typecheck && bun run build`

---

## Out of Scope Today

- Phase 6 full UI (grade input form)
- Phase 8 full announcements UI
- Phase 9 (SKHU/Ijazah/PDF templates)
- Phase 10 (Alumni access)
- Phase 12 (Deployment)

---

## Dependencies

- T3 (documents): Phase 5 complete ✅
- T4 (grades): Phase 5 complete ✅
- T7 (payments): Phase 3 complete ✅
- T5 (dashboard stats): Phase 11 complete ✅

---

## Verification

After each task:
```bash
bun run typecheck && bun run build
```

After all tasks:
```bash
bun run typecheck && bun run build && bun run lint
```

All must pass.