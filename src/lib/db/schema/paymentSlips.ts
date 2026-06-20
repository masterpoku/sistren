import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  longtext,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { payments, users } from "./index";

/**
 * Payment slip records — students upload transfer receipts/proofs.
 * File is encrypted (AES-256-GCM) and stored as base64 in the DB.
 */
export const paymentSlips = mysqlTable(
  "payment_slips",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    paymentId: bigint("payment_id", { mode: "number" })
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Encrypted file stored as base64 string */
    encryptedData: longtext("encrypted_data").notNull(),
    slipFilename: varchar("slip_filename", { length: 255 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .default("pending")
      .notNull(),
    reviewedBy: varchar("reviewed_by", { length: 36 }),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: longtext("rejection_reason"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    paymentIdx: index("payment_slips_payment_idx").on(table.paymentId),
    studentIdx: index("payment_slips_student_idx").on(table.studentId),
    statusIdx: index("payment_slips_status_idx").on(table.status),
  })
);

export const paymentSlipsRelations = relations(paymentSlips, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentSlips.paymentId],
    references: [payments.id],
  }),
  student: one(users, {
    fields: [paymentSlips.studentId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [paymentSlips.reviewedBy],
    references: [users.id],
  }),
}));
