import {
  mysqlTable,
  bigint,
  varchar,
  int,
  text,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { classes, majors } from './index';
import { teacherClassSubjects } from './teacherClassSubjects';

/**
 * Subjects/courses catalog.
 *
 * Each subject belongs to a class level (X/XI/XII).
 * Optionally limited to a specific major (NULL = all majors).
 */
export const subjects = mysqlTable('subjects', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique(),
  classId: bigint('class_id', { mode: 'number' })
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  majorId: bigint('major_id', { mode: 'number' }).references(() => majors.id),
  credits: int('credits').default(0),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  class: one(classes, {
    fields: [subjects.classId],
    references: [classes.id],
  }),
  major: one(majors, {
    fields: [subjects.majorId],
    references: [majors.id],
  }),
  teacherAssignments: many(teacherClassSubjects),
}));
