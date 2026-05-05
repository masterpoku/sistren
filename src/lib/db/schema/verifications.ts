import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core'

/**
 * Verifications table — email verification tokens for Better Auth.
 *
 * Stores temporary tokens for email verification flow.
 * Cleanup via MySQL event scheduler (cleanup_expired_sessions).
 */
export const verifications = mysqlTable('verifications', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})