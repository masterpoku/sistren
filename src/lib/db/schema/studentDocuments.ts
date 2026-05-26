import { mysqlTable, varchar, timestamp, binary } from 'drizzle-orm/mysql-core';
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
  ijasah: binary('ijasah', { length: 16777215 }),
  skhun: binary('skhun', { length: 16777215 }),
  skl: binary('skl', { length: 16777215 }),
  aktaKelahiran: binary('akta_kelahiran', { length: 16777215 }),
  kk: binary('kk', { length: 16777215 }),
  ktpAyah: binary('ktp_ayah', { length: 16777215 }),
  ktpIbu: binary('ktp_ibu', { length: 16777215 }),
  kip: binary('kip', { length: 16777215 }),
  passFoto: binary('pass_foto', { length: 16777215 }),
  rapor: binary('rapor', { length: 16777215 }),
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
