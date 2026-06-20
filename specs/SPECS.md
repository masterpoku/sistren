# Sistren

## Purpose & Problem

Indonesian high schools manage student academic data across multiple domains — enrollment, grading, attendance, payments, documents, and announcements. Existing solutions are either proprietary, expensive, or don't handle Indonesian government-format requirements (rapor, ijazah). Sistren is a self-hosted SIS designed for ~1000-student schools, built on modern web standards with RBAC for admin, teacher, and student roles. Differentiator: open-source, self-hosted, handles K13/Kurikulum Merdeka grading with government document encryption, and soft-delete safety throughout.

## Requirements

### Functional

- FR-001: User authentication via email/password with session management (better-auth). Staff accounts created by admin via `auth.api.createUser()`. Students self-register via `signUpEmail()` and require admin approval. Status: Implemented. Priority: High. Verification: Test.
- FR-002: Role-based access control with hierarchical permissions. Level >= 100 bypasses all checks. Permissions granular per entity/action (c,r,u,d). Status: Implemented. Priority: High. Verification: Test.
- FR-003: Student record CRUD with NISN, biodata, address, parent info, religion (normalized in separate table). Soft delete. Bulk import from CSV/Excel. Status: Partial — read-only table `StudentsClient.tsx` exists. No create/edit/delete/import UI. Students created via self-registration. Priority: High. Verification: Test.
- FR-004: Teacher record CRUD with subject and class assignment. Soft delete. Status: Partial — read-only table `TeachersClient.tsx` exists. Teachers created via AdminUsers page. Priority: High. Verification: Test.
- FR-005: Class CRUD (grade level, major, rombel group). Status: Implemented — full CRUD via `ClassesDialog` (create/edit/delete). Completed Sprint 14. Priority: High. Verification: Inspection.
- FR-006: Subject CRUD (name, code, hours per week). Status: Implemented — create/edit/delete via Dialog in `SubjectsClient.tsx`. Priority: High. Verification: Inspection.
- FR-007: Major/department CRUD (jurusan: IPA, IPS, Bahasa, etc). Status: Implemented — full CRUD via `MajorDialog` (create/edit/delete). Completed Sprint 14. Priority: Medium. Verification: Inspection.
- FR-008: Semester/academic year CRUD with active semester flag. Status: Implemented — create/edit/delete/activate in `SemestersClient.tsx`. Priority: Medium. Verification: Inspection.
- FR-009: Student enrollment with state machine: active → transferred | dropped | graduated. Transferred → dropped allowed. Dropped/graduated = terminal. Bulk enrollment: chunk 50/transaction, skip existing via unique constraint, fail-fast. Status: Implemented — `EnrollmentsClient.tsx` with single + bulk enrollment, status change via `StatusChangeForm`. Priority: High. Verification: Test.
- FR-010: Grade entry with 4 types (knowledge, skill, attitude, extracurricular). Sub-scores: dailyTest1-4, midterm, finalExam, practical, project, portfolio. Unique constraint: (enrollmentId, subjectId, type). Grade approval workflow. Status: Implemented — `GradesClient.tsx` with spreadsheet-style input, auto-compute score + grade. Priority: High. Verification: Test.
- FR-011: Attendance tracking per session per student. Status: Not Started — `AttendanceClient.tsx` is placeholder. No schema, no actions, no sidebar link. Blocked on client requirements. Priority: Medium. Verification: Test.
- FR-012: Payment management (Odoo pattern). `payment_items` as templates. `payments.price` always editable — catalog price is default, never enforced. Record, confirm, refund workflows. Payment method CRUD. Status: Implemented — `PaymentItemsClient.tsx`, `PaymentMethodsClient.tsx`, `RecordPaymentForm.tsx`, `FinanceClient.tsx`. Confirm flow in action column. Priority: Medium. Verification: Test.
- FR-013: Announcement CRUD with publish/unpublish. Role-targeted visibility. Status: Implemented — full CRUD via `AnnouncementDialog` (create/edit/delete) + publish/unpublish toggle. Completed Sprint 14. Priority: Medium. Verification: Test.
- FR-014: Encrypted document storage (AES-256-GCM) for 10 document types (ijasah, skhun, skl, akta, kk, ktp, kip, foto, rapor). Stored as `longtext` in DB. `max_allowed_packet` >= 64MB. Status: Implemented — `src/lib/crypto.ts`, `DocumentsClient.tsx`, `DocumentUploadForm.tsx`. Upload, view, download, soft-delete per document type. Priority: Medium. Verification: Test.
- FR-015: Student promotion to next grade level and graduation workflow. Status: Not Started — no UI. Only graduation via enrollment status change `updateEnrollmentStatus`. Requires multi-step form wizard. Priority: Medium. Verification: Test.
- FR-016: Rapor/KHS generation in government-compatible format. Status: Partial — KHS display in `StudentAcademicClient.tsx` with DataTable + GPA calculation. Download button present but disabled. Government-format export not implemented. Priority: Medium. Verification: Inspection.
- FR-017: Dashboard with role-specific summaries (admin overview, teacher class view, student progress). Status: Implemented — `DashboardClient.tsx` with role-gated sections (admin stats + charts, teacher class averages, student GPA + schedule, alumni read-only). Priority: Medium. Verification: Inspection.
- FR-018: Audit logging for all mutations — timestamp, actor, action, entity, details. Status: Implemented — `audit_logs` schema with Drizzle relations. Wired to enrollment state changes. Coverage for all mutations not verified. Priority: Medium. Verification: Inspection.
- FR-019: School profile settings (name, address, logo, academic year). Status: Implemented — `SchoolSettingsForm.tsx` with batch update. Priority: Low. Verification: Inspection.
- FR-020: Admin approval workflow for pending student registrations. Status: Implemented — `ApprovalsClient.tsx` with approve/reject actions via `ActionCell`. Priority: Medium. Verification: Test.
- FR-021: Boarding/hostel module — student dormitory assignment and tracking. Status: Not Started — `BoardingClient.tsx` is a post-registration success page (misnamed). No boarding schema or functionality exists. Priority: Low. Verification: Test.
- FR-022: Finance module — payment summaries, reporting, balance tracking. Status: Implemented — `FinanceClient.tsx` with payment list, `StudentFinanceClient.tsx` with student-facing invoice + payment dialog. Priority: Low. Verification: Inspection.
- FR-023: System configuration for tunable settings. Status: Implemented — `SystemConfigsClient.tsx` with full CRUD for `SYSTEM_CONFIG_KEYS`. Role-gated via `system_configs.manage` permission. Priority: Low. Verification: Inspection.
- FR-024: Calendar management — school events with CRUD, FullCalendar integration, category filtering (academic, exam, holiday, event, meeting, other). Status: Implemented — `CalendarClient.tsx` with create/edit/delete Dialogs, FullCalendar views (month/week/day), role-gated event management. Priority: Medium. Verification: Inspection.
- FR-025: Announcement notifications — bell icon in header with notification center dropdown. Status: Implemented — notification bell with `Popover` dropdown, badge dot, mark-read, mark-all-read. `HeaderNotifications.tsx` + `src/actions/notifications.ts`. Completed Sprint 13. Priority: Low. Verification: Test.
- FR-026: Payment catalog — browse payment item templates with type/price/semester filtering. Status: Implemented — `PaymentCatalogClient.tsx` with DataTable, role-gated create/edit/delete via `PaymentItemDialog`. Priority: Medium. Verification: Inspection.
- FR-027: Header command palette — global search for sidebar navigation items via cmdk combobox. Status: Implemented — cmdk combobox with ⌘K shortcut, 22 sidebar nav items. `HeaderSearch.tsx`. Completed Sprint 13. Priority: Low. Verification: Inspection.

### Non-Functional

- NFR-001: All mutations use Server Actions at `src/actions/*.ts`. No direct DB from client components. Status: Implemented. Priority: High. Verification: Inspection.
- NFR-002: Soft delete on all entities. `deletedAt` timestamp, null = active. `isNull(deletedAt)` on every query. Status: Implemented — `deletedAt` added to 3 missing tables (`announcement_recipients`, `profile_assets`, `user_permissions`) in Sprint 12. 8 FK indexes added. Priority: High. Verification: Inspection.
- NFR-003: Server Components by default. `use client` only when using Phosphor icons, shadcn Card/Badge, or hooks. Status: Implemented — `table.tsx` `use client` removed in Sprint 14. All components follow server-first pattern. Priority: High. Verification: Inspection.
- NFR-004: Self-hosted MariaDB. No cloud dependency. ~1000 student scale. Status: Implemented. Priority: High. Verification: Analysis.
- NFR-005: Build must pass zero errors before deployment (`bun run build`). Status: Implemented — build confirmed green at 40 routes (Sprint 11). Priority: High. Verification: Analysis.
- NFR-006: Form error handling via `useToast()` — no `throw new Error()`, no `setMessage()`, no native `alert()`. Status: Partial — 1 `throw new Error()` remaining in `admin.ts:106`. 3 native `confirm()` calls remain (`data-table.tsx`, `SystemConfigsClient.tsx`, `DocumentsAdminClient.tsx` — planned Sprint 20). No `setMessage()`/`setError()` or `alert()` remain. Priority: Medium. Verification: Inspection.
- NFR-007: Action column pattern — `ActionCell` for delete, Dialog trigger for edit, `ActionCell onCustom` for extra actions. No raw buttons in action columns. Status: Implemented — all CRUD features use `ActionCell` for delete + Dialog trigger for edit. 3 `confirm()` stragglers pending Sprint 20. Priority: Medium. Verification: Inspection.
- NFR-008: CRUD form pattern — `<EntityDialog>` wrapping `<EntityForm>` in `<Dialog>`. No inline Card forms. Status: Implemented — 20 Form/Dialog pairs created in Sprint 14. All CRUD features use shadcn Dialog pattern. Priority: Medium. Verification: Inspection.
- NFR-009: Page wrapper pattern — `<PageShell>` for all CRUD pages. Status: Implemented — all CRUD feature pages use `PageShell`. Standardized in Sprint 14. Priority: Low. Verification: Inspection.
- NFR-010: Validation schemas centralized in `src/lib/validation/schemas/`. No inline `z.object()` in action files. Status: Implemented — 11 domain-specific schema files centralized. All inline `z.object()` removed from action files. Completed Sprint 15. Priority: Medium. Verification: Inspection.

## Architecture Decisions

- **Auth: better-auth** over next-auth (more flexible for custom RBAC) or Lucia (less maintained). Staff via `createUser()`, students via `signUpEmail()` + admin approval. `nextCookies()` must be last plugin. Trade-off: `createUser()` can't set additionalFields (GitHub #3602) — requires Drizzle update post-creation.
- **RBAC: custom perms table** over CASL (overkill for hierarchy-based model) or ad-hoc middleware (inconsistent). Single enforcement point in `proxy.ts` middleware. Trade-off: more tables, but explicit and auditable.
- **DB: Drizzle ORM + MariaDB** over Prisma (binary size, slow typegen) or TypeORM (maintenance concerns). No LATERAL JOIN support (MariaDB limitation). IDs: users UUID v4, roles BIGINT auto. Trade-off: no migration seeds, need separate seed script.
- **UI: shadcn/ui (L3) + Tailwind v4** over MUI (heavy, not server-component-friendly) or Radix primitives only. Components copied to `components/ui/`. All colors via `hsl(var(--primary))`. `cn()` for class merging.
- **Soft delete via `deletedAt`** over deleted flag (requires nullable handling) or separate archive tables (complex queries). Trade-off: every query needs `isNull(deletedAt)` filter — easy to forget.
- **Document encryption: AES-256-GCM stored as `longtext`** over filesystem storage (backup complexity) or binary BLOB (255B cap). Trade-off: `max_allowed_packet` must be >= 64MB. Key from `DOCUMENT_ENCRYPTION_KEY` env var.
- **Grades: single table with type enum** over separate tables per type (schema duplication). Sub-scores as nullable columns. Unique: (enrollmentId, subjectId, type). Trade-off: some sparse columns.
- **Enrollment state machine** over simple active/inactive flag. States: active → transferred|dropped|graduated. Terminal states: dropped|graduated. Transferred allows re-enrollment path. Logged to audit_logs.
- **Payments: Odoo pattern** — `payment_items` as catalog templates, `payments.price` always editable. Trade-off: no enforced catalog pricing, but handles discounts and adjustments without schema changes.
- **Religions: normalized separate table** over enum string column. Values: Islam, Kristen, Katolik, Hindu, Budha, Konghucu. Trade-off: join required for display, but enforces data integrity.
- **CRUD form pattern: Dialog (centered modal) over sidebar/drawer (Sheet)** — school staff users work on 1024px screens, do one task at a time, and universally understand modal popups. Dialog obscures context but fits the one-task-at-a-time workflow better than Sheet. Trade-off: complex forms with 10+ fields may feel cramped — use Sheet for those cases only. Decided 2026-06-16.
- **Action column pattern: ActionCell** — reusable component for delete (built-in confirmation), edit (Dialog trigger), and custom actions (onCustom array). Avoids raw button duplication across features. Trade-off: less flexibility for unique action layouts. Decided 2026-06-16.
- **Error handling: useToast() for all action feedback** — no `throw new Error()` (crashes UI silently), no `setMessage()` (fragile state management), no native `confirm()`. Single hook for success/error feedback. Trade-off: toasts auto-dismiss — persistent status messages need alternative pattern. Decided 2026-06-16.
- **Schema validation: centralized in `src/lib/validation/schemas/`** — one file per domain, re-exported via `index.ts`. No inline `z.object()` in action files. Enables reuse across actions, API routes, tests, and seed scripts. Trade-off: more files to navigate, but predictable location. Decided 2026-06-16.

## Anti-patterns

- Direct DB queries from Client Components — bypasses Server Action auth checks and RBAC. Root cause: convenience shortcuts during prototyping.
- Skipping `isNull(deletedAt)` on queries — leaks soft-deleted records. Root cause: forgetting soft delete is opt-out by default instead of opt-in.
- `experimental.joins` in better-auth — MariaDB doesn't support LATERAL JOIN, crashes at query time. Root cause: assuming PostgreSQL-compatible SQL.
- Tailwind v3 `tailwind.config.ts` format — v4 uses `@theme` in CSS. Root cause: habit from v3 projects.
- `signUpEmail()` for staff accounts — triggers self-registration flow, not admin creation. Root cause: confusing API naming.
- `Number()` on UUID string — produces NaN which coerces to 0, silently corrupting queries. Root cause: JavaScript loose coercion.
- Binary/mediumblob for document storage — MariaDB binary caps at 255 bytes. Root cause: PostgreSQL/MySQL habits. Fix: use `longtext`.
- Unique constraint names exceeding 64 characters — MariaDB truncates silently, causing migration errors. Root cause: auto-generated constraint names from composite indexes.
- `throw new Error()` in form handlers — crashes the React component tree, user sees blank page. Root cause: treating form errors like programming errors. Fix: use `useToast()`.
- `confirm()` in action columns — blocks the browser event loop, inconsistent with Dialog-based UI. Root cause: legacy habit. Fix: use `ActionCell` built-in confirmation.
- `require()` instead of dynamic `import()` — breaks bundler tree-shaking, not compatible with ESM-only packages. Root cause: CommonJS habit. Fix: use `await import()`.
- Raw HTML `<select>` instead of shadcn `<Select>` — inconsistent styling, missing keyboard navigation, no accessible label binding. Root cause: import oversight. Fix: use shadcn `<Select>`.
- `document.getElementById()` instead of `useRef` — bypasses React's reconciliation, can reference stale DOM nodes. Root cause: jQuery-era habit. Fix: use `useRef` callback ref pattern.
- `use client` on purely presentational components (e.g., `table.tsx`) — forces client-side rendering for HTML that could be SSR'd. Root cause: cargo-culting `use client`.

## Constraints

- Self-hosted MariaDB — no cloud DB service. No LATERAL JOIN support. Consequence: complex analytics queries require application-level joins or materialized views.
- Bun runtime only — no npm/pnpm/yarn. Consequence: dependency selection must verify Bun compatibility.
- ~1000 student scale — not designed for multi-school or >10k concurrent users. Consequence: no horizontal scaling in current architecture.
- Soft delete everywhere — no hard deletes. Consequence: storage grows monotonically; periodic archive/cleanup needed.
- AES-256-GCM document encryption — key rotation requires re-encrypting all documents. Consequence: key management process needed.

## Success Criteria

- [x] Build passes with zero errors (`bun run build`) — confirmed Sprint 11, 40 routes
- [x] TypeScript strict mode passes (`bun run typecheck`) — confirmed Sprint D
- [x] RBAC enforced on all protected routes — proxy.ts active, permissions wired
- [ ] All FR-NNN implemented with passing tests or manual inspection — FR-011, 015, 021 not started
- [ ] All mutations revalidate affected paths — unverified
- [ ] No direct DB calls from client components — unverified
- [x] Soft delete filter present on all entity queries — all tables have `deletedAt`, `isNull(deletedAt)` on all queries. Completed Sprint 12.
- [ ] Document encryption round-trips correctly (store → retrieve → decrypt) — needs test
- [ ] Enrollment state machine transitions verified (no invalid transitions) — needs test
- [ ] All 3 roles (admin, teacher, student) can complete their primary workflows — needs test

## Non-Goals & Out of Scope

- Multi-tenant / multi-school support — single school only
- Real-time collaboration — no WebSocket or live sync
- Mobile native app — responsive web only
- SSO / OAuth providers — future concern (API routes reserved but empty)
- External LMS integration (Google Classroom, Moodle)
- AI/ML features (grade prediction, recommendation)
- Internationalization — Indonesian language only
- Public student portal — authenticated access only
- Microservices — monorepo with Next.js API routes

## Dependencies

- MariaDB 10.6+ — database
- Bun 1.2+ — runtime, package manager, build tool
- Next.js 16 (ARM) — web framework
- Drizzle ORM — database access layer
- better-auth — authentication library
- Tailwind CSS v4 — styling
- shadcn/ui — UI component library (copied locally)
- Phosphor Icons — icon set

## Decision Log

- 2025-11-15: Initial architecture decisions recorded — auth (better-auth), DB (Drizzle+MariaDB), UI (shadcn/ui v4), soft delete, encryption, grading schema, enrollment state machine, payment pattern, religion normalization. Context: project bootstrap.
- 2026-06-10: Sprint B — Zod validation schemas wired where practical. `gradeTypeSchema` in `src/lib/validation/schemas/grades.ts`. `createEnrollmentSchema` in `schemas/enrollments.ts`. Context: security follow-up.
- 2026-06-10: Sprint C — SQL injection fixes (raw `await db.$run()` replaced with parameterized queries). Schema relations added (Drizzle `relations`). Audit log user ID changed from number to string (UUID compatibility). Context: security sprint.
- 2026-06-10: Sprint D — 16 feature pages verified as thin Server Components. Build + typecheck pass. Context: architecture compliance.
- 2026-06-15: Sprint 10 — All 6 remaining `alert()` calls replaced with `useToast()`. Context: UI infrastructure.
- 2026-06-15: Sprint 11 — QA sweep: build blocker fixed, auth leak closed, 404 fixed, chrome drift fixed, UX redirect fixed, favicon.ico added, alert debt cleared. 0 `alert()` remaining. Build green (40 routes). Context: pre-deployment quality gate.
- 2026-06-15: Sprint 12 — Full codebase audit surfaced ~85 findings (~60 confirmed). Database integrity (CASCADE→SET NULL, PK syntax, migration cleanup, missing indexes, missing soft delete). Server Actions (missing Zod schemas, missing revalidatePath, missing soft delete filters). Feature components (throw→toast, raw select→shadcn Select, confirm→Dialog). Auth & middleware (proxy.ts active, favicon exclusion, level 100 bypass). Lib & components (unnecessary use client, breadcrumb a11y). Context: comprehensive code review.
- 2026-06-16: Sprint 13 — Header search bar (static → cmdk Command combobox) and notification bell (static → Popover with notification center). Both completed. Installed `sonner`, `@radix-ui/react-popover`, `cmdk`. 2 demo notifications seeded. Context: header interactivity.
- 2026-06-16: Sprint 14 — CRUD uniformity: all inline Card forms migrate to Dialog, missing create/edit operations added, action columns standardized to ActionCell, page wrappers standardized to PageShell, error handling unified to useToast(), debt items fixed. Context: feature consistency.
- 2026-06-16: Sprint 15 — Schema centralization: all inline Zod schemas in action files extracted to `src/lib/validation/schemas/`. Missing Zod schemas created for 6 action files. Context: validation architecture.
- 2026-06-16: Dialog-over-sidebar decision recorded for CRUD forms. ActionCell, PageShell, useToast() standards documented. Schema centralization pattern ratified. Context: Sprint 14-15 planning.
- 2026-06-18: Sprint 16 — Follow-up wiring confirmed: all Sprint 14/15 work was already wired in client files. All 6 useToast migrations done. Both raw `<select>` replaced with shadcn Select. Quick Login env-gated. Lint baseline: 2 pre-existing errors. Build: 42 routes. Context: carry-over verification.
- 2026-06-18: Sprint 17 — Bug fixes: `createStaffAccount`/`updateStaffAccount` now query `roles.level` (was comparing auto-increment ID against magic numbers 60/80). Sidebar avatar visible on dark navy. Double-border removed from Subjects/Semesters/Settings. Dashboard QuickMenu at top. Toast destructive variant uses `text-destructive-foreground`. 3 lint errors fixed. Context: code review follow-up.
- 2026-06-18: Sprint 18 — Documents Management: `school_documents` Drizzle schema with AES-256-GCM encryption. Server actions with RBAC + revalidatePath. Zod validation. Download API at `/api/documents/school/[id]`. `/documents` page with DataTable + drag-drop upload dialog. Sidebar "Dokumen" nav item with `minLevel: 80`. Migration `0003_mushy_moon_knight.sql` generated (⚠ migration not yet pushed to running DB). Build: 42 routes. Context: new module.
