import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core'

/**
 * Roles table — stores user role definitions for RBAC.
 *
 * Used by: users table (role_id foreign key)
 * Seeded with: superadmin, administrator, guru, siswa, alumni
 */
export const roles = mysqlTable('roles', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})
