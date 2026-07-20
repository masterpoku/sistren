import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { enrollments } from "./enrollments";
import { majors } from "./majors";
import { users } from "./users";

/**
 * Class/grade levels (X, XI, XII) with numeric code for sorting.
 */
export const classes = mysqlTable("classes", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 255 }).unique().notNull(),
  majorId: bigint("major_id", { mode: "number" }).references(() => majors.id),
  homeroomTeacherId: varchar("homeroom_teacher_id", { length: 36 }).references(
    () => users.id
  ),
  capacity: int("capacity").default(32),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  deletedAt: timestamp("deleted_at"),
});

export const classesRelations = relations(classes, ({ many, one }) => ({
  enrollments: many(enrollments),
  major: one(majors, {
    fields: [classes.majorId],
    references: [majors.id],
  }),
  homeroomTeacher: one(users, {
    fields: [classes.homeroomTeacherId],
    references: [users.id],
  }),
}));
