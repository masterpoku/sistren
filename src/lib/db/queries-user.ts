import { db } from './index'
import { users, roles } from './schema'
import { eq, isNull, and } from 'drizzle-orm'

/**
 * Get user with role using manual left join (MariaDB compatible).
 * Filters soft-deleted users.
 */
export async function getUserWithRole(userId: number) {
  const result = await db
    .select({
      // User fields
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      password: users.password,
      roleId: users.roleId,
      createdAt: users.createdAt,
      // Role fields
      roleName: roles.name,
      roleLevel: roles.level,
      roleDescription: roles.description,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.id, String(userId)), isNull(users.deletedAt)))
    .limit(1)

  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    password: row.password,
    roleId: row.roleId,
    createdAt: row.createdAt,
    role: row.roleName ? {
      id: row.roleId,
      name: row.roleName,
      level: row.roleLevel,
      description: row.roleDescription,
    } : null,
  }
}

/**
 * Get user by email with role (for login).
 * Filters soft-deleted users.
 */
export async function getUserByEmailWithRole(email: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      password: users.password,
      roleId: users.roleId,
      createdAt: users.createdAt,
      roleName: roles.name,
      roleLevel: roles.level,
      roleDescription: roles.description,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1)

  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    password: row.password,
    roleId: row.roleId,
    createdAt: row.createdAt,
    role: row.roleName ? {
      id: row.roleId,
      name: row.roleName,
      level: row.roleLevel,
      description: row.roleDescription,
    } : null,
  }
}

/**
 * Get role by ID.
 * Filters soft-deleted roles.
 */
export async function getRoleById(roleId: number) {
  const result = await db
    .select()
    .from(roles)
    .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
    .limit(1)
  return result[0] ?? null
}