'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { headers } from 'next/headers';

export async function approveStudent(userId: string) {
  await verifyRoleLevel(80);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) {
    return { error: 'Pengguna tidak ditemukan.' };
  }

  if (user.emailVerified) {
    return { error: 'Pengguna sudah disetujui.' };
  }

  await db
    .update(users)
    .set({ emailVerified: true, roleId: 40 })
    .where(eq(users.id, userId));

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
    return { error: 'Pengguna tidak ditemukan.' };
  }

  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath('/admin/approvals');
  return { success: true };
}

export async function createStaffAccount(formData: FormData) {
  await verifyRoleLevel(80);

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const roleIdStr = formData.get('roleId') as string;

  if (!name || !email || !password || !roleIdStr) {
    return { error: 'Semua field wajib diisi.' };
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }

  const roleId = Number(roleIdStr);
  if (![60, 80].includes(roleId)) {
    return { error: 'Role tidak valid. Pilih Guru atau Administrator.' };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: 'Email sudah terdaftar.' };
  }

  try {
    await db.transaction(async (tx) => {
      const result = await auth.api.signUpEmail({
        body: { email, password, name },
        headers: await headers(),
      });
      const userId = ('id' in result ? result.id : result.user.id) as string;
      await tx
        .update(users)
        .set({ roleId, emailVerified: true })
        .where(eq(users.id, userId));
    });
    return { success: true };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes('already exists') ||
        err.message.includes('duplicate'))
    ) {
      return { error: 'Email sudah terdaftar.' };
    }
    return { error: 'Gagal membuat akun. Silakan coba lagi.' };
  }
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
    return { error: 'Pengguna tidak ditemukan.' };
  }

  if (user.roleLevel !== null && user.roleLevel >= 100) {
    return { error: 'Tidak dapat menghapus superadmin.' };
  }

  await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath('/admin/users');
  return { success: true };
}
