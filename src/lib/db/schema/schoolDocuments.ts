import { relations } from "drizzle-orm";
import {
    bigint,
    boolean,
    int,
    longtext,
    mysqlTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

/**
 * School-wide documents (policies, circulars, forms, reports).
 * Separate entity from per-student documents (studentDocuments).
 * All blob columns are AES-256-GCM encrypted via encryptBlob().
 * Soft delete via deletedAt.
 */
export const schoolDocuments = mysqlTable("school_documents", {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: int("file_size").notNull(),
    encryptedData: longtext("encrypted_data").notNull(),
    category: varchar("category", { length: 50 }),
    isPublic: boolean("is_public").default(false).notNull(),
    uploadedBy: varchar("uploaded_by", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});

export const schoolDocumentsRelations = relations(
    schoolDocuments,
    ({ one }) => ({
        uploader: one(users, {
            fields: [schoolDocuments.uploadedBy],
            references: [users.id],
        }),
    })
);
