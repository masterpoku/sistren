import { relations } from "drizzle-orm";
import {
  bigint,
  char,
  decimal,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { enrollments } from "./enrollments";
import { subjects } from "./subjects";
import { users } from "./users";

/**
 * Student grades per subject per semester.
 *
 * Unified table covering knowledge, skill, attitude, and extracurricular.
 * Type field distinguishes the category — sub-score columns are nullable
 * and only relevant for the matching type (e.g., dailyTest1-4, midterm,
 * finalExam for 'knowledge'; practical, project, portfolio for 'skill').
 *
 * score is the final computed or entered grade value.
 * teacherId tracks which teacher entered the grade.
 * Unique: one grade row per (enrollment, subject, type).
 */
export const grades = mysqlTable(
  "grades",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    enrollmentId: bigint("enrollment_id", { mode: "number" })
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    subjectId: bigint("subject_id", { mode: "number" })
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", [
      "knowledge",
      "skill",
      "attitude",
      "extracurricular",
    ]).notNull(),

    // Knowledge sub-scores (type = 'knowledge')
    dailyTest1: decimal("daily_test_1", { precision: 5, scale: 2 }),
    dailyTest2: decimal("daily_test_2", { precision: 5, scale: 2 }),
    dailyTest3: decimal("daily_test_3", { precision: 5, scale: 2 }),
    dailyTest4: decimal("daily_test_4", { precision: 5, scale: 2 }),
    midterm: decimal("midterm", { precision: 5, scale: 2 }),
    finalExam: decimal("final_exam", { precision: 5, scale: 2 }),

    // Skill sub-scores (type = 'skill')
    practical: decimal("practical", { precision: 5, scale: 2 }),
    project: decimal("project", { precision: 5, scale: 2 }),
    portfolio: decimal("portfolio", { precision: 5, scale: 2 }),

    // Teacher who entered the grade
    teacherId: varchar("teacher_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Results
    score: decimal("score", { precision: 5, scale: 2 }),
    grade: char("grade", { length: 2 }),
    predicate: varchar("predicate", { length: 20 }),
    description: text("description"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    enrollmentSubjectTypeUnique: unique("grades_est_unique").on(
      table.enrollmentId,
      table.subjectId,
      table.type
    ),
  })
);

export const gradesRelations = relations(grades, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [grades.enrollmentId],
    references: [enrollments.id],
  }),
  subject: one(subjects, {
    fields: [grades.subjectId],
    references: [subjects.id],
  }),
  teacher: one(users, {
    fields: [grades.teacherId],
    references: [users.id],
  }),
}));
