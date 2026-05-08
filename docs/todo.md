# Sistren - Project Todo

## Overview
- **Project:** Sistren (Sistem Informasi Terpadu)
- **Type:** Islamic High School Management System
- **Stack:** Next.js 16, Drizzle ORM, MySQL, better-auth 1.6.9
- **Status:** MVP Core Features ✓ | Additional Features WIP

---

## Phase 1: Foundation ✅ DONE

### 1.1 Setup ✅
- [x] Install dependencies (bun add next react drizzle-orm mysql2)
- [x] Configure Drizzle with MySQL connection
- [x] Create .env for DB credentials
- [x] Update dependencies (next 16.2.5, react 19.2.6)

### 1.2 Database Schema ✅
- [x] Users (id, email, password, role)
- [x] Students (user_id, name, nis, class_id)
- [x] Teachers (user_id, name, nip, subject)
- [x] Profiles (user_id, phone, address, birth_place, birth_date)
- [x] Classes (id, name, level, academic_year)
- [x] Majors (id, name, code)
- [x] Semesters (id, name, is_active)
- [x] Enrollments (student_id, class_id, semester_id)
- [x] Subjects (id, name, code, teacher_id, class_id)
- [x] Grades (enrollment_id, subject_id, score)
- [x] Payments (student_id, description, total, status)
- [x] Announcements (title, content, author_id)

### 1.3 Auth ✅
- [x] Login/register (email/password)
- [x] Role-based access (superadmin, administrator, headmaster, teacher, student, parent)
- [x] Session management (better-auth)
- [x] RBAC middleware + permissions

---

## Phase 2: Core Modules ✅ DONE

### 2.1 Student Management ✅
- [x] List all students (DataTable)
- [x] Add new student (StudentForm)
- [x] Edit student details (updateStudent action)
- [x] Delete student

### 2.2 Teacher Management ✅
- [x] List all teachers (DataTable)
- [x] Add new teacher (TeacherForm)
- [x] Edit teacher details (updateTeacher action)
- [x] Assign subjects

### 2.3 Learning Module 🔄 IN PROGRESS
- [x] View subjects by class
- [ ] Teacher: upload materials (title, content, class)
- [ ] Student: view materials by class
- [ ] Categories (subjects)

### 2.4 Payment System ✅
- [x] Payment types (tuition, books, etc)
- [x] Record payments (PaymentForm)
- [x] Payment status (draft/pending/paid/cancelled)
- [x] Mark as paid/cancel actions
- [ ] Mock Midtrans (real integration later)

---

## Phase 3: Additional Features 🔄 IN PROGRESS

### 3.1 Document Upload ❌
- [ ] Upload files (PDF, images)
- [ ] Link to student/teacher
- [ ] Download/view

### 3.2 Student Grades/Ranking ⚠️ ALMOST DONE
- [x] Input grades per subject (grades.ts + grades page)
- [x] Calculate average scores
- [ ] View grades by class/semester
- [ ] Calculate ranking

### 3.3 Academic Enrollment ✅
- [x] Manage enrollments per semester
- [x] View enrollment status by semester

### 3.4 Graduate Module ❌
- [ ] Mark student as graduate
- [ ] Archive graduate records
- [ ] Generate certificate data

### 3.5 Archive System ❌
- [ ] Archive old academic years
- [ ] Search archived data

---

## Phase 4: Management Admin ✅ DONE

### 4.1 Dashboard ✅
- [x] Stats overview (students, teachers, payments)
- [x] Quick actions

### 4.2 Full CRUD ✅
- [x] Manage all entities
- [x] Server actions (create/update/delete)
- [x] Toast notifications

---

## Technical Debt & Issues

### 🔴 CRITICAL - FIXED
- [x] Dashboard: Hardcoded `role: 'siswa'` - removed mock, use session
- [x] Profile: localStorage auth - replaced with server action

### 🟠 HIGH PRIORITY - IN PROGRESS
- [ ] **Role-based sidebar visibility** - nav items currently hardcoded
- [ ] **Route permissions registry** - some routes not in ROUTE_PERMISSIONS

### 🟡 MEDIUM PRIORITY
- [ ] Replace `<a>` tags with `<Link>` across feature pages
- [ ] Add error toasts across pages (some pages missing)
- [ ] Remove stale mock imports (constants.ts, AppLayout.tsx)

### 🟢 LOW PRIORITY - CLEANUP
- [ ] Delete `src/util/mock/` folder (unused)
- [ ] Delete `src/features/layout/AppLayout.tsx` (old, unused)
- [ ] Delete `src/features/layout/AppSidebar.tsx` (old, unused)

---

## Next Steps (Priority Order)

1. **Role-based sidebar** - Show/hide nav items based on user role
2. **Route permissions** - Register `/profile/edit`, `/academic/enrollments`, `/academic/grades`
3. **Learning module** - Upload/view materials
4. **Midtrans integration** - Real payment gateway
5. **Document upload** - File management system

---

## Dependencies

```bash
# Core
bun add next@latest react@latest react-dom@latest
bun add drizzle-orm mysql2 better-auth@latest
bun add zod

# Utils
bun add argon2 bcryptjs
bun add @tanstack/react-table
bun add phosphor-react

# Dev
bun add -d @types/bcryptjs drizzle-kit
```

---

## Notes

- "Vibes coding" - ship fast, iterate
- Role-based access control (RBAC) implemented with better-auth
- Session user has `roleName` (string) not `roleId` (enum)
- All server actions protected with verifyAdmin/verifySession