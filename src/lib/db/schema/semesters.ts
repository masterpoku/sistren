import { mysqlTable, bigint, varchar, date, boolean, timestamp } from 'drizzle-orm/mysql-core'

/**
 * Academic semesters with academic year.
 * One semester should be marked active at a time.
 */
export const semesters = mysqlTable('semesters', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  academicYear: varchar('academic_year', { length: 255 }).notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
deletedAt: timestamp('deleted_at'),
  
})
