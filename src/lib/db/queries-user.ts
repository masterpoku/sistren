import { db } from './index'
import { users, roles } from './schema'
import { eq } from 'drizzle-orm'

/**
 * Get user with role using manual left join (MariaDB compatible).
 * Replaces: db.query.users.findFirst({ where: eq(users.id, id), with: { role: true } })
 */
export async function getUserWithRole(userId: number) {
  const result = await db
    .select({
      // User fields
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      password: users.password,
      confirmed: users.confirmed,
      roleId: users.roleId,
      createdAt: users.createdAt,
      // Role fields
      roleName: roles.name,
      roleLevel: roles.level,
      roleDescription: roles.description,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, userId))
    .limit(1)

  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    password: row.password,
    confirmed: row.confirmed,
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
 */
export async function getUserByEmailWithRole(email: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      password: users.password,
      confirmed: users.confirmed,
      roleId: users.roleId,
      createdAt: users.createdAt,
      roleName: roles.name,
      roleLevel: roles.level,
      roleDescription: roles.description,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, email))
    .limit(1)

  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    password: row.password,
    confirmed: row.confirmed,
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
 */
export async function getRoleById(roleId: number) {
  const result = await db
    .select()
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1)
  return result[0] ?? null
}