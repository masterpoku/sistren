# Sistren Database Schema

## Overview

**Database:** MySQL (InnoDB)  
**Charset:** `utf8mb4`  
**Collation:** `utf8mb4_unicode_ci`  
**Table Naming:** Plural snake_case (Drizzle standard)  
**ORM:** Drizzle ORM (TypeScript)  
**Location:** `src/lib/db/schema/`

---

## Legend

| Symbol   | Meaning                |
| -------- | ---------------------- |
| PK       | Primary Key            |
| FK       | Foreign Key            |
| NULL     | Column can be null     |
| NOT NULL | Column required        |
| UNIQUE   | Unique constraint      |
| AI       | Auto Increment         |
| ENUM     | Enumeration type       |
| CASCADE  | Delete/update cascades |

---

## Core Authentication & Users

### Table: `users`

**Purpose:** User authentication (Better Auth compatible)

| Column              | Type         | Constraints                       | Description                  |
| ------------------- | ------------ | --------------------------------- | ---------------------------- |
| `id`                | BIGINT       | PK, AI                            | User ID                      |
| `confirmed`         | BOOLEAN      | DEFAULT false                     | Email verification status    |
| `username`          | VARCHAR(255) | UNIQUE, NULLABLE                  | Username (optional)          |
| `name`              | VARCHAR(255) | NOT NULL                          | User's full name             |
| `email`             | VARCHAR(255) | UNIQUE, NOT NULL                  | Email address (login)        |
| `guid`              | VARCHAR(255) | NULLABLE                          | External GUID (if synced)    |
| `email_verified_at` | TIMESTAMP    | NULLABLE                          | Email verification timestamp |
| `password`          | VARCHAR(255) | NOT NULL                          | Hashed password              |
| `role_id`           | BIGINT       | FK → `roles.id` ON DELETE CASCADE | User role                    |
| `remember_token`    | VARCHAR(100) | NULLABLE                          | Remember me token            |
| `created_at`        | TIMESTAMP    | NULLABLE                          | Account creation             |
| `updated_at`        | TIMESTAMP    | NULLABLE                          | Last update                  |

**Indexes:**

- `UNIQUE INDEX idx_email (email)`
- `UNIQUE INDEX idx_username (username)`
- `INDEX idx_role_id (role_id)`

**Relationships:**

- `role()` → belongsTo `roles`
- `profile()` → hasOne `profiles`
- `announcements()` → belongsToMany `announcements` via `announcement_recipients`
- `payments()` → hasMany `payments`

**Notes:**

- Better Auth compatible (id, email, password, timestamps)
- Column `confirmed` retains old spelling for compatibility

---

### Table: `roles`

**Purpose:** User role definitions (RBAC)

| Column        | Type         | Constraints      | Description      |
| ------------- | ------------ | ---------------- | ---------------- |
| `id`          | BIGINT       | PK, AI           | Role ID          |
| `name`        | VARCHAR(255) | UNIQUE, NOT NULL | Role name        |
| `description` | VARCHAR(255) | NULLABLE         | Role description |
| `created_at`  | TIMESTAMP    | NULLABLE         | Creation         |
| `updated_at`  | TIMESTAMP    | NULLABLE         | Update           |

**Indexes:**

- `UNIQUE INDEX idx_name (name)`

**Relationships:**

- `users()` → hasMany `users`

**Seed Data:**

```sql
INSERT INTO roles (name, description) VALUES
('superadmin', 'Super Administrator - full access'),
('administrator', 'Administrator - TU/admin staff'),
('guru', 'Teacher - can view classes, input grades'),
('siswa', 'Student - can view own records'),
('alumni', 'Alumni - read-only access to own transcript');
```

---

### Table: `profiles`

**Purpose:** Extended user profile (students & teachers)

| Column              | Type         | Constraints                                           | Description                         |
| ------------------- | ------------ | ----------------------------------------------------- | ----------------------------------- |
| `id`                | BIGINT       | PK, AI                                                | Profile ID                          |
| `user_id`           | BIGINT       | FK → `users.id` ON DELETE CASCADE                     | Linked user                         |
| `type`              | ENUM         | ('siswa','guru','admin','superadmin') DEFAULT 'siswa' | Profile type                        |
| `name`              | VARCHAR(255) | NOT NULL                                              | Full name                           |
| `previous_school`   | VARCHAR(255) | NULLABLE                                              | Previous school                     |
| `nik`               | VARCHAR(255) | NULLABLE                                              | National ID (16-digit)              |
| `nisn`              | VARCHAR(255) | NULLABLE                                              | Student ID                          |
| `birth_place`       | VARCHAR(255) | NULLABLE                                              | Birthplace                          |
| `birth_date`        | DATE         | NULLABLE                                              | Date of birth                       |
| `gender`            | ENUM         | ('male','female') DEFAULT 'male'                      | Gender                              |
| `address`           | TEXT         | NULLABLE                                              | Full address                        |
| `birth_order`       | INTEGER      | NULLABLE                                              | Child number in family              |
| `siblings_count`    | INTEGER      | NULLABLE                                              | Number of siblings                  |
| `weight_kg`         | INTEGER      | NULLABLE                                              | Weight in kg                        |
| `height_cm`         | INTEGER      | NULLABLE                                              | Height in cm                        |
| `phone`             | VARCHAR(20)  | NULLABLE                                              | Phone number                        |
| `religion`          | VARCHAR(50)  | NULLABLE                                              | Religion                            |
| `diploma_number`    | VARCHAR(255) | NULLABLE                                              | Diploma number                      |
| `skhu_number`       | VARCHAR(255) | NULLABLE                                              | SKHU certificate number             |
| `major_id`          | BIGINT       | FK → `majors.id` NULLABLE                             | Major/program                       |
| `uniform_size`      | VARCHAR(10)  | NULLABLE                                              | Uniform size (S/M/L/XL)             |
| `father_name`       | VARCHAR(255) | NULLABLE                                              | Father's name                       |
| `father_nik`        | VARCHAR(255) | NULLABLE                                              | Father's NIK                        |
| `father_occupation` | VARCHAR(255) | NULLABLE                                              | Father's job                        |
| `mother_name`       | VARCHAR(255) | NULLABLE                                              | Mother's name                       |
| `mother_nik`        | VARCHAR(255) | NULLABLE                                              | Mother's NIK                        |
| `parents_address`   | TEXT         | NULLABLE                                              | Parents address                     |
| `parents_phone`     | VARCHAR(20)  | NULLABLE                                              | Parents phone                       |
| `teacher_id`        | VARCHAR(255) | NULLABLE                                              | Teacher ID (for guru)               |
| `subject_taught`    | VARCHAR(255) | NULLABLE                                              | Subject taught (for guru)           |
| `status`            | VARCHAR(50)  | NULLABLE                                              | Status: active, inactive, graduated |
| `alternate_address` | TEXT         | NULLABLE                                              | Alternate address                   |
| `created_at`        | TIMESTAMP    | NULLABLE                                              | Creation                            |
| `updated_at`        | TIMESTAMP    | NULLABLE                                              | Update                              |

**Indexes:**

- `INDEX idx_user_id (user_id)`
- `INDEX idx_major_id (major_id)`
- `INDEX idx_type (type)`
- `INDEX idx_nisn (nisn)`

**Relationships:**

- `user()` → belongsTo `users`
- `major()` → belongsTo `majors`

**Naming Notes (from old schema):**

- Old: `asal_sekolah` → `previous_school`
- Old: `tempat_lahir` → `birth_place`
- Old: `tanggal_lahir` → `birth_date`
- Old: `tlp` → `phone`
- Old: `no_ijasah` → `diploma_number`
- Old: `no_skhun` → `skhu_number`
- Old: `ukuran_seragam` → `uniform_size`
- Old: `anak_ke` → `birth_order`
- Old: `jumlah_saudara` → `siblings_count`
- Old: `berat_badan` → `weight_kg`
- Old: `tinggi_badan` → `height_cm`

---

### Table: `profile_assets`

**Purpose:** Uploaded document file paths

| Column              | Type         | Constraints                       | Description     |
| ------------------- | ------------ | --------------------------------- | --------------- |
| `id`                | BIGINT       | PK, AI                            | Asset ID        |
| `user_id`           | BIGINT       | FK → `users.id` ON DELETE CASCADE | Owner           |
| `diploma`           | VARCHAR(255) | NULLABLE                          | Diploma file    |
| `skhu`              | VARCHAR(255) | NULLABLE                          | SKHU file       |
| `skl`               | VARCHAR(255) | NULLABLE                          | SKL certificate |
| `nisn_doc`          | VARCHAR(255) | NULLABLE                          | NISN document   |
| `birth_certificate` | VARCHAR(255) | NULLABLE                          | Akta kelahiran  |
| `father_ktp`        | VARCHAR(255) | NULLABLE                          | Father's KTP    |
| `mother_ktp`        | VARCHAR(255) | NULLABLE                          | Mother's KTP    |
| `kip`               | VARCHAR(255) | NULLABLE                          | KIP card        |
| `created_at`        | TIMESTAMP    | NULLABLE                          | Upload          |
| `updated_at`        | TIMESTAMP    | NULLABLE                          | Update          |

**Indexes:**

- `INDEX idx_user_id (user_id)`

**Notes:**

- One record per user (enforced by app)
- Stores file paths relative to `public/uploads/`

---

### Table: `user_information` (Legacy — Optional)

**Purpose:** Placeholder for additional user data (unused)

| Column       | Type      | Constraints                       | Description |
| ------------ | --------- | --------------------------------- | ----------- |
| `id`         | BIGINT    | PK, AI                            | Record ID   |
| `user_id`    | BIGINT    | FK → `users.id` ON DELETE CASCADE | User        |
| `created_at` | TIMESTAMP | NULLABLE                          | Created     |
| `updated_at` | TIMESTAMP | NULLABLE                          | Updated     |

**Recommendation:** Drop this table in fresh install — no useful data.

---

## Academic Structure

### Table: `majors`

**Purpose:** Academic majors/programs

| Column        | Type         | Constraints      | Description |
| ------------- | ------------ | ---------------- | ----------- |
| `id`          | BIGINT       | PK, AI           | Major ID    |
| `name`        | VARCHAR(255) | UNIQUE, NOT NULL | Major name  |
| `description` | TEXT         | NULLABLE         | Description |
| `created_at`  | TIMESTAMP    | NULLABLE         | Created     |
| `updated_at`  | TIMESTAMP    | NULLABLE         | Updated     |

**Seed Data:**

```sql
INSERT INTO majors (name, description) VALUES
('Teknik Komputer & Jaringan', 'TKJ - Computer Networking'),
('Rekayasa Perangkat Lunak', 'RPL - Software Engineering'),
('Teknik Kendaraan Ringan', 'Automotive Engineering');
```

---

### Table: `classes` (or `grade_levels`)

**Purpose:** Class/grade levels

| Column       | Type         | Constraints      | Description               |
| ------------ | ------------ | ---------------- | ------------------------- |
| `id`         | BIGINT       | PK, AI           | Class ID                  |
| `name`       | VARCHAR(255) | NOT NULL         | Class name (X, XI, XII)   |
| `code`       | VARCHAR(255) | UNIQUE, NOT NULL | Numeric code (10, 11, 12) |
| `created_at` | TIMESTAMP    | NULLABLE         | Created                   |
| `updated_at` | TIMESTAMP    | NULLABLE         | Updated                   |

**Seed Data:**

```sql
INSERT INTO classes (name, code) VALUES
('X', '10'),
('XI', '11'),
('XII', '12');
```

**Notes:**

- `code` used for numeric sorting
- Combined with major + section for full class name (e.g., "X-TKJ-1")

---

### Table: `semesters`

**Purpose:** Academic semesters

| Column          | Type         | Constraints   | Description                       |
| --------------- | ------------ | ------------- | --------------------------------- |
| `id`            | BIGINT       | PK, AI        | Semester ID                       |
| `name`          | VARCHAR(100) | NOT NULL      | Semester name                     |
| `academic_year` | VARCHAR(255) | NOT NULL      | Academic year (e.g., "2025/2026") |
| `start_date`    | DATE         | NULLABLE      | Semester start                    |
| `end_date`      | DATE         | NULLABLE      | Semester end                      |
| `is_active`     | BOOLEAN      | DEFAULT false | Current active semester           |
| `created_at`    | TIMESTAMP    | NULLABLE      | Created                           |
| `updated_at`    | TIMESTAMP    | NULLABLE      | Updated                           |

**Indexes:**

- `INDEX idx_academic_year (academic_year)`
- `INDEX idx_is_active (is_active)`

**Seed Data:**

```sql
INSERT INTO semesters (name, academic_year, start_date, end_date, is_active) VALUES
('Semester 1', '2025/2026', '2025-07-15', '2025-12-20', true),
('Semester 2', '2025/2026', '2026-01-10', '2026-06-15', false);
```

---

### Table: `subjects`

**Purpose:** Course/subject catalog

| Column        | Type         | Constraints                         | Description                  |
| ------------- | ------------ | ----------------------------------- | ---------------------------- |
| `id`          | BIGINT       | PK, AI                              | Subject ID                   |
| `name`        | VARCHAR(255) | NOT NULL                            | Subject name                 |
| `code`        | VARCHAR(50)  | UNIQUE, NULLABLE                    | Subject code (e.g., "TK101") |
| `class_id`    | BIGINT       | FK → `classes.id` ON DELETE CASCADE | Grade level                  |
| `major_id`    | BIGINT       | FK → `majors.id` NULLABLE           | Major (NULL = all majors)    |
| `credits`     | INTEGER      | DEFAULT 0                           | Credit hours (SKS)           |
| `description` | TEXT         | NULLABLE                            | Subject description          |
| `created_at`  | TIMESTAMP    | NULLABLE                            | Created                      |
| `updated_at`  | TIMESTAMP    | NULLABLE                            | Updated                      |

**Indexes:**

- `INDEX idx_class_id (class_id)`
- `INDEX idx_major_id (major_id)`
- `UNIQUE INDEX idx_code (code)`

**Relationships:**

- `class()` → belongsTo `classes`
- `major()` → belongsTo `majors`
- `enrollments()` → hasMany `enrollments`
- `grades()` → hasMany `grades`

**Seed Data:**

```sql
INSERT INTO subjects (name, code, class_id, major_id, credits) VALUES
('Pemrograman Dasar', 'TK101', 1, 1, 3),
('Matematika Diskrit', 'TK102', 1, 1, 3),
('Struktur Data', 'TK103', 1, 1, 4),
('Basis Data', 'TK104', 1, 1, 3),
('Jaringan Komputer', 'TK105', 1, 1, 3);
```

---

## Academic Operations (New Tables)

### Table: `enrollments`

**Purpose:** Student course registration per semester (KRS)

| Column        | Type      | Constraints                           | Description   |
| ------------- | --------- | ------------------------------------- | ------------- |
| `id`          | BIGINT    | PK, AI                                | Enrollment ID |
| `student_id`  | BIGINT    | FK → `users.id` ON DELETE CASCADE     | Student       |
| `semester_id` | BIGINT    | FK → `semesters.id` ON DELETE CASCADE | Semester      |
| `class_id`    | BIGINT    | FK → `classes.id` ON DELETE CASCADE   | Class level   |
| `created_at`  | TIMESTAMP | NULLABLE                              | Enrolled      |
| `updated_at`  | TIMESTAMP | NULLABLE                              | Updated       |

**Indexes:**

- `UNIQUE INDEX idx_unique_enrollment (student_id, semester_id, class_id)`
- `INDEX idx_semester_id (semester_id)`
- `INDEX idx_class_id (class_id)`

**Relationships:**

- `student()` → belongsTo `users`
- `semester()` → belongsTo `semesters`
- `class()` → belongsTo `classes`
- `grades()` → hasMany `grades`

---

### Table: `grades`

**Purpose:** Student grades per subject per semester (KHS)

| Column          | Type         | Constraints                             | Description                      |
| --------------- | ------------ | --------------------------------------- | -------------------------------- |
| `id`            | BIGINT       | PK, AI                                  | Grade ID                         |
| `enrollment_id` | BIGINT       | FK → `enrollments.id` ON DELETE CASCADE | Enrollment                       |
| `subject_id`    | BIGINT       | FK → `subjects.id` ON DELETE CASCADE    | Subject                          |
| `semester_id`   | BIGINT       | FK → `semesters.id` ON DELETE CASCADE   | Semester                         |
| `score`         | DECIMAL(5,2) | NULLABLE                                | Numeric score (0.00–100.00)      |
| `grade`         | CHAR(2)      | NULLABLE                                | Letter grade (A, A-, B+, B, ...) |
| `predicate`     | VARCHAR(5)   | NULLABLE                                | Simple grade (A/B/C/D/E)         |
| `created_at`    | TIMESTAMP    | NULLABLE                                | Entered                          |
| `updated_at`    | TIMESTAMP    | NULLABLE                                | Updated                          |

**Indexes:**

- `UNIQUE INDEX idx_enrollment_subject (enrollment_id, subject_id)`
- `INDEX idx_semester_id (semester_id)`
- `INDEX idx_grade (grade)`

**Computed:**

- `GPA` = average of all `score` values per student per semester
- `Total Credits` = sum of `subjects.credits` for passed grades

---

## Business Operations

### Table: `payments`

**Purpose:** Student fee/payment records

| Column        | Type          | Constraints                                            | Description              |
| ------------- | ------------- | ------------------------------------------------------ | ------------------------ |
| `id`          | BIGINT        | PK, AI                                                 | Payment ID               |
| `student_id`  | BIGINT        | FK → `users.id` ON DELETE CASCADE                      | Student                  |
| `code`        | VARCHAR(100)  | UNIQUE, NOT NULL                                       | Payment code             |
| `description` | VARCHAR(255)  | NOT NULL                                               | Description              |
| `price`       | DECIMAL(10,2) | NOT NULL                                               | Unit price               |
| `quantity`    | INTEGER       | DEFAULT 1                                              | Quantity                 |
| `total`       | DECIMAL(10,2) | NOT NULL                                               | Total (price × quantity) |
| `order_data`  | JSON          | NULLABLE                                               | Additional metadata      |
| `status`      | ENUM          | ('draft','pending','paid','cancelled') DEFAULT 'draft' | Payment status           |
| `paid_at`     | TIMESTAMP     | NULLABLE                                               | Payment completion       |
| `created_at`  | TIMESTAMP     | NULLABLE                                               | Created                  |
| `updated_at`  | TIMESTAMP     | NULLABLE                                               | Updated                  |

**Indexes:**

- `UNIQUE INDEX idx_code (code)`
- `INDEX idx_student_id (student_id)`
- `INDEX idx_status (status)`

**Improvements:**

- ✅ Added `student_id` FK (was missing)
- ✅ DECIMAL for monetary precision
- ✅ `paid_at` for payment timestamp

---

### Table: `payment_methods`

**Purpose:** Available payment methods

| Column           | Type         | Constraints      | Description                 |
| ---------------- | ------------ | ---------------- | --------------------------- |
| `id`             | BIGINT       | PK, AI           | Method ID                   |
| `name`           | VARCHAR(100) | UNIQUE, NOT NULL | Method name                 |
| `provider`       | VARCHAR(100) | NULLABLE         | Provider (BCA, GoPay, etc.) |
| `account_number` | VARCHAR(50)  | NULLABLE         | Receiver account            |
| `account_name`   | VARCHAR(255) | NULLABLE         | Account holder              |
| `instructions`   | TEXT         | NULLABLE         | Payment instructions        |
| `is_active`      | BOOLEAN      | DEFAULT true     | Available?                  |
| `created_at`     | TIMESTAMP    | NULLABLE         | Created                     |
| `updated_at`     | TIMESTAMP    | NULLABLE         | Updated                     |

**Seed Data:**

```sql
INSERT INTO payment_methods (name, provider, account_number, account_name) VALUES
('Transfer Bank BCA', 'BCA', '1234567890', 'SMK TERPADU'),
('Transfer Bank Mandiri', 'Mandiri', '0987654321', 'SMK TERPADU'),
('Tunai', 'Cash', NULL, 'Keuangan'),
('GoPay', 'GoPay', '081234567890', 'SMK TERPADU');
```

---

### Table: `system_configs`

**Purpose:** System key-value configuration

| Column        | Type         | Constraints      | Description                   |
| ------------- | ------------ | ---------------- | ----------------------------- |
| `id`          | BIGINT       | PK, AI           | Config ID                     |
| `key`         | VARCHAR(100) | UNIQUE, NOT NULL | Config key                    |
| `value`       | TEXT         | NULLABLE         | Config value (JSON if needed) |
| `description` | VARCHAR(255) | NULLABLE         | Human-readable description    |
| `created_at`  | TIMESTAMP    | NULLABLE         | Created                       |
| `updated_at`  | TIMESTAMP    | NULLABLE         | Updated                       |

**Indexes:**

- `UNIQUE INDEX idx_key (key)`

**Seed Data:**

```sql
INSERT INTO system_configs (key, value, description) VALUES
('school_name', 'SMK TERPADU', 'School name in header'),
('school_address', 'Jl. Pendidikan No. 123', 'Full address'),
('school_phone', '021-1234567', 'Contact number'),
('academic_year', '2025/2026', 'Current academic year'),
('active_semester_id', '1', 'Current semester ID reference');
```

---

## Content & Communication

### Table: `announcements`

**Purpose:** School announcements

| Column         | Type         | Constraints                                      | Description                                  |
| -------------- | ------------ | ------------------------------------------------ | -------------------------------------------- |
| `id`           | BIGINT       | PK, AI                                           | Announcement ID                              |
| `title`        | VARCHAR(255) | NOT NULL                                         | Title                                        |
| `description`  | VARCHAR(255) | NULLABLE                                         | Short summary                                |
| `content`      | TEXT         | NOT NULL                                         | Full content                                 |
| `category`     | VARCHAR(50)  | NULLABLE                                         | Category: umum, akademik, keuangan, kegiatan |
| `priority`     | ENUM         | ('normal','important','urgent') DEFAULT 'normal' | Priority level                               |
| `author_id`    | BIGINT       | FK → `users.id` ON DELETE SET NULL               | Author                                       |
| `published_at` | TIMESTAMP    | NULLABLE                                         | Publish date/time                            |
| `expires_at`   | TIMESTAMP    | NULLABLE                                         | Expiration (optional)                        |
| `created_at`   | TIMESTAMP    | NULLABLE                                         | Created                                      |
| `updated_at`   | TIMESTAMP    | NULLABLE                                         | Updated                                      |

**Indexes:**

- `INDEX idx_author_id (author_id)`
- `INDEX idx_category (category)`
- `INDEX idx_priority (priority)`
- `INDEX idx_published (published_at)`

**Relationships:**

- `author()` → belongsTo `users`
- `recipients()` → belongsToMany `users` via `announcement_recipients`

---

### Table: `announcement_recipients` (Pivot)

**Purpose:** Target specific users for announcements

| Column            | Type      | Constraints                               | Description    |
| ----------------- | --------- | ----------------------------------------- | -------------- |
| `announcement_id` | BIGINT    | FK → `announcements.id` ON DELETE CASCADE | Announcement   |
| `user_id`         | BIGINT    | FK → `users.id` ON DELETE CASCADE         | Target user    |
| `is_read`         | BOOLEAN   | DEFAULT false                             | Read status    |
| `read_at`         | TIMESTAMP | NULLABLE                                  | Read timestamp |
| `created_at`      | TIMESTAMP | NULLABLE                                  | Assigned       |

**Primary Key:** `(announcement_id, user_id)` composite

**Indexes:**

- `INDEX idx_user_id (user_id)`
- `INDEX idx_is_read (is_read)`

**Notes:**

- Enables targeted announcements (e.g., only to X-class students)
- Without this, announcements are global

---

## Future Extensions (Optional)

### Table: `teacher_assignments`

**Purpose:** Assign teachers to subjects by class

| Column        | Type      | Constraints                           | Description   |
| ------------- | --------- | ------------------------------------- | ------------- |
| `id`          | BIGINT    | PK, AI                                | Assignment ID |
| `teacher_id`  | BIGINT    | FK → `users.id` ON DELETE CASCADE     | Teacher       |
| `subject_id`  | BIGINT    | FK → `subjects.id` ON DELETE CASCADE  | Subject       |
| `class_id`    | BIGINT    | FK → `classes.id` ON DELETE CASCADE   | Class level   |
| `semester_id` | BIGINT    | FK → `semesters.id` ON DELETE CASCADE | Semester      |
| `created_at`  | TIMESTAMP | NULLABLE                              | Assigned      |
| `updated_at`  | TIMESTAMP | NULLABLE                              | Updated       |

**Unique:** `(teacher_id, subject_id, class_id, semester_id)`

---

### Table: `schedules`

**Purpose:** Class timetable/schedule

| Column        | Type        | Constraints                                                              | Description |
| ------------- | ----------- | ------------------------------------------------------------------------ | ----------- |
| `id`          | BIGINT      | PK, AI                                                                   | Schedule ID |
| `class_id`    | BIGINT      | FK → `classes.id` ON DELETE CASCADE                                      | Class       |
| `subject_id`  | BIGINT      | FK → `subjects.id` ON DELETE CASCADE                                     | Subject     |
| `teacher_id`  | BIGINT      | FK → `users.id` ON DELETE CASCADE                                        | Teacher     |
| `day_of_week` | ENUM        | ('monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL | Day         |
| `start_time`  | TIME        | NOT NULL                                                                 | Start time  |
| `end_time`    | TIME        | NOT NULL                                                                 | End time    |
| `room`        | VARCHAR(50) | NULLABLE                                                                 | Classroom   |
| `semester_id` | BIGINT      | FK → `semesters.id` ON DELETE CASCADE                                    | Semester    |
| `created_at`  | TIMESTAMP   | NULLABLE                                                                 | Created     |
| `updated_at`  | TIMESTAMP   | NULLABLE                                                                 | Updated     |

---

### Table: `attendance` (Future — if implemented)

**Purpose:** Student attendance tracking

| Column        | Type      | Constraints                                         | Description       |
| ------------- | --------- | --------------------------------------------------- | ----------------- |
| `id`          | BIGINT    | PK, AI                                              | Attendance ID     |
| `student_id`  | BIGINT    | FK → `users.id` ON DELETE CASCADE                   | Student           |
| `schedule_id` | BIGINT    | FK → `schedules.id` ON DELETE CASCADE               | Scheduled class   |
| `date`        | DATE      | NOT NULL                                            | Attendance date   |
| `status`      | ENUM      | ('present','sick','leave','absent','late') NOT NULL | Status            |
| `time_in`     | TIME      | NULLABLE                                            | Check-in          |
| `time_out`    | TIME      | NULLABLE                                            | Check-out         |
| `notes`       | TEXT      | NULLABLE                                            | Reason/notes      |
| `recorded_by` | BIGINT    | FK → `users.id`                                     | Recording teacher |
| `created_at`  | TIMESTAMP | NULLABLE                                            | Created           |
| `updated_at`  | TIMESTAMP | NULLABLE                                            | Updated           |

**Unique:** `(student_id, schedule_id, date)`

---

## Migration Order (Drizzle)

Create tables in dependency order to avoid FK errors:

1. `roles` (no dependencies)
2. `users` (depends on `roles`)
3. `majors` (no dependencies)
4. `classes` (no dependencies)
5. `semesters` (no dependencies)
6. `subjects` (depends on `classes`, optional `majors`)
7. `profiles` (depends on `users`, optional `majors`)
8. `profile_assets` (depends on `users`)
9. `system_configs` (no dependencies)
10. `announcements` (depends on `users`)
11. `announcement_recipients` pivot (depends on `announcements`, `users`)
12. `payment_methods` (no dependencies)
13. `payments` (depends on `users`)
14. `enrollments` (depends on `users`, `semesters`, `classes`) — NEW
15. `grades` (depends on `enrollments`, `subjects`, `semesters`) — NEW

---

## Drizzle Schema File Structure

```
src/lib/db/
├── index.ts              # drizzle(client) export
└── schema/
    ├── index.ts          # Barrel export
    ├── roles.ts
    ├── users.ts
    ├── profiles.ts
    ├── profile_assets.ts
    ├── academic/
    │   ├── index.ts
    │   ├── majors.ts
    │   ├── classes.ts
    │   ├── semesters.ts
    │   ├── subjects.ts
    │   ├── enrollments.ts
    │   └── grades.ts
    ├── announcements.ts
    ├── payments.ts
    ├── system_configs.ts
    └── attendance/       # future
        ├── index.ts
        ├── attendance.ts
        └── schedules.ts
```

---

## Data Type Reference (Drizzle)

```typescript
import {
  mysqlTable,
  serial,
  bigint,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  date,
  time,
  json,
} from 'drizzle-orm/mysql-core';

// Example:
export const users = mysqlTable('users', {
  id: bigint('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  roleId: bigint('role_id').references(() => roles.id),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
```

---

## Better Auth Tables (Optional)

If using Better Auth with Drizzle adapter, additional tables may be needed:

- `accounts` — OAuth accounts
- `sessions` — user sessions
- `verifications` — email verification tokens

**Our `users` table already matches requirements.** Custom adapter can map Better Auth to our schema.

---

## Migration Commands

```bash
# Generate migration from schema changes
bun drizzle-kit generate:mysql

# Push schema directly (dev only)
bun drizzle-kit push

# Run migrations
bun drizzle-kit migrate

# Open Studio (visual schema browser)
bun drizzle-kit studio
```

**Configure** `drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema/**/*.ts',
  out: './drizzle/migrations',
  driver: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Seed Data

Create `src/lib/db/seed.ts`:

```typescript
import { db } from './index'
import { roles, majors, classes, semesters, subjects, users, profiles } from './schema'

export async function seed() {
  // Seed in dependency order
  await db.insert(roles).values([...])
  await db.insert(majors).values([...])
  await db.insert(classes).values([...])
  await db.insert(semesters).values([...])
  await db.insert(subjects).values([...])
  await db.insert(users).values([...])
  await db.insert(profiles).values([...])
}
```

Add to `package.json`:

```json
{
  "scripts": {
    "db:seed": "bun run src/lib/db/seed.ts"
  }
}
```

Run: `bun run db:seed`

---

## Summary Statistics

| Category            | Tables                                        | Columns (approx) |
| ------------------- | --------------------------------------------- | ---------------- |
| Core Auth           | 4 (users, roles, profiles, profile_assets)    | ~70              |
| Academic Structure  | 4 (majors, classes, semesters, subjects)      | ~25              |
| Academic Operations | 2 (enrollments, grades)                       | ~18              |
| Business            | 3 (payments, payment_methods, system_configs) | ~25              |
| Content             | 2 (announcements, announcement_recipients)    | ~12              |
| **TOTAL**           | **15 tables**                                 | **~150 columns** |

---

**Last Updated:** 2026-04-23  
**Based on:** `docs/oldphp/sister_spt/` Laravel 12 schema  
**Standard:** Drizzle ORM naming conventions (plural snake_case, no prefix)  
**Adapted for:** Next.js 16 + MySQL + Drizzle
