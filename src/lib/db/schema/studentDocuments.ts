import {
  mysqlTable,
  varchar,
  timestamp,
  longtext,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Student documents — encrypted blobs per document type.
 * One row per student (studentId PK).
 * All blob columns are AES-256-GCM encrypted via encryptBlob().
 * Soft delete per row.
 */
export const studentDocuments = mysqlTable('student_documents', {
  studentId: varchar('student_id', { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  ijasah: longtext('ijasah'),
  skhun: longtext('skhun'),
  skl: longtext('skl'),
  aktaKelahiran: longtext('akta_kelahiran'),
  kk: longtext('kk'),
  ktpAyah: longtext('ktp_ayah'),
  ktpIbu: longtext('ktp_ibu'),
  kip: longtext('kip'),
  passFoto: longtext('pass_foto'),
  rapor: longtext('rapor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const studentDocumentsRelations = relations(
  studentDocuments,
  ({ one }) => ({
    student: one(users, {
      fields: [studentDocuments.studentId],
      references: [users.id],
    }),
  })
);
