import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { announcements } from "./announcements";
import { users } from "./users";

/**
 * Pivot: announcement recipients.
 *
 * Enables targeted announcements (e.g., only to specific class).
 * Composite PK: (announcement_id, user_id)
 */
export const announcementRecipients = mysqlTable(
  "announcement_recipients",
  {
    announcementId: bigint("announcement_id", { mode: "number" })
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.announcementId, table.userId] }),
    userIdx: index("ar_user_idx").on(table.userId),
  })
);

export const announcementRecipientsRelations = relations(
  announcementRecipients,
  ({ one }) => ({
    announcement: one(announcements, {
      fields: [announcementRecipients.announcementId],
      references: [announcements.id],
    }),
    user: one(users, {
      fields: [announcementRecipients.userId],
      references: [users.id],
    }),
  })
);
