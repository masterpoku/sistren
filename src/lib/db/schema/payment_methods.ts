import { mysqlTable, bigint, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core'

/**
 * Available payment methods (bank transfer, cash, e-wallet).
 */
export const paymentMethods = mysqlTable('payment_methods', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  provider: varchar('provider', { length: 100 }),
  accountNumber: varchar('account_number', { length: 50 }),
  accountName: varchar('account_name', { length: 255 }),
  instructions: text('instructions'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
})
