# TODO.md — Sistren Development Task List

## Project Info
- **Stack:** Next.js 16, Drizzle ORM, MySQL, better-auth
- **Last Updated:** 2026-05-14
- **Status:** MVP Core Features ✅ | Additional Features WIP

---

## Priority 1: Wire CRUD to UI

### Students (`src/features/students/page.tsx`)
- [x] Server actions exist (`src/actions/students.ts`)
- [x] Create form works
- [ ] **Wire Edit button** → trigger update handler
- [ ] **Wire Delete button** → trigger delete with confirmation
- [ ] Add loading states
- [ ] Add error toasts

### Teachers (`src/features/teachers/page.tsx`)
- [x] Server actions exist (`src/actions/teachers.ts`)
- [x] Create form works
- [ ] **Wire Edit button** → trigger update handler
- [ ] **Wire Delete button** → trigger delete with confirmation
- [ ] Add loading states
- [ ] Add error toasts

### Finance (`src/features/finance/page.tsx`)
- [x] Full CRUD wired ✅
- [ ] Review payment status transitions (draft → pending → paid/cancelled)

---

## Priority 2: Seed Data

### Add sample data to `src/lib/db/seed.ts`
- [x] Roles ✅ (superadmin, administrator, guru, siswa, alumni)
- [x] Majors ✅ (TKJ, RPL, TKR)
- [x] Classes ✅ (X, XI, XII)
- [x] Semesters ✅ (Semester 1, 2 — 2025/2026)
- [x] Subjects ✅ (5 subjects for TKJ X)
- [x] Payment Methods ✅ (BCA, Mandiri, Tunai, GoPay)
- [x] System Configs ✅
- [ ] **Sample Students** — 5-10 records with profiles
- [ ] **Sample Teachers** — 3-5 records with profiles
- [ ] **Sample Enrollments** — link students to classes/semesters

### Quick Login Credentials (already seeded)
```
superadmin@sister.com / Password123!  (superadmin)
admin@sister.com      / Password123!  (administrator)
guru@sister.com       / Password123!  (guru)
siswa@sister.com      / Password123!  (siswa)
```

---

## Priority 3: Add Forms

### Academic Page (`src/features/academic/page.tsx`)
- [ ] Add form to create/edit **Majors** (name, description)
- [ ] Add form to create/edit **Classes** (name, code)
- [ ] Add form to create/edit **Semesters** (name, academic_year, dates)
- [ ] Add form to create/edit **Subjects** (name, code, class, major, credits)
- [ ] Wire to `src/actions/academic.ts`

### Announcements Page (`src/features/announcements/page.tsx`)
- [ ] Add form to create/edit announcements
- [ ] Fields: title, content, category, priority
- [ ] Wire to `src/actions/announcements.ts`

### Grades Page (`src/app/(app)/academic/grades/page.tsx`)
- [ ] Create or wire grade input UI
- [ ] Select student → select subject → input score
- [ ] Auto-calculate grade (A/B/C/D/E) from score
- [ ] Wire to `src/actions/grades.ts`

---

## Priority 4: Missing Features

### Learning Module (2.3)
- [ ] Teacher: upload materials (title, content, class)
- [ ] Student: view materials by class
- [ ] Categories (subjects)

### Document Upload (3.1)
- [ ] Upload files (PDF, images) to `public/uploads/`
- [ ] Link to student/teacher profiles
- [ ] Download/view functionality

### Student Grades/Ranking (3.2)
- [ ] View grades by class/semester
- [ ] Calculate ranking

### Graduate Module (3.4)
- [ ] Mark student as graduate
- [ ] Archive graduate records
- [ ] Generate certificate data

### Archive System (3.5)
- [ ] Archive old academic years
- [ ] Search archived data

### Payment Integration (2.4)
- [ ] Mock Midtrans integration
- [ ] Real payment gateway later

---

## Tech Debt

### Medium Priority
- [ ] Add error toasts across all pages
- [ ] Validation integration (Zod schemas exist but not fully wired)
- [ ] Consistent loading states

### Low Priority
- [ ] Delete leftover singular tables if unused (user, account, session, verification)
- [ ] Review and clean up unused imports

---

## Module Status Matrix

| Module | Read | Create | Update | Delete |
|--------|------|--------|--------|--------|
| Students | ✅ | ✅ | ⚠️ | ⚠️ |
| Teachers | ✅ | ✅ | ⚠️ | ⚠️ |
| Finance | ✅ | ✅ | ✅ | ✅ |
| Academic | ✅ | ❌ | ❌ | ❌ |
| Announcements | ✅ | ❌ | ❌ | ❌ |
| Grades | ⚠️ | ❌ | ❌ | ❌ |

Legend: ✅ Wired | ⚠️ Partial | ❌ Not wired | ❌ Missing

---

## File Locations

```
src/actions/          — Server actions (CRUD)
src/features/          — UI pages
src/lib/db/schema/     — Database schemas
src/lib/db/seed.ts     — Seed data
src/lib/auth/          — Auth + permissions
src/proxy.ts           — Route protection (Next.js 16)
```

---

## Notes

- drizzle-kit push hangs in non-TTY → use raw SQL scripts for DB changes
- Next.js 16 uses `proxy.ts` (formerly middleware.ts)
- Default role for new users: `siswa` (level 40)
- All server actions protected with `verifyAdmin` or `verifySession`