import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

/**
 * System key-value configuration.
 */
export const systemConfigs = mysqlTable('system_configs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value'),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const systemConfigsRelations = relations(systemConfigs, () => ({}));
