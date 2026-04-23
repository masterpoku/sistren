import { mysqlTable, bigint, varchar, int, text, timestamp } from 'drizzle-orm/mysql-core'
import { classes, majors } from './index'

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
  classId: bigint('class_id', { mode: 'number' }).notNull().references(() => classes.id, { onDelete: 'cascade' }),
  majorId: bigint('major_id', { mode: 'number' }).references(() => majors.id),
  credits: int('credits').default(0),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})
