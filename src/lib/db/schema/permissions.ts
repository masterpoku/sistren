import { mysqlTable, bigint, varchar, text, timestamp } from 'drizzle-orm/mysql-core'

/**
 * Permissions table — defines all available system permissions for RBAC.
 *
 * Permissions follow {resource}.{action} naming convention.
 * Example: users.create, grades.input, announcements.publish
 */
export const permissions = mysqlTable('permissions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: text('description'),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  scope: varchar('scope', { length: 20 }).default('global'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})