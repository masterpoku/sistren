'use server'
'use node'

import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { db } from '@/lib/db'
import { permissions, rolePermissions, roles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ==================== PERMISSIONS ====================

export async function getAllPermissions() {
  await verifyRoleLevel(100) // superadmin only
  return await db.select().from(permissions).orderBy(permissions.resource, permissions.action)
}

export async function getPermissionsByResource() {
  await verifyRoleLevel(100) // superadmin only
  
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

export interface CreatePermissionData {
  name: string
  resource: string
  action: string
  description?: string
}

export async function createPermission(data: CreatePermissionData) {
  await verifyRoleLevel(100) // superadmin only
  
  // Check if permission already exists
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
  
  // Get the inserted permission
  const [newPerm] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.name, data.name))
  
  return { success: true, permissionId: newPerm.id }
}

export async function updatePermission(id: number, data: { name?: string; description?: string }) {
  await verifyRoleLevel(100) // superadmin only
  
  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.description !== undefined) updateFields.description = data.description
  
  await db.update(permissions).set(updateFields).where(eq(permissions.id, id))
  
  return { success: true }
}

export async function deletePermission(id: number) {
  await verifyRoleLevel(100) // superadmin only
  
  // CASCADE will handle role_permissions
  await db.delete(permissions).where(eq(permissions.id, id))
  
  return { success: true }
}

// ==================== ROLES ====================

export async function getAllRoles() {
  await verifyRoleLevel(100) // superadmin only
  
  return await db.select().from(roles).orderBy(roles.level)
}

export interface RoleWithPermissions {
  id: number
  name: string
  description: string | null
  level: number
  isDefault: boolean
  permissions: { id: number; name: string; resource: string; action: string }[]
}

export async function getRoleWithPermissions(roleId: number): Promise<RoleWithPermissions | null> {
  await verifyRoleLevel(100) // superadmin only
  
  // Get role
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId))
  if (!role) return null
  
  // Get permissions for this role
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

export async function getAllRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  await verifyRoleLevel(100) // superadmin only
  
  const allRoles = await db.select().from(roles).orderBy(roles.level)
  
  const result: RoleWithPermissions[] = []
  
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
  await verifyRoleLevel(100) // superadmin only
  
  try {
    await db.insert(rolePermissions).values({
      roleId,
      permissionId,
    })
    return { success: true }
  } catch (e: any) {
    // Duplicate entry
    if (e.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Permission already assigned to role' }
    }
    throw e
  }
}

export async function removePermissionFromRole(roleId: number, permissionId: number) {
  await verifyRoleLevel(100) // superadmin only
  
  await db.delete(rolePermissions).where(
    and(
      eq(rolePermissions.roleId, roleId),
      eq(rolePermissions.permissionId, permissionId)
    )
  )
  
  return { success: true }
}

export async function updateRole(roleId: number, data: { name?: string; description?: string; isDefault?: boolean }) {
  await verifyRoleLevel(100) // superadmin only
  
  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.description !== undefined) updateFields.description = data.description
  if (data.isDefault !== undefined) updateFields.isDefault = data.isDefault
  
  await db.update(roles).set(updateFields).where(eq(roles.id, roleId))
  
  return { success: true }
}