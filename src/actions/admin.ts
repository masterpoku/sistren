"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { createStaffAccountSchema, updateStaffAccountSchema } from "@/lib/validation/schemas/admin";

export async function approveStudent(userId: string) {
  await verifyRoleLevel(80);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  if (user.emailVerified) {
    return { error: "Pengguna sudah disetujui." };
  }

  await db
    .update(users)
    .set({ emailVerified: true, roleId: 40 })
    .where(eq(users.id, userId));

  revalidatePath("/admin/approvals");
  return { success: true };
}

export async function rejectStudent(userId: string) {
  await verifyRoleLevel(80);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/approvals");
  return { success: true };
}

export async function createStaffAccount(formData: FormData) {
  await verifyRoleLevel(80);

  const parsed = createStaffAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, email, password, roleId } = parsed.data;

  const [role] = await db
    .select({ id: roles.id, level: roles.level })
    .from(roles)
    .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
    .limit(1);

  if (!role || (role.level !== 60 && role.level !== 80)) {
    return { error: "Role tidak valid. Pilih Guru atau Administrator." };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  try {
    await db.transaction(async (tx) => {
      const result = await auth.api.signUpEmail({
        body: { email, password, name },
        asResponse: true,
      });
      void result;
      const [created] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!created) {
        throw new Error("User creation failed");
      }
      await tx
        .update(users)
        .set({ roleId, emailVerified: true })
        .where(eq(users.id, created.id));
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("already exists") ||
        err.message.includes("duplicate"))
    ) {
      return { error: "Email sudah terdaftar." };
    }
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }
}

export async function updateStaffAccount(userId: string, formData: FormData) {
  await verifyRoleLevel(80);

  const parsed = updateStaffAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, email, roleId } = parsed.data;

  const [role] = await db
    .select({ id: roles.id, level: roles.level })
    .from(roles)
    .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
    .limit(1);

  if (!role || (role.level !== 60 && role.level !== 80)) {
    return { error: "Role tidak valid. Pilih Guru atau Administrator." };
  }

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  if (email !== user.email) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing) {
      return { error: "Email sudah terdaftar." };
    }
  }

  await db
    .update(users)
    .set({ name, email, roleId })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteStaffAccount(userId: string) {
  await verifyRoleLevel(80);

  const [user] = await db
    .select({
      id: users.id,
      roleId: users.roleId,
      roleLevel: roles.level,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  if (user.roleLevel !== null && user.roleLevel >= 100) {
    return { error: "Tidak dapat menghapus superadmin." };
  }

  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: true };
}
