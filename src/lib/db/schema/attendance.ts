import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { enrollments } from "./enrollments";
import { users } from "./users";

/**
 * Student attendance records.
 *
 * One row per student per session date (unique on enrollmentId+sessionDate).
 * Upsert behavior via unique constraint when teacher re-opens same date.
 * Status values: present (Hadir), sick (Sakit), permit (Izin), absent (Alpha), late (Terlambat).
 * sessionDate stored as timestamp at UTC midnight for portability.
 */
export const attendance = mysqlTable(
  "attendance",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    enrollmentId: bigint("enrollment_id", { mode: "number" })
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    sessionDate: timestamp("session_date").notNull(),
    status: mysqlEnum("status", [
      "present",
      "sick",
      "permit",
      "absent",
      "late",
    ]).notNull(),
    notes: text("notes"),
    recordedById: varchar("recorded_by_id", { length: 36 }).references(
      () => users.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    enrollmentDateUnique: unique("attendance_unique").on(
      table.enrollmentId,
      table.sessionDate
    ),
    enrollmentIdx: index("attendance_enrollment_idx").on(table.enrollmentId),
    sessionDateIdx: index("attendance_session_date_idx").on(table.sessionDate),
  })
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [attendance.enrollmentId],
    references: [enrollments.id],
  }),
  recordedBy: one(users, {
    fields: [attendance.recordedById],
    references: [users.id],
  }),
}));
