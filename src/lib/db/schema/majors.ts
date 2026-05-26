import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/mysql-core';

/**
 * Academic majors/programs (e.g., TKJ, RPL, Automotive).
 */
export const majors = mysqlTable('majors', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});
