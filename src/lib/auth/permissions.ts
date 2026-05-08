import { db } from '@/lib/db'
import { permissions, rolePermissions, userPermissions } from '@/lib/db/schema'
import { eq, and, or, isNull, gt } from 'drizzle-orm'
import { getUserWithRole } from '@/lib/db/queries-user'

export interface UserPermissionContext {
  userId: number
  roleId: number
  roleName: string
  roleLevel: number
  permissions: Set<string>
}

/**
 * Fetches all effective permissions for a user, combining role permissions
 * with user-specific overrides.
 *
 * Permission resolution order:
 * 1. Role permissions (base permissions from role_assignment)
 * 2. User overrides (user_permissions table)
 *    - granted=true adds permission
 *    - granted=false removes permission
 *    - expired overrides are ignored
 */
export async function getUserPermissions(userId: number): Promise<UserPermissionContext | null> {
  const user = await getUserWithRole(userId)

  if (!user || user.roleId === null || !user.role) {
    return null
  }

  const now = new Date()

  const rolePermResults = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, user.roleId))

  const rolePermissionSet = new Set(rolePermResults.map(p => p.name))

  const userOverrides = await db
    .select({
      name: permissions.name,
      granted: userPermissions.granted,
      expiresAt: userPermissions.expiresAt,
    })
    .from(userPermissions)
    .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
    .where(
      and(
        eq(userPermissions.userId, userId),
        or(isNull(userPermissions.expiresAt), gt(userPermissions.expiresAt, now))
      )
    )

  const effectivePermissions = new Set(rolePermissionSet)
  for (const override of userOverrides) {
    if (override.granted) {
      effectivePermissions.add(override.name)
    } else {
      effectivePermissions.delete(override.name)
    }
  }

  return {
    userId: user.id,
    roleId: user.roleId as number,
    roleName: user.role.name,
    roleLevel: user.role.level as number,
    permissions: effectivePermissions,
  }
}

/**
 * Checks if a user has a specific permission.
 * Superadmin (level >= 100) has all permissions implicitly.
 */
export async function hasPermission(userId: number, permission: string): Promise<boolean> {
  const ctx = await getUserPermissions(userId)
  if (!ctx) return false

  if (ctx.roleLevel >= 100) {
    return true
  }

  return ctx.permissions.has(permission)
}

/**
 * Checks if a user has any of the specified permissions.
 */
export async function hasAnyPermission(userId: number, permissionList: string[]): Promise<boolean> {
  const ctx = await getUserPermissions(userId)
  if (!ctx) return false

  if (ctx.roleLevel >= 100) {
    return true
  }

  return permissionList.some(p => ctx.permissions.has(p))
}

/**
 * Checks if a user has all of the specified permissions.
 */
export async function hasAllPermissions(userId: number, permissionList: string[]): Promise<boolean> {
  const ctx = await getUserPermissions(userId)
  if (!ctx) return false

  if (ctx.roleLevel >= 100) {
    return true
  }

  return permissionList.every(p => ctx.permissions.has(p))
}

/**
 * Checks if a user's role level is at or above the specified level.
 * Useful for hierarchical checks (e.g., "can manage teachers").
 */
export async function hasRoleLevel(userId: number, minLevel: number): Promise<boolean> {
  const ctx = await getUserPermissions(userId)
  if (!ctx) return false

  return ctx.roleLevel >= minLevel
}

/**
 * Grants a permission to a user (creates user_permission override).
 */
export async function grantPermission(
  userId: number,
  permissionId: number,
  expiresAt?: Date
): Promise<void> {
  await db.insert(userPermissions).values({
    userId,
    permissionId,
    granted: true,
    expiresAt,
  })
}

/**
 * Revokes a permission from a user (creates deny override).
 */
export async function revokePermission(
  userId: number,
  permissionId: number,
  expiresAt?: Date
): Promise<void> {
  await db.insert(userPermissions).values({
    userId,
    permissionId,
    granted: false,
    expiresAt,
  })
}