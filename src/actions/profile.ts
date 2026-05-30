'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { verifySession } from '@/lib/auth/verify-session';

export async function updateProfile(formData: FormData) {
  const session = await verifySession();

  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const fatherName = formData.get('fatherName') as string;
  const motherName = formData.get('motherName') as string;

  // Verify profile exists
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.userId, session.userId), isNull(profiles.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: 'Profil tidak ditemukan.' };
  }

  const updateValues: Record<string, string> = {};
  if (phone?.trim()) updateValues.phone = phone;
  if (address?.trim()) updateValues.address = address;
  if (fatherName?.trim()) updateValues.fatherName = fatherName;
  if (motherName?.trim()) updateValues.motherName = motherName;

  if (Object.keys(updateValues).length === 0) {
    return { error: 'Tidak ada data yang diubah.' };
  }

  await db
    .update(profiles)
    .set(updateValues)
    .where(eq(profiles.userId, session.userId));

  revalidatePath('/profile');
  return { success: true };
}
