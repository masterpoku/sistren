import { mysqlTable, bigint, timestamp } from 'drizzle-orm/mysql-core'
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
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})