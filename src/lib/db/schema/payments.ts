import {
  mysqlTable,
  bigint,
  varchar,
  decimal,
  int,
  json,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { paymentItems } from './paymentItems';

/**
 * Student fee/payment records.
 *
 * Improvements from old schema:
 * - Added student_id FK (was missing)
 * - DECIMAL for monetary precision
 * - paid_at timestamp for payment completion
 * - Optional link to payment_items catalog (paymentItemId) — catalog price
 *   is pre-filled but never enforced; payments.price is always editable
 *   per invoice (Odoo sale-order-line pattern).
 */
export const payments = mysqlTable('payments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  studentId: varchar('student_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 100 }).unique().notNull(),
  /** Optional FK to payment_items catalog. Pre-fills description/price; never enforced. */
  paymentItemId: bigint('payment_item_id', { mode: 'number' })
    .references(() => paymentItems.id),
  description: varchar('description', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: int('quantity').default(1),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  orderData: json('order_data'),
  status: mysqlEnum('status', [
    'draft',
    'pending',
    'paid',
    'cancelled',
  ]).default('draft'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id],
  }),
  paymentItem: one(paymentItems, {
    fields: [payments.paymentItemId],
    references: [paymentItems.id],
  }),
}));
