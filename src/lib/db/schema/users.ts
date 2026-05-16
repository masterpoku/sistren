import { mysqlTable, bigint, varchar, boolean, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { roles } from './roles'
import { accounts } from './accounts'

/**
 * Users table — core authentication (Better Auth compatible).
 *
 * Columns:
 * - id: BIGINT PK (Better Auth uses bigint)
 * - email: unique login
 * - password: hashed
 * - role_id: FK to roles
 * - last_login_at: track login activity
 */
export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  confirmed: boolean('confirmed').default(false),
  username: varchar('username', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  image: varchar('image', { length: 255 }),
  emailVerifiedAt: timestamp('email_verified_at'),
  password: varchar('password', { length: 255 }).notNull(),
  roleId: bigint('role_id', { mode: 'number' }).references(() => roles.id, { onDelete: 'cascade' }),
  rememberToken: varchar('remember_token', { length: 100 }),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
deletedAt: timestamp('deleted_at'),
  
})

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  accounts: many(accounts),
}))
