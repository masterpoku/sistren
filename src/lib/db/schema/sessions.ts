import { mysqlTable, bigint, timestamp, varchar } from 'drizzle-orm/mysql-core'
import { users } from './users'

/**
 * Sessions table — user session records for Better Auth.
 *
 * Stores session tokens with expiry. Sessions are cleaned up
 * via MySQL event scheduler (cleanup_expired_sessions).
 */
export const sessions = mysqlTable('sessions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: varchar('user_agent', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})