import { mysqlTable, bigint, varchar, text, date, timestamp, mysqlEnum, int } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { majors } from './majors'

/**
 * Extended user profiles for students (siswa) and teachers (guru).
 *
 * One-to-one with users. Stores demographic, physical, parent info.
 * Normalized: major_id FK (instead of denormalized jurusan string)
 * Added: section (class division), enrolled_at (date student started)
 */
export const profiles = mysqlTable('profiles', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['siswa', 'guru', 'admin', 'superadmin']).default('siswa'),
  name: varchar('name', { length: 255 }).notNull(),
  previousSchool: varchar('previous_school', { length: 255 }),
  nik: varchar('nik', { length: 255 }),
  nisn: varchar('nisn', { length: 255 }),
  birthPlace: varchar('birth_place', { length: 255 }),
  birthDate: date('birth_date'),
  gender: mysqlEnum('gender', ['male', 'female']).default('male'),
  address: text('address'),
  birthOrder: int('birth_order'),
  siblingsCount: int('siblings_count'),
  weightKg: int('weight_kg'),
  heightCm: int('height_cm'),
  phone: varchar('phone', { length: 20 }),
  religion: varchar('religion', { length: 50 }),
  diplomaNumber: varchar('diploma_number', { length: 255 }),
  skhuNumber: varchar('skhu_number', { length: 255 }),
  majorId: bigint('major_id', { mode: 'number' }).references(() => majors.id),
  uniformSize: varchar('uniform_size', { length: 10 }),
  fatherName: varchar('father_name', { length: 255 }),
  fatherNik: varchar('father_nik', { length: 255 }),
  fatherOccupation: varchar('father_occupation', { length: 255 }),
  motherName: varchar('mother_name', { length: 255 }),
  motherNik: varchar('mother_nik', { length: 255 }),
  parentsAddress: text('parents_address'),
  parentsPhone: varchar('parents_phone', { length: 20 }),
  teacherId: varchar('teacher_id', { length: 255 }),
  subjectTaught: varchar('subject_taught', { length: 255 }),
  status: varchar('status', { length: 50 }),
  alternateAddress: text('alternate_address'),
  section: varchar('section', { length: 10 }),
  enrolledAt: date('enrolled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
deletedAt: timestamp('deleted_at'),
  
})

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  major: one(majors, {
    fields: [profiles.majorId],
    references: [majors.id],
  }),
}))
