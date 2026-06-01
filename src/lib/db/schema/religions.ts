import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { profiles } from './index';

/**
 * Religions reference table.
 *
 * Indonesia's 6 officially recognized religions:
 * Islam, Kristen, Katolik, Hindu, Budha, Konghucu.
 */
export const religions = mysqlTable('religions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const religionsRelations = relations(religions, ({ many }) => ({
  profiles: many(profiles),
}));
