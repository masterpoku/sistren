import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core'

/**
 * Class/grade levels (X, XI, XII) with numeric code for sorting.
 */
export const classes = mysqlTable('classes', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})
