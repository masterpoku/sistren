import {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
  unique,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users, classes, subjects, semesters } from './index';

/**
 * Teacher assignments to class + subject per semester.
 * Unique constraint prevents duplicate assignment (same teacher/class/subject/semester).
 */
export const teacherClassSubjects = mysqlTable(
  'teacher_class_subjects',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    teacherId: varchar('teacher_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    classId: bigint('class_id', { mode: 'number' })
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    subjectId: bigint('subject_id', { mode: 'number' })
      .notNull()
      .references(() => subjects.id, { onDelete: 'cascade' }),
    semesterId: bigint('semester_id', { mode: 'number' })
      .notNull()
      .references(() => semesters.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    uniqueAssignment: unique('tcs_unique').on(
      table.teacherId,
      table.classId,
      table.subjectId,
      table.semesterId
    ),
  })
);

export const teacherClassSubjectsRelations = relations(
  teacherClassSubjects,
  ({ one }) => ({
    teacher: one(users, {
      fields: [teacherClassSubjects.teacherId],
      references: [users.id],
    }),
    class: one(classes, {
      fields: [teacherClassSubjects.classId],
      references: [classes.id],
    }),
    subject: one(subjects, {
      fields: [teacherClassSubjects.subjectId],
      references: [subjects.id],
    }),
    semester: one(semesters, {
      fields: [teacherClassSubjects.semesterId],
      references: [semesters.id],
    }),
  })
);
