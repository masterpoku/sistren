import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const calendarEvents = mysqlTable("calendar_events", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  allDay: boolean("all_day").default(false),
  category: mysqlEnum("category", [
    "academic",
    "holiday",
    "event",
    "meeting",
    "exam",
    "other",
  ]).default("event"),
  createdById: varchar("created_by_id", { length: 36 }).references(
    () => users.id
  ),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  deletedAt: timestamp("deleted_at"),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  createdBy: one(users, {
    fields: [calendarEvents.createdById],
    references: [users.id],
  }),
}));
