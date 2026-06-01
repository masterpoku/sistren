'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { paymentItems, semesters } from '@/lib/db/schema';
import { eq, isNull, and, like, or, ne } from 'drizzle-orm';
import { verifyRoleLevel } from '@/lib/auth/verify-session';

export async function getPaymentItems(opts?: {
  search?: string;
  type?: string;
  isActive?: boolean;
}) {
  await verifyRoleLevel(80);

  const conditions = [isNull(paymentItems.deletedAt)];

  if (opts?.type) {
    conditions.push(
      eq(paymentItems.type, opts.type as 'recurring' | 'one_time' | 'variable')
    );
  }

  if (opts?.isActive !== undefined) {
    conditions.push(eq(paymentItems.isActive, opts.isActive));
  }

  if (opts?.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        like(paymentItems.code, term),
        like(paymentItems.name, term),
        like(paymentItems.description, term)
      )!
    );
  }

  const rows = await db
    .select({
      id: paymentItems.id,
      code: paymentItems.code,
      name: paymentItems.name,
      description: paymentItems.description,
      standardPrice: paymentItems.standardPrice,
      type: paymentItems.type,
      semesterId: paymentItems.semesterId,
      semesterName: semesters.name,
      isActive: paymentItems.isActive,
      createdAt: paymentItems.createdAt,
    })
    .from(paymentItems)
    .leftJoin(semesters, eq(paymentItems.semesterId, semesters.id))
    .where(and(...conditions))
    .orderBy(paymentItems.code);

  return rows;
}

export async function createPaymentItem(formData: FormData) {
  await verifyRoleLevel(80);

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const standardPriceStr = formData.get('standardPrice') as string;
  const type = (formData.get('type') as string) || 'one_time';
  const semesterIdStr = formData.get('semesterId') as string;
  const isActive = formData.get('isActive') !== 'false';

  if (!code || !name || !standardPriceStr) {
    return { error: 'Kode, nama, dan harga standar wajib diisi.' };
  }

  const standardPrice = parseFloat(standardPriceStr);
  if (isNaN(standardPrice) || standardPrice < 0) {
    return { error: 'Harga standar tidak valid.' };
  }

  const [existing] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(and(eq(paymentItems.code, code), isNull(paymentItems.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: `Kode item pembayaran "${code}" sudah ada.` };
  }

  const semesterId = semesterIdStr ? parseInt(semesterIdStr, 10) : null;

  await db.insert(paymentItems).values({
    code,
    name,
    description,
    standardPrice: String(standardPrice),
    type: type as 'recurring' | 'one_time' | 'variable',
    semesterId: semesterId && !isNaN(semesterId) ? semesterId : null,
    isActive,
  });

  revalidatePath('/admin/payment-items');
  return { success: true };
}

export async function updatePaymentItem(itemId: string, formData: FormData) {
  await verifyRoleLevel(80);

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const standardPriceStr = formData.get('standardPrice') as string;
  const type = (formData.get('type') as string) || 'one_time';
  const semesterIdStr = formData.get('semesterId') as string;
  const isActive = formData.get('isActive') !== 'false';

  if (!code || !name || !standardPriceStr) {
    return { error: 'Kode, nama, dan harga standar wajib diisi.' };
  }

  const standardPrice = parseFloat(standardPriceStr);
  if (isNaN(standardPrice) || standardPrice < 0) {
    return { error: 'Harga standar tidak valid.' };
  }

  const [existing] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(
      and(eq(paymentItems.id, Number(itemId)), isNull(paymentItems.deletedAt))
    )
    .limit(1);

  if (!existing) {
    return { error: 'Item pembayaran tidak ditemukan.' };
  }

  // Check code uniqueness excluding self
  const [codeConflict] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(
      and(
        eq(paymentItems.code, code),
        isNull(paymentItems.deletedAt),
        ne(paymentItems.id, Number(itemId))
      )
    )
    .limit(1);

  if (codeConflict) {
    return { error: `Kode "${code}" sudah digunakan item lain.` };
  }

  const semesterId = semesterIdStr ? parseInt(semesterIdStr, 10) : null;

  await db
    .update(paymentItems)
    .set({
      code,
      name,
      description,
      standardPrice: String(standardPrice),
      type: type as 'recurring' | 'one_time' | 'variable',
      semesterId: semesterId && !isNaN(semesterId) ? semesterId : null,
      isActive,
    })
    .where(eq(paymentItems.id, Number(itemId)));

  revalidatePath('/admin/payment-items');
  return { success: true };
}

export async function deletePaymentItem(itemId: string) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(
      and(eq(paymentItems.id, Number(itemId)), isNull(paymentItems.deletedAt))
    )
    .limit(1);

  if (!existing) {
    return { error: 'Item pembayaran tidak ditemukan.' };
  }

  await db
    .update(paymentItems)
    .set({ deletedAt: new Date() })
    .where(eq(paymentItems.id, Number(itemId)));

  revalidatePath('/admin/payment-items');
  return { success: true };
}
