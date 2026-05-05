import { mysqlTable, bigint, varchar, timestamp, text } from 'drizzle-orm/mysql-core'
import { users } from './users'

/**
 * Accounts table — OAuth provider accounts linked to users.
 *
 * Stores OAuth tokens and provider info for social login.
 * Better Auth requires this for OAuth flows.
 */
export const accounts = mysqlTable('accounts', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})