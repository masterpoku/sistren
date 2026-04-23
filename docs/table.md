# Sistren Database Schema

## Overview

**Database:** MySQL (InnoDB)  
**Charset:** `utf8mb4`  
**Collation:** `utf8mb4_unicode_ci`  
**Table Prefix:** `res_` (for custom tables)  
**ORM:** Drizzle ORM (TypeScript)  
**Location:** `src/lib/db/schema/`

---

## Legend

| Symbol | Meaning |
|--------|---------|
| PK | Primary Key |
| FK | Foreign Key |
| NULL | Column can be null |
| NOT NULL | Column required |
| UNIQUE | Unique constraint |
| AI | Auto Increment |
| ENUM | Enumeration type |
| CASCADE | Delete/update cascades |

---

## Core Authentication & Users

### Table: `users`

**Purpose:** Laravel's default authentication table (used by Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | User ID (Better Auth uses bigint) |
| `comfirmed` | BOOLEAN | DEFAULT false | Email verification status |
| `username` | VARCHAR(255) | UNIQUE, NULLABLE | Username (optional) |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address (login) |
| `guid` | VARCHAR(255) | NULLABLE | External GUID (if synced) |
| `email_verified_at` | TIMESTAMP | NULLABLE | Email verification timestamp |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt/argon2) |
| `roles_id` | BIGINT | FK → `res_roles.id` ON DELETE CASCADE | User role reference |
| `remember_token` | VARCHAR(100) | NULLABLE | "Remember me" token |
| `created_at` | TIMESTAMP | NULLABLE | Account creation date |
| `updated_at` | TIMESTAMP | NULLABLE | Last update |

**Indexes:**
- `UNIQUE INDEX idx_email (email)`
- `UNIQUE INDEX idx_username (username)`
- `INDEX idx_roles_id (roles_id)`

**Relationships:**
- `roles()` → belongsTo `res_roles` (many-to-one)
- `profile()` → hasOne `res_profile` (one-to-one)
- `announcements()` → belongsToMany `res_announcement` via `announcement_user` pivot
- `payments()` → hasMany `res_payment` (one-to-many, if FK added)

**Notes:**
- Uses Laravel's default `users` table (no `res_` prefix)
- Column `comfirmed` is misspelled in old schema — retained for backward compatibility

---

### Table: `res_roles`

**Purpose:** User role definitions (RBAC)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Role ID |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Role name |
| `description` | VARCHAR(255) | NULLABLE | Role description |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `UNIQUE INDEX idx_name (name)`

**Relationships:**
- `users()` → hasMany `users` (one-to-many)

**Seed Data:**
```sql
INSERT INTO res_roles (name, description) VALUES
('superadmin', 'Super Administrator - full access'),
('administrator', 'Administrator - TU/admin staff'),
('guru', 'Teacher - can view classes, input grades'),
('siswa', 'Student - can view own records'),
('alumni', 'Alumni - read-only access to own transcript');
```

**Notes:**
- Role hierarchy: superadmin > administrator > guru > siswa > alumni
- Old PHP used `tu` (tata usaha) for admin; renamed to `administrator` for clarity

---

### Table: `res_profile`

**Purpose:** Extended user profile data (students & teachers)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Profile ID |
| `user_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Linked user |
| `type` | ENUM | DEFAULT 'siswa' | Profile type: `siswa`, `guru`, `admin`, `superadmin` |
| `name` | VARCHAR(255) | NOT NULL | Full name (redundant with users.name) |
| `asal_sekolah` | VARCHAR(255) | NULLABLE | Previous school (for transfers) |
| `nik` | VARCHAR(255) | NULLABLE | National ID (16-digit NIK) |
| `nisn` | VARCHAR(255) | NULLABLE | Student ID (for students) |
| `tempat_lahir` | VARCHAR(255) | NULLABLE | Birthplace |
| `tanggal_lahir` | DATE | NULLABLE | Birth date |
| `gender` | ENUM | ('l','p') DEFAULT 'l' | Gender: laki-laki / perempuan |
| `alamat` | TEXT | NULLABLE | Full address |
| `anak_ke` | INTEGER | NULLABLE | Birth order in family |
| `jumlah_saudara` | INTEGER | NULLABLE | Number of siblings |
| `berat_badan` | INTEGER | NULLABLE | Weight in kg |
| `tinggi_badan` | INTEGER | NULLABLE | Height in cm |
| `tlp` | VARCHAR(20) | NULLABLE | Phone number |
| `agama` | VARCHAR(50) | NULLABLE | Religion |
| `no_ijasah` | VARCHAR(255) | NULLABLE | Diploma number |
| `no_skhun` | VARCHAR(255) | NULLABLE | SKHU (certificate) number |
| `jurusan_id` | BIGINT | FK → `res_jurusan.id` NULLABLE | **Normalized FK to major** |
| `ukuran_seragam` | VARCHAR(10) | NULLABLE | Uniform size (S/M/L/XL) |
| `nama_ayah` | VARCHAR(255) | NULLABLE | Father's name |
| `no_nik_ayah` | VARCHAR(255) | NULLABLE | Father's NIK |
| `pekerjaan_ayah` | VARCHAR(255) | NULLABLE | Father's occupation |
| `nama_ibu` | VARCHAR(255) | NULLABLE | Mother's name |
| `no_nik_ibu` | VARCHAR(255) | NULLABLE | Mother's NIK |
| `alamat_orangtua` | TEXT | NULLABLE | Parents address |
| `tlp_orangtua` | VARCHAR(20) | NULLABLE | Parents phone |
| `niy` | VARCHAR(255) | NULLABLE | Teacher ID (for guru) |
| `mapel` | VARCHAR(255) | NULLABLE | Subject taught (for guru) |
| `status` | VARCHAR(50) | NULLABLE | Status: aktif, non-aktif, lulus |
| `address` | TEXT | NULLABLE | Alternate address |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `INDEX idx_user_id (user_id)`
- `INDEX idx_jurusan_id (jurusan_id)`
- `INDEX idx_type (type)`
- `INDEX idx_nisn (nisn)`

**Relationships:**
- `user()` → belongsTo `users` (many-to-one)
- `jurusan()` → belongsTo `res_jurusan` (many-to-one, if normalized)

**Migration Strategy:**
- If migrating from old PHP: copy all columns including `jurusan` (VARCHAR) as-is
- If fresh install: use `jurusan_id` FK instead (recommended)
- For backward compatibility: keep both `jurusan` (legacy) and `jurusan_id` (new)

---

### Table: `res_profile_assets`

**Purpose:** Store uploaded document file paths for student/teacher profiles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Asset ID |
| `user_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Owner user |
| `ijasah` | VARCHAR(255) | NULLABLE | Diploma/graduation certificate file |
| `skhun` | VARCHAR(255) | NULLABLE | SKHU (satuan pendidikan) file |
| `skl` | VARCHAR(255) | NULLABLE | SKL (sertifikat) file |
| `nisn` | VARCHAR(255) | NULLABLE | NISN document file |
| `akta_kelahiran` | VARCHAR(255) | NULLABLE | Birth certificate file |
| `ktp_ayah` | VARCHAR(255) | NULLABLE | Father's KTP file |
| `ktp_ibu` | VARCHAR(255) | NULLABLE | Mother's KTP file |
| `kip` | VARCHAR(255) | NULLABLE | KIP (Kartu Indonesia Sehat) file |
| `created_at` | TIMESTAMP | NULLABLE | Upload timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `INDEX idx_user_id (user_id)`

**Relationships:**
- `user()` → belongsTo `users` (many-to-one)

**Notes:**
- Columns store file paths/names; actual files in `public/uploads/` or cloud storage
- One record per user (one-to-one relationship enforced by app logic)

---

### Table: `res_users_information` (Legacy/Unused)

**Purpose:** Additional user data (currently unused in old app)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Record ID |
| `user_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | User reference |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Notes:**
- Migration file contains typo: `refrences` instead of `references`
- No additional columns defined — likely placeholder for future use
- Can be safely ignored or dropped in new implementation

---

## Academic Structure

### Table: `res_jurusan`

**Purpose:** Academic majors/programs/study concentrations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Major ID |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Major name (e.g., "Teknik Komputer & Jaringan", "Rekayasa Perangkat Lunak") |
| `description` | TEXT | NULLABLE | Detailed description |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Seed Data:**
```sql
INSERT INTO res_jurusan (name, description) VALUES
('Teknik Komputer & Jaringan', 'Teknik Komputer dan Jaringan'),
('Rekayasa Perangkat Lunak', 'Software Engineering'),
('Teknik Kendaraan Ringan', 'Automotive Engineering');
```

**Relationships:**
- `profiles()` → hasMany `res_profile` (one-to-many, via jurusan_id)
- `mata_pelajaran()` → hasMany `res_mata_pelajaran` (one-to-many, via level_id if using class-level mapping)

**Notes:**
- In old schema, `res_profile.jurusan` was a VARCHAR (denormalized)
- In improved schema, use `jurusan_id` FK here and reference from profiles

---

### Table: `res_kelas`

**Purpose:** Class/grade levels (X, XI, XII)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Class ID |
| `name` | VARCHAR(255) | NOT NULL | Class name (e.g., "X", "XI", "XII") |
| `code` | VARCHAR(255) | NOT NULL, UNIQUE | Class code (e.g., "10", "11", "12") |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Seed Data:**
```sql
INSERT INTO res_kelas (name, code) VALUES
('X', '10'),
('XI', '11'),
('XII', '12');
```

**Relationships:**
- `mata_pelajaran()` → hasMany `res_mata_pelajaran` (subjects taught at this level)
- `enrollments()` → hasMany `res_enrollment` (if enrollment table exists)

**Notes:**
- `code` used for sorting (numeric string)
- In reference mock data: `class: "X-TKJ-1"` — combine `kelas` + `jurusan` + `section`

---

### Table: `res_semester`

**Purpose:** Academic semesters with academic year

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Semester ID |
| `name` | VARCHAR(100) | NOT NULL | Semester name (e.g., "Semester 1", "Semester 2") |
| `tahun` | VARCHAR(255) | NOT NULL | Academic year (e.g., "2025/2026") |
| `start_date` | DATE | NULLABLE | Semester start date |
| `end_date` | DATE | NULLABLE | Semester end date |
| `is_active` | BOOLEAN | DEFAULT false | Current active semester flag |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `INDEX idx_tahun (tahun)`
- `INDEX idx_active (is_active)`

**Seed Data:**
```sql
INSERT INTO res_semester (name, tahun, start_date, end_date, is_active) VALUES
('Semester 1', '2025/2026', '2025-07-15', '2025-12-20', true),
('Semester 2', '2025/2026', '2026-01-10', '2026-06-15', false);
```

**Notes:**
- `tahun` = academic year (e.g., "2025/2026")
- Only one semester should have `is_active = true` at a time

---

### Table: `res_mata_pelajaran`

**Purpose:** Course/subject catalog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Subject ID |
| `name` | VARCHAR(255) | NOT NULL | Subject name (e.g., "Pemrograman Dasar") |
| `code` | VARCHAR(50) | UNIQUE, NULLABLE | Subject code (e.g., "TK101") |
| `level_id` | BIGINT | FK → `res_kelas.id` ON DELETE CASCADE | Class level this subject is taught in |
| `jurusan_id` | BIGINT | FK → `res_jurusan.id` NULLABLE | Major/program (NULL = all majors) |
| `credits` | INTEGER | DEFAULT 0 | Credit hours (SKS) |
| `description` | TEXT | NULLABLE | Subject description |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `INDEX idx_level_id (level_id)`
- `INDEX idx_jurusan_id (jurusan_id)`
- `UNIQUE INDEX idx_code (code)`

**Relationships:**
- `kelas()` → belongsTo `res_kelas` (many-to-one)
- `jurusan()` → belongsTo `res_jurusan` (many-to-one, optional)
- `enrollments()` → hasMany `res_enrollment` (one-to-many, if enrollment exists)
- `grades()` → hasMany `res_nilai` (one-to-many, if grades table exists)

**Seed Data:**
```sql
INSERT INTO res_mata_pelajaran (name, code, level_id, jurusan_id, credits) VALUES
('Pemrograman Dasar', 'TK101', 1, 1, 3),
('Matematika Diskrit', 'TK102', 1, 1, 3),
('Struktur Data', 'TK103', 1, 1, 4),
('Basis Data', 'TK104', 1, 1, 3),
('Jaringan Komputer', 'TK105', 1, 1, 3);
```

**Notes:**
- `level_id` = class grade (X, XI, XII)
- `jurusan_id` = major (TKJ, RPL, etc.). If NULL, subject is for all majors
- `code` should be unique (e.g., "TK101" = Teknik Komputer 101)

---

## Academic Operations (New Tables)

> **These tables are NOT in old PHP schema but needed for full academic functionality.**

### Table: `res_enrollment` (KRS - Course Enrollment)

**Purpose:** Student course registration per semester (Kartu Rencana Studi)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Enrollment ID |
| `student_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Student user |
| `semester_id` | BIGINT | FK → `res_semester.id` ON DELETE CASCADE | Semester |
| `kelas_id` | BIGINT | FK → `res_kelas.id` ON DELETE CASCADE | Class level |
| `created_at` | TIMESTAMP | NULLABLE | Enrollment timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `UNIQUE INDEX idx_unique_enrollment (student_id, semester_id, kelas_id)`
- `INDEX idx_semester_id (semester_id)`
- `INDEX idx_kelas_id (kelas_id)`

**Relationships:**
- `student()` → belongsTo `users` (many-to-one)
- `semester()` → belongsTo `res_semester` (many-to-one)
- `kelas()` → belongsTo `res_kelas` (many-to-one)
- `grades()` → hasMany `res_nilai` (one-to-many)

**Notes:**
- One student can have multiple enrollments per semester (different classes)
- Composite unique constraint prevents duplicate enrollment in same class/semester

---

### Table: `res_nilai` (Grades - KHS)

**Purpose:** Student grades per subject per semester (Kartu Hasil Studi)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Grade ID |
| `enrollment_id` | BIGINT | FK → `res_enrollment.id` ON DELETE CASCADE | Enrollment reference |
| `subject_id` | BIGINT | FK → `res_mata_pelajaran.id` ON DELETE CASCADE | Subject |
| `semester_id` | BIGINT | FK → `res_semester.id` ON DELETE CASCADE | Semester |
| `score` | DECIMAL(5,2) | NULLABLE | Numeric score (0.00 - 100.00) |
| `grade` | CHAR(2) | NULLABLE | Letter grade (A, A-, B+, B, etc.) |
| `predicate` | VARCHAR(5) | NULLABLE | Predicate (A, B, C, D, E) |
| `created_at` | TIMESTAMP | NULLABLE | Entry timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `UNIQUE INDEX idx_enrollment_subject (enrollment_id, subject_id)`
- `INDEX idx_semester_id (semester_id)`
- `INDEX idx_grade (grade)`

**Relationships:**
- `enrollment()` → belongsTo `res_enrollment` (many-to-one)
- `subject()` → belongsTo `res_mata_pelajaran` (many-to-one)
- `semester()` → belongsTo `res_semester` (many-to-one)

**Computed Fields:**
- `IPK` = average of all `score` values for a student across semesters
- `total_sks` = sum of credits for passed subjects

**Notes:**
- Grade conversion: score 90-100 = A, 85-89 = A-, etc. (per school policy)
- `predicate` stores simplified grade (A/B/C/D/E) for quick display

---

## Attendance (Future Extension)

> **Deferred per user decision — schema designed for future implementation**

### Table: `res_attendance` (Proposed)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Attendance record ID |
| `student_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Student |
| `class_id` | BIGINT | FK → `res_kelas.id` ON DELETE CASCADE | Class |
| `subject_id` | BIGINT | FK → `res_mata_pelajaran.id` NULLABLE | Subject (if subject-specific) |
| `semester_id` | BIGINT | FK → `res_semester.id` ON DELETE CASCADE | Semester |
| `date` | DATE | NOT NULL | Attendance date |
| `status` | ENUM | ('hadir','sakit','izin','alpha') NOT NULL | Attendance status |
| `time_in` | TIME | NULLABLE | Check-in time |
| `time_out` | TIME | NULLABLE | Check-out time |
| `notes` | TEXT | NULLABLE | Teacher notes/reason |
| `created_by` | BIGINT | FK → `users.id` | Teacher who recorded |
| `created_at` | TIMESTAMP | NULLABLE | Record creation |
| `updated_at` | TIMESTAMP | NULLABLE | Last update |

**Indexes:**
- `INDEX idx_student_date (student_id, date)`
- `INDEX idx_class_date (class_id, date)`
- `INDEX idx_semester (semester_id)`

---

## Business Operations

### Table: `res_payment`

**Purpose:** Student payment/fee records (SPP, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Payment ID |
| `student_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | **ADDED: Student reference** |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | Payment code (e.g., "INV-20240401-001") |
| `description` | VARCHAR(255) | NOT NULL | Payment description (e.g., "SPP April 2024") |
| `price` | DECIMAL(10,2) | NOT NULL | Unit price |
| `quantity` | INTEGER | DEFAULT 1 | Quantity |
| `total` | DECIMAL(10,2) | NOT NULL | Total amount (price × quantity) |
| `order_data` | JSON | NULLABLE | Additional payment metadata (JSON) |
| `payment_status` | ENUM | ('draft','on_process','done','cancel') DEFAULT 'draft' | Payment status |
| `paid_at` | TIMESTAMP | NULLABLE | Payment completion timestamp |
| `created_at` | TIMESTAMP | NULLABLE | Record creation |
| `updated_at` | TIMESTAMP | NULLABLE | Last update |

**Indexes:**
- `UNIQUE INDEX idx_code (code)`
- `INDEX idx_student_id (student_id)`
- `INDEX idx_status (payment_status)`

**Relationships:**
- `student()` → belongsTo `users` (many-to-one)

**Improvements from old schema:**
- ✅ Added `student_id` FK (was missing — orphan payments)
- ✅ Changed `price`, `total` to DECIMAL for precision (was FLOAT)
- ✅ Added `paid_at` timestamp for tracking
- ✅ Keep `order_data` as JSON for flexibility

**Notes:**
- Old table had no FK to students — this breaks data integrity
- New schema enforces referential integrity

---

### Table: `res_payment_method`

**Purpose:** Available payment methods (Bank transfer, Cash, E-wallet, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Payment method ID |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Method name (e.g., "Transfer Bank BCA") |
| `provider` | VARCHAR(100) | NULLABLE | Provider (e.g., "BCA", "GoPay") |
| `account_number` | VARCHAR(50) | NULLABLE | Payment account/receiver number |
| `account_name` | VARCHAR(255) | NULLABLE | Account holder name |
| `instructions` | TEXT | NULLABLE | Payment instructions |
| `is_active` | BOOLEAN | DEFAULT true | Whether method is available |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Seed Data:**
```sql
INSERT INTO res_payment_method (name, provider, account_number, account_name) VALUES
('Transfer Bank BCA', 'BCA', '1234567890', 'SMK TERPADU'),
('Transfer Bank Mandiri', 'Mandiri', '0987654321', 'SMK TERPADU'),
('Tunai', 'Cash', NULL, 'Keuangan'),
('GoPay', 'GoPay', '081234567890', 'SMK TERPADU');
```

**Notes:**
- Old table was empty (only `id` + timestamps)
- Expanded with realistic fields for payment method management

---

## Content & Communication

### Table: `res_announcement`

**Purpose:** School announcements (news, events, notices)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Announcement ID |
| `title` | VARCHAR(255) | NOT NULL | Announcement title |
| `description` | VARCHAR(255) | NULLABLE | Short summary |
| `content` | TEXT | NOT NULL | Full announcement content |
| `category` | VARCHAR(50) | NULLABLE | Category: 'umum', 'akademik', 'keuangan', 'kegiatan' |
| `priority` | ENUM | ('normal','important','urgent') DEFAULT 'normal' | Priority level |
| `author_id` | BIGINT | FK → `users.id` ON DELETE SET NULL | Author (teacher/admin) |
| `published_at` | TIMESTAMP | NULLABLE | Publication date/time |
| `expires_at` | TIMESTAMP | NULLABLE | Expiration date (optional) |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `INDEX idx_author_id (author_id)`
- `INDEX idx_category (category)`
- `INDEX idx_priority (priority)`
- `INDEX idx_published (published_at)`

**Relationships:**
- `author()` → belongsTo `users` (many-to-one)
- `recipients()` → belongsToMany `users` via `announcement_user` pivot

**Improvements:**
- ✅ `author_id` instead of `user_id` (clearer)
- ✅ Added `category` and `priority` for filtering
- ✅ Added `published_at` and `expires_at` for scheduling

---

### Table: `announcement_user` (Pivot)

**Purpose:** Many-to-many: announcements ↔ users (targeted announcements)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `announcement_id` | BIGINT | FK → `res_announcement.id` ON DELETE CASCADE | Announcement |
| `user_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Target user |
| `is_read` | BOOLEAN | DEFAULT false | Read status |
| `read_at` | TIMESTAMP | NULLABLE | Read timestamp |
| `created_at` | TIMESTAMP | NULLABLE | Created when announcement assigned |

**Primary Key:** `(announcement_id, user_id)` composite

**Indexes:**
- `INDEX idx_user_id (user_id)`
- `INDEX idx_is_read (is_read)`

**Relationships:**
- `announcement()` → belongsTo `res_announcement`
- `user()` → belongsTo `users`

**Notes:**
- Old PHP defined `announcement()` belongsToMany in User model but no migration existed
- Required for targeted announcements (e.g., only to students of X class)
- Without this table, all announcements are global

---

## System Configuration

### Table: `res_config`

**Purpose:** Key-value store for system settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Config ID |
| `key` | VARCHAR(100) | UNIQUE, NOT NULL | Config key (e.g., "school_name") |
| `value` | TEXT | NULLABLE | Config value (JSON serialized if needed) |
| `description` | VARCHAR(255) | NULLABLE | Human-readable description |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Indexes:**
- `UNIQUE INDEX idx_key (key)`

**Seed Data:**
```sql
INSERT INTO res_config (key, value, description) VALUES
('school_name', 'SMK TERPADU', 'School name displayed in header'),
('school_address', 'Jl. Pendidikan No. 123', 'School full address'),
('school_phone', '021-1234567', 'School contact number'),
('academic_year', '2025/2026', 'Current academic year'),
('semester_id', '1', 'Current active semester ID');
```

**Notes:**
- Old model had empty `set_value()` method — implement as `upsert` by key
- Can store JSON in `value` column (use TEXT type) for complex configs

---

## Future Extensions (Not Implemented)

### Table: `res_guru_mapel` (Teacher Subject Assignment)

**Purpose:** Assign teachers to subjects by class level

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Assignment ID |
| `teacher_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Teacher user |
| `subject_id` | BIGINT | FK → `res_mata_pelajaran.id` ON DELETE CASCADE | Subject |
| `kelas_id` | BIGINT | FK → `res_kelas.id` ON DELETE CASCADE | Class level |
| `semester_id` | BIGINT | FK → `res_semester.id` ON DELETE CASCADE | Semester |
| `created_at` | TIMESTAMP | NULLABLE | Assignment timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

**Unique:** `(teacher_id, subject_id, kelas_id, semester_id)`

---

### Table: `res_jadwal` (Class Schedule)

**Purpose:** Class schedule/timetable

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Schedule ID |
| `kelas_id` | BIGINT | FK → `res_kelas.id` ON DELETE CASCADE | Class |
| `subject_id` | BIGINT | FK → `res_mata_pelajaran.id` ON DELETE CASCADE | Subject |
| `teacher_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Teacher |
| `day_of_week` | ENUM | ('senin','selasa','rabu','kamis','jumat','sabtu') NOT NULL | Day |
| `start_time` | TIME | NOT NULL | Class start time |
| `end_time` | TIME | NOT NULL | Class end time |
| `room` | VARCHAR(50) | NULLABLE | Classroom location |
| `semester_id` | BIGINT | FK → `res_semester.id` ON DELETE CASCADE | Semester |
| `created_at` | TIMESTAMP | NULLABLE | Creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Update timestamp |

---

### Table: `res_kehadiran` (Attendance - if implemented later)

**Purpose:** Student attendance tracking per session

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AI | Attendance ID |
| `student_id` | BIGINT | FK → `users.id` ON DELETE CASCADE | Student |
| `jadwal_id` | BIGINT | FK → `res_jadwal.id` ON DELETE CASCADE | Scheduled class |
| `date` | DATE | NOT NULL | Attendance date |
| `status` | ENUM | ('hadir','sakit','izin','alpha','terlambat') NOT NULL | Attendance status |
| `time_in` | TIME | NULLABLE | Check-in time |
| `time_out` | TIME | NULLABLE | Check-out time |
| `notes` | TEXT | NULLABLE | Reason for absence/lateness |
| `recorded_by` | BIGINT | FK → `users.id` | Teacher who recorded |
| `created_at` | TIMESTAMP | NULLABLE | Record creation |
| `updated_at` | TIMESTAMP | NULLABLE | Last update |

**Unique:** `(student_id, jadwal_id, date)`

---

## Migration Order (Drizzle)

When generating migrations with Drizzle Kit, tables must be created in dependency order:

1. **`res_roles`** (no dependencies)
2. **`users`** (depends on `res_roles`)
3. **`res_jurusan`** (no dependencies)
4. **`res_kelas`** (no dependencies)
5. **`res_semester`** (no dependencies)
6. **`res_mata_pelajaran`** (depends on `res_kelas`, optional `res_jurusan`)
7. **`res_profile`** (depends on `users`, optional `res_jurusan`)
8. **`res_profile_assets`** (depends on `users`)
9. **`res_config`** (no dependencies)
10. **`res_announcement`** (depends on `users`)
11. **`announcement_user`** pivot (depends on `res_announcement`, `users`)
12. **`res_payment_method`** (no dependencies)
13. **`res_payment`** (depends on `users`)
14. **`res_enrollment`** (depends on `users`, `res_semester`, `res_kelas`) — NEW
15. **`res_nilai`** (depends on `res_enrollment`, `res_mata_pelajaran`, `res_semester`) — NEW

---

## Drizzle Schema File Structure

```
src/lib/db/
├── index.ts          # drizzle(client) export
└── schema/
    ├── index.ts      # Barrel export: export * from './users' etc.
    ├── users.ts      # users table + res_profile (merged or separate)
    ├── roles.ts      # res_roles
    ├── academic/
    │   ├── index.ts
    │   ├── jurusan.ts
    │   ├── kelas.ts
    │   ├── semester.ts
    │   ├── mata_pelajaran.ts
    │   ├── enrollment.ts (new)
    │   └── nilai.ts (new)
    ├── announcements.ts
    ├── payments.ts
    ├── config.ts
    └── attendance/   # future
        ├── index.ts
        ├── attendance.ts
        └── kehadiran.ts
```

---

## Data Type Mapping (Laravel → Drizzle)

| Laravel | MySQL | Drizzle |
|---------|-------|---------|
| `bigIncrements` | BIGINT AUTO_INCREMENT | `bigint().primaryKey().autoincrement()` |
| `string` | VARCHAR(255) | `varchar(255)` |
| `string` with unique | VARCHAR(255) UNIQUE | `varchar(255).unique()` |
| `text` | TEXT | `text()` |
| `boolean` | TINYINT(1) | `boolean()` |
| `enum` | ENUM | `varchar(50)` + check constraint or enum type |
| `integer` | INT | `integer()` |
| `float` | FLOAT | `real()` |
| `decimal` | DECIMAL | `decimal(precision, scale)` |
| `timestamp` | TIMESTAMP | `timestamp()` |
| `date` | DATE | `date()` |
| `time` | TIME | `time()` |
| `json` | JSON | `json()` |
| `foreignId` | BIGINT | `bigint().references(() => table.id)` |

---

## Better Auth Integration

Better Auth expects specific table structures. If using Drizzle adapter:

### Required Auth Tables (from Better Auth):
- `users` — already exists (must have `id`, `email`, `password`, `createdAt`, `updatedAt`)
- `accounts` — for OAuth (optional if email/password only)
- `sessions` — for sessions (optional if using JWT)
- `verifications` — for email verification

**Our `users` table matches Better Auth requirements** (id, email, password, timestamps). No changes needed.

---

## Migration Commands (Drizzle Kit)

```bash
# Generate migration from schema changes
bun drizzle-kit generate:mysql

# Push schema directly (dev only, no migrations)
bun drizzle-kit push

# Run generated migrations
bun drizzle-kit migrate

# Studio (visual schema browser)
bun drizzle-kit studio
```

**Config:** `drizzle.config.ts` should point to `src/lib/db/schema/` and use MySQL driver.

---

## Seed Data Strategy

Create `src/lib/db/seed.ts` or use Drizzle's seeding:

```typescript
import { db } from './index';
import { roles, users, profile, jurusan, kelas, semester, mataPelajaran } from './schema';

export async function seed() {
  // 1. Roles
  await db.insert(roles).values([...]);

  // 2. Jurusan
  await db.insert(jurusan).values([...]);

  // 3. Kelas
  await db.insert(kelas).values([...]);

  // 4. Semester
  await db.insert(semester).values([...]);

  // 5. Mata Pelajaran
  await db.insert(mataPelajaran).values([...]);

  // 6. Users + Profile
  await db.insert(users).values([...]);
  await db.insert(profile).values([...]);
}
```

Run: `bun run db-seed` (add script to package.json)

---

## Summary Statistics

| Category | Tables | Total Columns |
|----------|--------|---------------|
| Core Auth | 3 (users, res_roles, res_profile) | ~60 |
| Academic Structure | 4 (jurusan, kelas, semester, mata_pelajaran) | ~20 |
| Academic Operations (new) | 2 (enrollment, nilai) | ~18 |
| Business | 3 (payment, payment_method, config) | ~25 |
| Content | 2 (announcement, announcement_user pivot) | ~12 |
| Assets | 1 (res_profile_assets) | ~10 |
| **TOTAL** | **15 core tables** + **1 pivot** | **~135 columns** |

---

**Last Updated:** 2026-04-23  
**Based on:** `docs/oldphp/sister_spt/` Laravel 12 schema analysis  
**Adapted for:** Next.js 16 + Drizzle ORM + MySQL
