import { mysqlTable, bigint, varchar, timestamp } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

/**
 * Uploaded document file paths for user profiles.
 *
 * One record per user (enforced by application).
 * Stores file paths relative to public/uploads/
 */
export const profileAssets = mysqlTable('profile_assets', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  diploma: varchar('diploma', { length: 255 }),
  skhu: varchar('skhu', { length: 255 }),
  skl: varchar('skl', { length: 255 }),
  nisnDoc: varchar('nisn_doc', { length: 255 }),
  birthCertificate: varchar('birth_certificate', { length: 255 }),
  fatherKtp: varchar('father_ktp', { length: 255 }),
  motherKtp: varchar('mother_ktp', { length: 255 }),
  kip: varchar('kip', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const profileAssetsRelations = relations(profileAssets, ({ one }) => ({
  user: one(users, {
    fields: [profileAssets.userId],
    references: [users.id],
  }),
}))
