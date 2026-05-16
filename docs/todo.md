# Sistren - Project Todo

## Overview
- **Project:** Sistren (Sistem Informasi Terpadu)
- **Type:** Islamic High School Management System
- **Stack:** Next.js 16, Drizzle ORM, MySQL, better-auth 1.6.9
- **Status:** MVP Core Features ✅ | Additional Features WIP

---

## Phase 1: Foundation ✅ DONE

See `docs/table.md` for full schema documentation.

---

## Phase 2: Core Modules

### 2.3 Learning Module 🔄 IN PROGRESS
- [ ] Teacher: upload materials (title, content, class)
- [ ] Student: view materials by class
- [ ] Categories (subjects)

### 2.4 Payment System 🔄
- [ ] Mock Midtrans (real integration later)

---

## Phase 3: Additional Features

### 3.1 Document Upload ❌
- [ ] Upload files (PDF, images)
- [ ] Link to student/teacher
- [ ] Download/view

### 3.2 Student Grades/Ranking ⚠️
- [ ] View grades by class/semester
- [ ] Calculate ranking

### 3.4 Graduate Module ❌
- [ ] Mark student as graduate
- [ ] Archive graduate records
- [ ] Generate certificate data

### 3.5 Archive System ❌
- [ ] Archive old academic years
- [ ] Search archived data

---

## Technical Debt

### HIGH PRIORITY
- [ ] Wire all server actions to UI (students, teachers, payments, dll)
- [ ] Seed script for initial data (majors, classes, subjects, sample users)

### MEDIUM PRIORITY
- [ ] Add error toasts across pages
- [ ] Validation integration (Zod schemas exist but not fully wired)

### LOW PRIORITY - CLEANUP
- [ ] Delete leftover singular tables (user, account, session, verification) if unused

---

## Next Steps (Priority Order)

1. **Wire CRUD actions to UI** — students, teachers, finance, announcements
2. **Seed data** — majors, classes, semesters, subjects, sample users
3. **Learning module** — Upload/view materials
4. **Midtrans integration** — Real payment gateway
5. **Document upload** — File management system

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
- drizzle-kit push hangs in non-TTY → use raw SQL scripts for DB changes
- Next.js 16 uses `proxy.ts` (formerly middleware.ts) for route protection

---

**Last Updated:** 2026-05-14