import { relations } from "drizzle-orm";
import {
  bigint,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "set null",
  }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number" }),
  entityIdStr: varchar("entity_id_str", { length: 36 }),
  metadata: json("metadata").$type<{
    ip?: string;
    userAgent?: string;
    changes?: Record<string, unknown>;
  }>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
