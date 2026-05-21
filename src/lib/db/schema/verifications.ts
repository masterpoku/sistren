import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const verifications = mysqlTable(
  'verifications',
  {
    id: varchar('id', { length: 36 }).primaryKey().default(crypto.randomUUID()),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').onUpdateNow().notNull(),
  },
)
