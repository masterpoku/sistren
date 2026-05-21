import { mysqlTable, bigint, varchar, boolean, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { roles } from './roles'
import { accounts } from './accounts'

/**
 * Users table — core authentication (Better Auth compatible).
 *
 * Columns:
 * - id: UUID v4 (Better Auth compatible)
 * - email: unique login
 * - emailVerified: boolean flag (Better Auth convention)
 * - password: hashed
 * - role_id: FK to roles
 */
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().default(crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: varchar('image', { length: 255 }),
  password: varchar('password', { length: 255 }).notNull(),
  roleId: bigint('role_id', { mode: 'number' }).references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  accounts: many(accounts),
}))
