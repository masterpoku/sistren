# specs/TASKS.md

> Append-only cross-session goal tracker. Add new goals, never delete old ones.
> Archive completed goals by moving to an "## Archived" section.

---

## Active Goals

### Phase 6: Grade management — deferred to v2

**Status:** deferred-to-v2

**Depends-on:** Phase 5

**Notes:** Grades = Rapor PDF upload via `student_documents.rapor`. Structured grade entry not needed for v1 launch. `grades` table stays in schema but unused.

---

## Archived Goals

### Phase 12: VPS Deployment

**Status:** orphaned

**Notes:** No urgency until production release. Deferred indefinitely.

---

### Phase 1: Fix better-auth — auth is broken

**Completed:** 2026-05-21

**Summary:** All 20 tables rewritten from better-auth + Drizzle first principles. Auth config wired with admin plugin, nextCookies, additionalFields.roleId. Migration generated. Typecheck clean.

---

### Phase 1b: Auth Layer Rebase — Fix 5 Critical QA Issues

**Completed:** 2026-05-22

**Summary:** userId FK type mismatch fixed (bigint → varchar(36)). Schema synced with actual migration files. Broken imports cleaned up.

---

### Phase 2: Project scaffolding

**Completed:** 2026-05-26

**Summary:** Empty API routes for SSO. .gitignore, .env.example. No pre-commit hooks.

---

### Phase 3: User management

**Completed:** 2026-05-26

**Summary:** Auth + all user CRUD + student self-registration with admin approval. seed.ts with 4 test users. Login/Register pages as Server Actions. Admin approval UI at `/admin/approvals`. Staff account creation at `/admin/users`. Profile edit at `/profile`.

---

### Phase 4: Academic core (classes, majors, subjects, semesters)

**Completed:** 2026-05-26

**Summary:** Classes, majors, subjects, semesters CRUD. Teacher assignments via `teacher_class_subjects` table. Academic overview page.

---

### Phase 5: Enrollments

**Completed:** 2026-05-28

**Summary:** Enrollment CRUD per semester. Admin assigns student to class. Bulk enrollment by class (chunk 50, fail-fast). Status state machine (active → transferred/dropped/graduated). Unique constraint on (studentId, semesterId). Audit trail on status change.

---

### Phase 7: Payments (SPP + variable fees)

**Completed:** 2026-05-30

**Summary:** `getPayments`, `recordPayment`, `confirmPayment`, `cancelPayment` actions. Student payment list at `/payments`. Admin finance page at `/finance`. **Catalog (Phase 14) added later** — `recordPayment` accepts optional `paymentItemId` for pre-fill from payment items catalog; `payments.price` always editable per invoice (Odoo sale-order-line pattern).

---

### Phase 8: Announcements

**Completed:** 2026-05-30

**Summary:** Full CRUD + publish/unpublish + read receipts in `src/actions/announcements.ts`. Announcements page at `/announcements` with role-filtered list.

---

### Phase 9: Official documents (SKHU, Ijazah, Rapor)

**Completed:** 2026-05-30

**Summary:** Document download API at `/api/documents/[id]/[type]/route.ts`. `deleteDocument` action. Student documents page at `/students/[id]/documents`.

**Deferred to v2:** SKHU/Ijazah PDF template generation, transcript PDF export per government format.

---

### Phase 10: Alumni access

**Completed:** 2026-05-30

**Summary:** Alumni login at `/auth/alumni-login` (level 20-40, no role guard). Transcript page at `/alumni/transcript` with own Rapor/Ijazah download links and enrollments. Sidebar has `Transkrip` nav item.

---

### Phase 11: Dashboard & navigation

**Completed:** 2026-05-28

**Summary:** Role-based sidebar at `src/components/layout/sidebar.tsx`. Mobile hamburger + auto-close. Profile dropdown extracted. AppLayoutClient = thin wrapper. Missing pages created (/admin, /finance, /users, /permissions). Placeholder pages (/roles, /students, /teachers).

---

### Phase 13: UI/UX Alignment with Design Reference

**Completed:** 2026-05-30

**Summary:** Page padding normalized, header built, sidebar collapsible, headings size-normalized, dashboard charts added, DataTable partially migrated, Student Academic (KRS/KHS) built, Student Finance built, icon audit done, EmptyState migrated, Card stat pattern normalized, form layout standardized, login page polished, profile avatar added.

---

### Phase 14: Payment Items Catalog

**Completed:** 2026-05-30

**Pattern:** Odoo-style product catalog. `payment_items` = template (code, name, description, standard price). `recordPayment` accepts optional `paymentItemId` — pre-fills description + standard price from catalog, but `payments.price` is **always editable per invoice**. Catalog price is default, not enforced.

**Summary:** `payment_items` schema + FK to `payments`. CRUD actions + admin UI at `/admin/payment-items`. `recordPayment` pre-fills from catalog, price always editable. Seeded: SPP-01 (SPP Bulanan Rp150rb), SPP-02 (SPP Tengah Semester Rp75rb), UG-01 (Uang Gedung Rp500rb), DU-01 (Daftar Ulang Rp250rb). Also fixed pre-existing Server Component shadcn `Card` conflict at `/academic/semesters`.