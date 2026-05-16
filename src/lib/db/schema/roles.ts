import { mysqlTable, bigint, varchar, timestamp, int, boolean } from 'drizzle-orm/mysql-core'

/**
 * Roles table — stores user role definitions for RBAC.
 *
 * Enhanced with is_default (for auto-assignment on sign-up) and
 * level (for permission hierarchy: superadmin=100 > admin=80 > guru=60 > siswa=40 > alumni=20).
 * Used by: users table (role_id foreign key)
 * Seeded with: superadmin, administrator, guru, siswa, alumni
 */
export const roles = mysqlTable('roles', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: varchar('description', { length: 255 }),
  isDefault: boolean('is_default').default(false),
  level: int('level').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
deletedAt: timestamp('deleted_at'),
  
})