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
import { classes } from "./classes";
import { enrollments } from "./enrollments";
import { subjects } from "./subjects";
import { users } from "./users";

/**
 * Student attendance records.
 *
 * One row per student per subject per session date
 * (unique on enrollmentId+subjectId+sessionDate).
 * Upsert behavior via unique constraint when teacher re-opens same date.
 * Status values: present (Hadir), sick (Sakit), permit (Izin), absent (Alpha), late (Terlambat).
 * sessionDate stored as timestamp at UTC midnight for portability.
 */
export const attendance = mysqlTable(
  "attendance",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    classId: bigint("class_id", { mode: "number" })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    enrollmentId: bigint("enrollment_id", { mode: "number" })
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    subjectId: bigint("subject_id", { mode: "number" })
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
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
      table.subjectId,
      table.sessionDate
    ),
    enrollmentIdx: index("attendance_enrollment_idx").on(table.enrollmentId),
    subjectIdx: index("attendance_subject_idx").on(table.subjectId),
    classIdx: index("attendance_class_idx").on(table.classId),
    sessionDateIdx: index("attendance_session_date_idx").on(table.sessionDate),
  })
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  enrollment: one(enrollments, {
    fields: [attendance.enrollmentId],
    references: [enrollments.id],
  }),
  subject: one(subjects, {
    fields: [attendance.subjectId],
    references: [subjects.id],
  }),
  recordedBy: one(users, {
    fields: [attendance.recordedById],
    references: [users.id],
  }),
}));
