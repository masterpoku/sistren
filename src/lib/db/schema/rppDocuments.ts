import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { classes } from "./classes";
import { subjects } from "./subjects";
import { users } from "./users";

/**
 * RPP (Rencana Pelaksanaan Pembelajaran) documents uploaded by teachers
 * for administrator/superadmin review.
 *
 * Encrypted blob stored inline (longtext) rather than FK to school_documents
 * because RPP has teacher+class+subject context that school_documents lacks.
 * Status lifecycle: draft → submitted → approved | rejected | archived.
 *
 * Soft delete via deletedAt. Encrypted via AES-256-GCM (src/lib/crypto.ts).
 */
export const rppDocuments = mysqlTable(
  "rpp_documents",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    teacherId: varchar("teacher_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    classId: bigint("class_id", { mode: "number" })
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    subjectId: bigint("subject_id", { mode: "number" })
      .notNull()
      .references(() => subjects.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: int("file_size").notNull(),
    encryptedData: longtext("encrypted_data").notNull(),
    status: mysqlEnum("status", [
      "draft",
      "submitted",
      "approved",
      "rejected",
      "archived",
    ])
      .notNull()
      .default("draft"),
    reviewedBy: varchar("reviewed_by", { length: 36 }).references(
      () => users.id,
      { onDelete: "set null" }
    ),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    teacherIdx: index("rpp_documents_teacher_idx").on(table.teacherId),
    classIdx: index("rpp_documents_class_idx").on(table.classId),
    subjectIdx: index("rpp_documents_subject_idx").on(table.subjectId),
    statusIdx: index("rpp_documents_status_idx").on(table.status),
  })
);

export const rppDocumentsRelations = relations(rppDocuments, ({ one }) => ({
  teacher: one(users, {
    fields: [rppDocuments.teacherId],
    references: [users.id],
    relationName: "rpp_teacher",
  }),
  reviewer: one(users, {
    fields: [rppDocuments.reviewedBy],
    references: [users.id],
    relationName: "rpp_reviewer",
  }),
  class: one(classes, {
    fields: [rppDocuments.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [rppDocuments.subjectId],
    references: [subjects.id],
  }),
}));
