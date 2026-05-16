import { mysqlTable, bigint, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { classes } from './classes'
import { semesters } from './semesters'

/**
 * Student course registration per semester (KRS).
 *
 * Tracks which student is enrolled in which class level for a given semester.
 * Unique constraint: one student can only have one enrollment per (student, semester, class).
 */
export const enrollments = mysqlTable('enrollments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  studentId: bigint('student_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  semesterId: bigint('semester_id', { mode: 'number' }).notNull().references(() => semesters.id, { onDelete: 'cascade' }),
  classId: bigint('class_id', { mode: 'number' }).notNull().references(() => classes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
deletedAt: timestamp('deleted_at'),
  
})

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  semester: one(semesters, {
    fields: [enrollments.semesterId],
    references: [semesters.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}))
