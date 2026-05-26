import {
  mysqlTable,
  bigint,
  varchar,
  text,
  mysqlEnum,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * School announcements.
 *
 * Categories: umum, akademik, keuangan, kegiatan
 * Priority: normal, important, urgent
 */
export const announcements = mysqlTable('announcements', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }),
  priority: mysqlEnum('priority', ['normal', 'important', 'urgent']).default(
    'normal'
  ),
  authorId: varchar('author_id', { length: 36 }).references(() => users.id, {
    onDelete: 'set null',
  }),
  publishedAt: timestamp('published_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, {
    fields: [announcements.authorId],
    references: [users.id],
  }),
}));
