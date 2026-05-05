import { mysqlTable, bigint } from 'drizzle-orm/mysql-core'
import { roles } from './roles'
import { permissions } from './permissions'

/**
 * Role-permission pivot table — assigns permissions to roles.
 *
 * Each role has multiple permissions. Permissions are not inherited
 * across roles (no hierarchy in permissions themselves).
 * OnDelete CASCADE ensures cleanup when role or permission is deleted.
 */
export const rolePermissions = mysqlTable('role_permissions', {
  roleId: bigint('role_id', { mode: 'number' }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: bigint('permission_id', { mode: 'number' }).notNull().references(() => permissions.id, { onDelete: 'cascade' }),
})