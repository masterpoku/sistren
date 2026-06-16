import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

/**
 * In-app notifications.
 *
 * Used by the header bell to show pending alerts per user. Linked to
 * announcements via type='announcement' + entityId when applicable.
 * Soft delete via deletedAt.
 */
export const notifications = mysqlTable(
    "notifications",
    {
        id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
        userId: varchar("user_id", { length: 36 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message").notNull(),
        type: mysqlEnum("type", [
            "announcement",
            "grade",
            "payment",
            "system",
        ]).default("system"),
        entityId: bigint("entity_id", { mode: "number" }),
        readAt: timestamp("read_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        deletedAt: timestamp("deleted_at"),
    },
    (table) => ({
        userIdx: index("notifications_user_idx").on(table.userId),
    })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));
