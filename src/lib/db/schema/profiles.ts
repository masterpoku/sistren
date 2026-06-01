import {
  mysqlTable,
  bigint,
  varchar,
  text,
  date,
  timestamp,
  mysqlEnum,
  int,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { majors } from './majors';
import { religions } from './religions';

/**
 * Extended user profiles for students (siswa) and teachers (guru).
 *
 * One-to-one with users. Stores demographic, physical, parent info.
 * Normalized: major_id FK (instead of denormalized jurusan string)
 * Added: section (class division), enrolled_at (date student started)
 *
 * NOTE: 'name' is NOT here — it lives in users.name only.
 * Parent fields: 14 total (fatherName, fatherNik, fatherOccupation,
 * fatherBirthPlace, fatherBirthDate, fatherReligion, motherName,
 * motherNik, motherOccupation, motherBirthPlace, motherBirthDate,
 * motherReligion, parentsAddress, parentsPhone)
 */
export const profiles = mysqlTable('profiles', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['siswa', 'guru', 'admin', 'superadmin']).default(
    'siswa'
  ),
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
  religionId: bigint('religion_id', { mode: 'number' }).references(
    () => religions.id
  ),
  diplomaNumber: varchar('diploma_number', { length: 255 }),
  skhuNumber: varchar('skhu_number', { length: 255 }),
  majorId: bigint('major_id', { mode: 'number' }).references(() => majors.id),
  uniformSize: varchar('uniform_size', { length: 10 }),
  section: varchar('section', { length: 10 }),
  enrolledAt: date('enrolled_at'),
  // Father fields (6)
  fatherName: varchar('father_name', { length: 255 }),
  fatherNik: varchar('father_nik', { length: 255 }),
  fatherOccupation: varchar('father_occupation', { length: 255 }),
  fatherBirthPlace: varchar('father_birth_place', { length: 255 }),
  fatherBirthDate: date('father_birth_date'),
  fatherReligion: varchar('father_religion', { length: 50 }),
  // Mother fields (6)
  motherName: varchar('mother_name', { length: 255 }),
  motherNik: varchar('mother_nik', { length: 255 }),
  motherOccupation: varchar('mother_occupation', { length: 255 }),
  motherBirthPlace: varchar('mother_birth_place', { length: 255 }),
  motherBirthDate: date('mother_birth_date'),
  motherReligion: varchar('mother_religion', { length: 50 }),
  // Parents contact
  parentsAddress: text('parents_address'),
  parentsPhone: varchar('parents_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  major: one(majors, {
    fields: [profiles.majorId],
    references: [majors.id],
  }),
}));
