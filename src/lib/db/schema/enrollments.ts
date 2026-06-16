import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlEnum,
  mysqlTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { classes } from "./classes";
import { semesters } from "./semesters";
import { users } from "./users";

/**
 * Student course registration per semester (KRS).
 *
 * Tracks which student is enrolled in which class level for a given semester.
 * Unique constraint: one student per (student, semester) — enforced at DB level via unique index.
 * Status: active (aktif), transferred (pindah keluar), dropped (dropout), graduated (lulus).
 * Status transitions: active → transferred/dropped/graduated (one-way, irreversible).
 */
export const enrollments = mysqlTable(
  "enrollments",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    semesterId: bigint("semester_id", { mode: "number" })
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    classId: bigint("class_id", { mode: "number" })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", [
      "active",
      "transferred",
      "dropped",
      "graduated",
    ])
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    studentSemesterUnique: unique().on(table.studentId, table.semesterId),
    studentIdx: index("enrollments_student_idx").on(table.studentId),
  })
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  semester: one(semesters, {
    fields: [enrollments.semesterId],
    references: [semesters.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}));
