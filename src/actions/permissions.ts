"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { permissions, rolePermissions, roles } from "@/lib/db/schema";

export async function getRoles() {
  await verifyRoleLevel(100);

  return db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      level: roles.level,
      isDefault: roles.isDefault,
    })
    .from(roles)
    .where(isNull(roles.deletedAt))
    .orderBy(roles.level);
}

export async function getPermissions() {
  await verifyRoleLevel(100);

  return db
    .select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      resource: permissions.resource,
      action: permissions.action,
      scope: permissions.scope,
    })
    .from(permissions)
    .where(isNull(permissions.deletedAt))
    .orderBy(permissions.resource, permissions.action);
}

export async function getRolePermissions(roleId: number) {
  await verifyRoleLevel(100);

  const assigned = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        isNull(rolePermissions.deletedAt)
      )
    );

  return assigned.map((r) => r.permissionId);
}

export async function assignPermission(
  roleId: number,
  permissionId: number
) {
  await verifyRoleLevel(100);

  const [existing] = await db
    .select({ roleId: rolePermissions.roleId })
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      )
    )
    .limit(1);

  if (existing) {
    // Un-delete if it was soft-deleted
    await db
      .update(rolePermissions)
      .set({ deletedAt: null })
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        )
      );
  } else {
    await db.insert(rolePermissions).values({ roleId, permissionId });
  }

  revalidatePath("/permissions");
  return { success: true };
}

export async function revokePermission(
  roleId: number,
  permissionId: number
) {
  await verifyRoleLevel(100);

  await db
    .update(rolePermissions)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
        isNull(rolePermissions.deletedAt)
      )
    );

  revalidatePath("/permissions");
  return { success: true };
}
