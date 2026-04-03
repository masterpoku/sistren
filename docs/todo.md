# Sistren - Project Todo

## Overview
- **Project:** Sistren (Sistem Informasi Terpadu)
- **Type:** Islamic High School Management System
- **Stack:** Next.js 16, Drizzle ORM, MySQL
- **Target:** MVP in 1 day (vibes coding)

---

## Phase 1: Foundation (Priority 0)

### 1.1 Setup
- [ ] Install dependencies (bun add next react drizzle-orm mysql2)
- [ ] Configure Drizzle with MySQL connection
- [ ] Create .env for DB credentials

### 1.2 Database Schema (will provide table)
- [ ] Users (id, email, password, role, created_at)
- [ ] Students (user_id, name, nis, class_id, parent_id)
- [ ] Teachers (user_id, name, nip, subject)
- [ ] Classes (id, name, level, academic_year)
- [ ] Parents (id, name, phone, student_id)

### 1.3 Auth
- [ ] Simple login/register (email/password)
- [ ] Role-based access (admin, teacher, student, parent)
- [ ] Session management

---

## Phase 2: Core Modules (Priority 1)

### 2.1 Student Management
- [ ] List all students (filter by class)
- [ ] Add new student
- [ ] Edit student details
- [ ] Delete student

### 2.2 Teacher Management
- [ ] List all teachers
- [ ] Add new teacher
- [ ] Edit teacher details
- [ ] Assign subjects

### 2.3 Learning Module
- [ ] Teacher: upload materials (title, content, class)
- [ ] Student: view materials by class
- [ ] Categories (subjects)

### 2.4 Payment System
- [ ] Payment types (tuition, books, etc)
- [ ] Record payments
- [ ] Payment status (paid/unpaid)
- [ ] Mock Midtrans (real integration later)

---

## Phase 3: Additional Features (Priority 2)

### 3.1 Document Upload
- [ ] Upload files (PDF, images)
- [ ] Link to student/teacher
- [ ] Download/view

### 3.2 Student Rank / Grades
- [ ] Input grades per subject
- [ ] Calculate ranking
- [ ] View by class

### 3.3 Graduate Module
- [ ] Mark student as graduate
- [ ] Archive graduate records
- [ ] Generate certificate data

### 3.4 Archive System
- [ ] Archive old academic years
- [ ] Search archived data

---

## Phase 4: Management Admin (Priority 2)

### 4.1 Dashboard
- [ ] Stats overview (students, teachers, payments)
- [ ] Quick actions

### 4.2 Full CRUD
- [ ] Manage all entities
- [ ] Bulk actions

---

## Notes

- "Vibes coding" - ship fast, iterate
- Use simple UI (minimal styling)
- Real Midtrans integration later (MVP = mock)
- Class relational included (Students ↔ Classes)
- Will provide MySQL table structure before implementation

---

## Dependencies to Add

```bash
bun add next react react-dom drizzle-orm mysql2 zod bcryptjs
bun add -d @types/bcryptjs
```