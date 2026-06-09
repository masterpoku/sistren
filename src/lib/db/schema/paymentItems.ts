import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  decimal,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { semesters } from "./semesters";

/**
 * Payment item catalog — Odoo-style product template.
 *
 * Each row is a reusable billing item (SPP Bulanan, Uang Gedung, dll).
 * `standardPrice` is the default/template price. `payments.price` is always
 * editable per invoice — catalog price is a default, never enforced.
 *
 * @see SPECS.md decision log 2026-05-30 — Odoo-style product + invoice line pattern
 */
export const paymentItems = mysqlTable("payment_items", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  /** Default price shown in recordPayment — always editable per invoice */
  standardPrice: decimal("standard_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  /** recurring | one_time | variable */
  type: mysqlEnum("type", ["recurring", "one_time", "variable"]).default(
    "one_time"
  ),
  /** Optional: some items are semester-specific (SPP), others are not (Uang Gedung) */
  semesterId: bigint("semester_id", { mode: "number" }).references(
    () => semesters.id
  ),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  deletedAt: timestamp("deleted_at"),
});

export const paymentItemsRelations = relations(paymentItems, ({ one }) => ({
  semester: one(semesters, {
    fields: [paymentItems.semesterId],
    references: [semesters.id],
  }),
}));
