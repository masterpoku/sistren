'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { db } from '@/lib/db'
import { permissions, rolePermissions, roles, users } from '@/lib/db/schema'
import { eq, and, isNull, count } from 'drizzle-orm'

// ==================== PERMISSIONS ====================

export async function getAllPermissions() {
  await verifyPermission('permissions.manage')
  return await db.select().from(permissions).orderBy(permissions.resource, permissions.action)
}

export async function getPermissionsByResource() {
  await verifyPermission('permissions.manage')
  
  const allPerms = await db.select().from(permissions).orderBy(permissions.resource, permissions.action)
  
  // Group by resource
  const grouped: Record<string, typeof allPerms> = {}
  for (const perm of allPerms) {
    if (!grouped[perm.resource]) {
      grouped[perm.resource] = []
    }
    grouped[perm.resource].push(perm)
  }
  
  return grouped
}

export async function createPermission(data: {
  name: string
  resource: string
  action: string
  description?: string
}) {
  await verifyPermission('permissions.manage')
  
  const [existing] = await db
    .select()
    .from(permissions)
    .where(eq(permissions.name, data.name))
  
  if (existing) {
    return { success: false, error: 'Permission already exists' }
  }
  
  await db.insert(permissions).values({
    name: data.name,
    resource: data.resource,
    action: data.action,
    description: data.description || null,
  })
  
  const [newPerm] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, data.name))
  
  return { success: true, permissionId: newPerm.id }
}

export async function updatePermission(id: number, data: { name?: string; description?: string }) {
  await verifyPermission('permissions.manage')
  
  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.description !== undefined) updateFields.description = data.description
  
  await db.update(permissions).set(updateFields).where(eq(permissions.id, id))
  
  return { success: true }
}

export async function deletePermission(id: number) {
  await verifyPermission('permissions.manage')
  
  // GUARD: Check if permission is assigned to any role
  const [assignmentCount] = await db
    .select({ count: count() })
    .from(rolePermissions)
    .where(eq(rolePermissions.permissionId, id))
  
  if ((assignmentCount?.count ?? 0) > 0) {
    return { 
      success: false, 
      error: `Permission digunakan oleh ${assignmentCount.count} role. Hapus assignment terlebih dahulu.` 
    }
  }

  // Soft delete
  await db.update(permissions)
    .set({ deletedAt: new Date() })
    .where(eq(permissions.id, id))
  
  return { success: true }
}

// ==================== ROLES ====================

export async function getAllRoles() {
  await verifyPermission('roles.manage')
  
  return await db
    .select()
    .from(roles)
    .where(isNull(roles.deletedAt))
    .orderBy(roles.level)
}

export async function getRoleWithPermissions(roleId: number) {
  await verifyPermission('roles.manage')
  
  const [role] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
  
  if (!role) return null
  
  const rolePerms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId))
  
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    level: role.level ?? 0,
    isDefault: role.isDefault ?? false,
    permissions: rolePerms,
  }
}

export async function getAllRolesWithPermissions() {
  await verifyPermission('roles.manage')
  
  const allRoles = await db
    .select()
    .from(roles)
    .where(isNull(roles.deletedAt))
    .orderBy(roles.level)
  
  const result = []
  
  for (const role of allRoles) {
    const rolePerms = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        resource: permissions.resource,
        action: permissions.action,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, role.id))
    
    result.push({
      id: role.id,
      name: role.name,
      description: role.description,
      level: role.level ?? 0,
      isDefault: role.isDefault ?? false,
      permissions: rolePerms,
    })
  }
  
  return result
}

export async function assignPermissionToRole(roleId: number, permissionId: number) {
  await verifyPermission('roles.manage')
  
  try {
    await db.insert(rolePermissions).values({ roleId, permissionId })
    return { success: true }
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Permission already assigned to role' }
    }
    throw e
  }
}

export async function removePermissionFromRole(roleId: number, permissionId: number) {
  await verifyPermission('roles.manage')
  
  await db.delete(rolePermissions).where(
    and(
      eq(rolePermissions.roleId, roleId),
      eq(rolePermissions.permissionId, permissionId)
    )
  )
  
  return { success: true }
}

export async function updateRole(roleId: number, data: { 
  name?: string
  description?: string
  isDefault?: boolean
  level?: number
}) {
  await verifyPermission('roles.manage')
  
  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.description !== undefined) updateFields.description = data.description
  if (data.isDefault !== undefined) updateFields.isDefault = data.isDefault
  if (data.level !== undefined) updateFields.level = data.level
  
  await db.update(roles).set(updateFields).where(eq(roles.id, roleId))
  
  return { success: true }
}

export async function createRole(data: {
  name: string
  description?: string
  level?: number
  isDefault?: boolean
}) {
  await verifyPermission('roles.manage')
  
  const [existing] = await db
    .select()
    .from(roles)
    .where(and(eq(roles.name, data.name), isNull(roles.deletedAt)))
  
  if (existing) {
    return { success: false, error: 'Role name already exists' }
  }
  
  const [result] = await db.insert(roles).values({
    name: data.name,
    description: data.description || null,
    level: data.level ?? 0,
    isDefault: data.isDefault ?? false,
  })
  
  return { success: true, id: result.insertId }
}

export async function deleteRole(id: number) {
  await verifyPermission('roles.manage')
  
  // GUARD: Check if any users have this role
  const [userCount] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.roleId, id), isNull(users.deletedAt)))
  
  if ((userCount?.count ?? 0) > 0) {
    return { 
      success: false, 
      error: `Role digunakan oleh ${userCount.count} user. Ganti role user terlebih dahulu.` 
    }
  }

  // Soft delete
  await db.update(roles)
    .set({ deletedAt: new Date() })
    .where(eq(roles.id, id))
  
  return { success: true }
}