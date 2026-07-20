import { relations } from "drizzle-orm";
import {
  bigint,
  decimal,
  index,
  mysqlEnum,
  mysqlTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { classes } from "./classes";
import { semesters } from "./semesters";
import { subjects } from "./subjects";
import { users } from "./users";

export const grades = mysqlTable(
  "grades",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classId: bigint("class_id", { mode: "number" })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    semesterId: bigint("semester_id", { mode: "number" })
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
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
    dailyTest5: decimal("daily_test_5", { precision: 5, scale: 2 }),
    dailyTest6: decimal("daily_test_6", { precision: 5, scale: 2 }),
    dailyTest7: decimal("daily_test_7", { precision: 5, scale: 2 }),
    dailyTest8: decimal("daily_test_8", { precision: 5, scale: 2 }),
    dailyTest9: decimal("daily_test_9", { precision: 5, scale: 2 }),
    dailyTest10: decimal("daily_test_10", { precision: 5, scale: 2 }),
    midterm: decimal("midterm", { precision: 5, scale: 2 }),
    finalExam: decimal("final_exam", { precision: 5, scale: 2 }),

    // Teacher who entered the grade
    teacherId: varchar("teacher_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Results
    score: decimal("score", { precision: 5, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    studentSubjectSemesterUnique: unique("grades_sss_unique").on(
      table.studentId,
      table.classId,
      table.semesterId,
      table.subjectId,
      table.type
    ),
    studentIdx: index("grades_student_idx").on(table.studentId),
    classIdx: index("grades_class_idx").on(table.classId),
    semesterIdx: index("grades_semester_idx").on(table.semesterId),
  })
);

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(users, {
    fields: [grades.studentId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [grades.classId],
    references: [classes.id],
  }),
  semester: one(semesters, {
    fields: [grades.semesterId],
    references: [semesters.id],
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