import {
  mysqlTable,
  bigint,
  timestamp,
  primaryKey,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { roles, permissions } from './index';

/**
 * Role-permission pivot table — assigns permissions to roles.
 *
 * Each role has multiple permissions. Permissions are not inherited
 * across roles (no hierarchy in permissions themselves).
 * OnDelete CASCADE ensures cleanup when role or permission is deleted.
 */
export const rolePermissions = mysqlTable(
  'role_permissions',
  {
    roleId: bigint('role_id', { mode: 'number' })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: bigint('permission_id', { mode: 'number' })
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
