import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  permissions,
  rolePermissions,
  roles,
  userPermissions,
  users,
} from "@/lib/db/schema";

export interface AuthContext {
  userId: string; // string UUID
  roleId: number;
  roleLevel: number;
  roleName: string;
  permissions: Set<string>;
}

/**
 * Fetches all effective permissions for a user, combining role permissions
 * with user-specific overrides.
 *
 * Permission resolution order:
 * 1. Role permissions (base permissions from role_permissions)
 * 2. User overrides (user_permissions table)
 *    - granted=true adds permission
 *    - granted=false removes permission
 *    - expired overrides are ignored
 */
export async function getAuthContext(
  userId: string
): Promise<AuthContext | null> {
  // Query users table with role join
  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      roleId: users.roleId,
      roleName: roles.name,
      roleLevel: roles.level,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (userResult.length === 0) return null;

  const user = userResult[0];

  if (user.roleId === null) return null;

  // Get role permissions via junction table
  const rolePermResults = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, user.roleId));

  const rolePermissionSet = new Set(rolePermResults.map((p) => p.name));

  // Get user-specific permission overrides
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
        or(
          isNull(userPermissions.expiresAt),
          gt(userPermissions.expiresAt, new Date())
        )
      )
    );

  const effectivePermissions = new Set(rolePermissionSet);
  for (const override of userOverrides) {
    if (override.granted) {
      effectivePermissions.add(override.name);
    } else {
      effectivePermissions.delete(override.name);
    }
  }

  return {
    userId: user.id as string,
    roleId: user.roleId as number,
    roleName: user.roleName || "unknown",
    roleLevel: (user.roleLevel as number) ?? 0,
    permissions: effectivePermissions,
  };
}

/**
 * Checks if a user has a specific permission.
 * Superadmin (level >= 100) has all permissions implicitly.
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const ctx = await getAuthContext(userId);
  if (!ctx) return false;

  if (ctx.roleLevel >= 100) {
    return true;
  }

  return ctx.permissions.has(permission);
}

/**
 * Checks if a user has any of the specified permissions.
 */
export async function hasAnyPermission(
  userId: string,
  permissionList: string[]
): Promise<boolean> {
  const ctx = await getAuthContext(userId);
  if (!ctx) return false;

  if (ctx.roleLevel >= 100) {
    return true;
  }

  return permissionList.some((p) => ctx.permissions.has(p));
}

/**
 * Checks if a user has all of the specified permissions.
 */
export async function hasAllPermissions(
  userId: string,
  permissionList: string[]
): Promise<boolean> {
  const ctx = await getAuthContext(userId);
  if (!ctx) return false;

  if (ctx.roleLevel >= 100) {
    return true;
  }

  return permissionList.every((p) => ctx.permissions.has(p));
}

/**
 * Checks if a user's role level is at or above the specified level.
 * Useful for hierarchical checks (e.g., "can manage teachers").
 */
export async function hasRoleLevel(
  userId: string,
  minLevel: number
): Promise<boolean> {
  const ctx = await getAuthContext(userId);
  if (!ctx) return false;

  if (ctx.roleLevel >= 100) return true;

  return ctx.roleLevel >= minLevel;
}

/**
 * Grants a permission to a user (creates user_permission override).
 */
export async function grantPermission(
  userId: string,
  permissionId: number,
  expiresAt?: Date
): Promise<void> {
  await db.insert(userPermissions).values({
    userId: userId,
    permissionId,
    granted: true,
    expiresAt,
  });
}

/**
 * Revokes a permission from a user (creates deny override).
 */
export async function revokePermission(
  userId: string,
  permissionId: number,
  expiresAt?: Date
): Promise<void> {
  await db.insert(userPermissions).values({
    userId: userId,
    permissionId,
    granted: false,
    expiresAt,
  });
}
