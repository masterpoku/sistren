import { mysqlTable, bigint, varchar, decimal, int, json, timestamp } from 'drizzle-orm/mysql-core'
import { mysqlEnum } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

/**
 * Student fee/payment records.
 *
 * Improvements from old schema:
 * - Added student_id FK (was missing)
 * - DECIMAL for monetary precision
 * - paid_at timestamp for payment completion
 */
export const payments = mysqlTable('payments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  studentId: bigint('student_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 100 }).unique().notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: int('quantity').default(1),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  orderData: json('order_data'),
  status: mysqlEnum('status', ['draft', 'pending', 'paid', 'cancelled']).default('draft'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id],
  }),
}))
