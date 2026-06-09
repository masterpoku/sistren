import { relations } from "drizzle-orm";
import {
  bigint,
  longtext,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const attachments = mysqlTable("attachments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  modelRef: varchar("model_ref", { length: 100 }).notNull(),
  idRef: bigint("id_ref", { mode: "number" }).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  data: longtext("data").notNull(),
  uploadedBy: varchar("uploaded_by", { length: 36 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  uploader: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));
