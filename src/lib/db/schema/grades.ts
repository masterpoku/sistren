import { mysqlTable, bigint, decimal, char, varchar, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { enrollments } from './enrollments'
import { subjects } from './subjects'
import { semesters } from './semesters'

/**
 * Student grades per subject per semester (KHS).
 *
 * Linked to enrollment (student's class registration).
 * Stores numeric score and letter grade.
 */
export const grades = mysqlTable('grades', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  enrollmentId: bigint('enrollment_id', { mode: 'number' }).notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
  subjectId: bigint('subject_id', { mode: 'number' }).notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  semesterId: bigint('semester_id', { mode: 'number' }).notNull().references(() => semesters.id, { onDelete: 'cascade' }),
  score: decimal('score', { precision: 5, scale: 2 }),
  grade: char('grade', { length: 2 }),
  predicate: varchar('predicate', { length: 5 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const gradesRelations = relations(grades, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [grades.enrollmentId],
    references: [enrollments.id],
  }),
  subject: one(subjects, {
    fields: [grades.subjectId],
    references: [subjects.id],
  }),
  semester: one(semesters, {
    fields: [grades.semesterId],
    references: [semesters.id],
  }),
}))
