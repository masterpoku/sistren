# TODO.md — Sistren Development Task List

## Project Info
- **Stack:** Next.js 16.2.5, Drizzle ORM 0.45, MySQL, better-auth, shadcn/ui
- **Last Updated:** 2026-05-17
- **Status:** MVP Core Features WIP | Additional Features Pending

---

## Completed Features ✅

### Soft Delete (2026-05-15/16)
- `deletedAt` column on 12 tables: roles, users, profiles, majors, classes, semesters, subjects, announcements, enrollments, grades, payments, permissions
- All queries filter `isNull(xxx.deletedAt)` — no orphaned soft-deleted reads
- All delete actions use soft delete + pre-check guards
- Grades are immutable — no delete action, correction only via update
- Build clean, DB seeded

### RBAC (2026-05-14/15)
- 38 permissions, 93 role_permission mappings
- Server actions protected with `verifyPermission(permName)`
- Auth API fix: userId from session cookie, not query param
- Dashboard: role fetched from DB, not email inference

### UI Pages Wired (2026-05-15/16)
- Students: full CRUD with RequirePermission ✅
- Teachers: full CRUD with RequirePermission ✅
- Finance: full CRUD + status transitions ✅
- Users: delete wired ✅
- Profile: updateUserProfile wired ✅
- **Academic: tabbed CRUD with Sheet sidepanels** ✅ NEW

### Seed (2026-05-17)
- `db:seed` is now idempotent — re-runnable without ER_DUP_ENTRY
- `db.end()` + `process.exit(0)` prevents process hang
- `seed-permissions.ts` uses try/catch ER_DUP_ENTRY for role_permissions

---

## Priority 1: Remaining CRUD UI

### Announcements (`src/features/announcements/page.tsx`)
- [ ] Create/edit form (title, description, content, category, priority, publishedAt)
- [ ] Publish/unpublish toggle
- [ ] Delete with confirm
- [ ] RequirePermission: create→`announcements.create`, edit→`announcements.update`, delete→`announcements.delete`, publish→`announcements.publish`

### Enrollments (`src/features/academic/enrollments/page.tsx`)
- [ ] Wire existing page to `src/actions/enrollments.ts`
- [ ] Add dialog for create/update enrollment (select student, class, semester)
- [ ] RequirePermission wrappers

### Grades (`src/features/academic/grades/page.tsx`)
- [ ] Wire existing page to `src/actions/grades.ts`
- [ ] Input form: select enrollment, subject, semester, score, grade, predicate
- [ ] No delete button (grades immutable)
- [ ] RequirePermission: `grades.input`

---

## Priority 2: Sample Data

### Add to `src/lib/db/seed.ts`
- [ ] Sample Students — 5-10 records with profiles (nisn, birthPlace, birthDate, gender, address, phone, fatherName, motherName, parentsPhone, religion, majorId, classId)
- [ ] Sample Teachers — 3-5 records with profiles
- [ ] Sample Enrollments — link students to classes/semesters
- [ ] Sample Grades — realistic score data per enrollment

### Quick Login Credentials
```
superadmin@sistren.com / Password123!  (superadmin)
admin@sistren.com      / Password123!  (administrator)
guru@sistren.com       / Password123!  (guru)
siswa@sistren.com      / Password123!  (siswa)
```

---

## Priority 3: Additional Features

### Learning Module
- [ ] Teacher: upload materials (title, content, class)
- [ ] Student: view materials by class
- [ ] Categories (subjects)

### Document Upload
- [ ] Upload files (PDF, images) to `public/uploads/`
- [ ] Link to student/teacher profiles
- [ ] Download/view functionality

### Graduate Module
- [ ] Mark student as graduate (soft delete + status change)
- [ ] Archive graduate records
- [ ] Generate certificate data

### Payment Integration
- [ ] Mock Midtrans integration
- [ ] Real payment gateway later

---

## Cleanup (Low Priority)

- [ ] `src/util/mock/` — entire folder unused, safe to delete
- [ ] `src/features/layout/AppLayout.tsx` — self-import, unused
- [ ] `src/features/layout/AppSidebar.tsx` — only imported by AppLayout
- [ ] `src/constants.ts` — remove `import type { Announcement }` from mock, remove `MOCK_ANNOUNCEMENTS` block
- [ ] Delete leftover singular tables if unused (user, account, session, verification in schema — these may be leftover from earlier scaffolding)

---

## Tech Debt (Medium Priority)

- [ ] Add loading states to all DataTables (currently show skeleton on initial load only)
- [ ] Validation integration — Zod schemas exist but not fully wired to forms
- [ ] Consistent error toasts across all pages

---

## Module Status Matrix

| Module     | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| Students   | ✅   | ✅     | ✅     | ✅     |
| Teachers   | ✅   | ✅     | ✅     | ✅     |
| Finance    | ✅   | ✅     | ✅     | ✅     |
| Academic   | ✅   | ✅     | ✅     | ✅     |
| Announce.  | ✅   | ❌     | ❌     | ❌     |
| Grades     | ✅   | ❌     | ❌     | ❌     |
| Enrollments| ✅   | ❌     | ❌     | ❌     |
| Permissions| ✅   | ✅     | ✅     | ✅     |
| Roles      | ✅   | ✅     | ✅     | ✅     |

Legend: ✅ Wired | ❌ Not wired

---

## File Locations

```
src/actions/              — Server actions (CRUD + guards)
src/components/academic/  — Academic sheet forms (ClassSheet, MajorSheet, SemesterSheet, SubjectSheet, AcademicTabs)
src/features/            — UI pages
src/lib/db/schema/        — Database schemas (12 tables with soft delete)
src/lib/db/queries.ts    — Query layer (isNull filters on all reads)
src/lib/db/seed.ts       — Idempotent base seed
src/lib/db/seed-permissions.ts — Idempotent permission seed
src/lib/auth/            — Auth + verifyPermission
src/proxy.ts             — Route protection (Next.js 16)
```

---

## Technical Notes

- drizzle-kit push hangs in non-TTY → use raw SQL scripts for DB changes
- Next.js 16 uses `proxy.ts` (formerly middleware.ts) + Turbopack
- Default role for new users: `siswa` (level 40)
- All server actions use `verifyPermission(permName)` — superadmin bypasses all
- Grades are immutable — no delete action exists, corrections via update only
- Seed is idempotent — safe to re-run anytime, skips existing records
- `db.end()` + `process.exit(0)` required at end of seed scripts to prevent hang