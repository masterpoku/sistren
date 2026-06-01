import {
  mysqlTable,
  bigint,
  boolean,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { permissions } from './permissions';

/**
 * User-permission overrides table — per-user permission exceptions.
 *
 * Allows temporary or permanent grant/deny of specific permissions
 * independent of role assignment. Useful for:
 * - Temporary elevated access (conference organizer)
 * - Permanent exceptions (honorary roles)
 * - Explicit denies (revoked access despite role)
 *
 * expires_at nullable = permanent override if null, temporary if set.
 */
export const userPermissions = mysqlTable('user_permissions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  permissionId: bigint('permission_id', { mode: 'number' })
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  granted: boolean('granted').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
});

export const userPermissionsRelations = relations(
  userPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [userPermissions.userId],
      references: [users.id],
    }),
    permission: one(permissions, {
      fields: [userPermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
