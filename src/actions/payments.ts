'use server'

import { db } from '@/lib/db'
import { paymentMethods } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { verifyRoleLevel } from '@/lib/auth/verify-session'

export async function getPaymentMethods() {
  await verifyRoleLevel(80)

  return db
    .select()
    .from(paymentMethods)
    .where(isNull(paymentMethods.deletedAt))
    .orderBy(paymentMethods.name)
}

export async function createPaymentMethod(formData: FormData) {
  await verifyRoleLevel(80)

  const name = formData.get('name') as string
  const accountNumber = formData.get('accountNumber') as string
  const accountName = formData.get('accountName') as string
  const provider = formData.get('provider') as string
  const instructions = formData.get('instructions') as string

  if (!name?.trim()) {
    return { error: 'Nama metode pembayaran wajib diisi.' }
  }

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.name, name.trim()), isNull(paymentMethods.deletedAt)))
    .limit(1)

  if (existing) {
    return { error: 'Nama metode sudah ada.' }
  }

  await db.insert(paymentMethods).values({
    name: name.trim(),
    accountNumber: accountNumber?.trim() || null,
    accountName: accountName?.trim() || null,
    provider: provider?.trim() || null,
    instructions: instructions?.trim() || null,
  })

  return { success: true }
}

export async function updatePaymentMethod(methodId: string, formData: FormData) {
  await verifyRoleLevel(80)

  const name = formData.get('name') as string
  const accountNumber = formData.get('accountNumber') as string
  const accountName = formData.get('accountName') as string
  const provider = formData.get('provider') as string
  const instructions = formData.get('instructions') as string

  if (!name?.trim()) {
    return { error: 'Nama metode pembayaran wajib diisi.' }
  }

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, Number(methodId)), isNull(paymentMethods.deletedAt)))
    .limit(1)

  if (!existing) {
    return { error: 'Metode pembayaran tidak ditemukan.' }
  }

  await db.update(paymentMethods)
    .set({
      name: name.trim(),
      accountNumber: accountNumber?.trim() || null,
      accountName: accountName?.trim() || null,
      provider: provider?.trim() || null,
      instructions: instructions?.trim() || null,
    })
    .where(eq(paymentMethods.id, Number(methodId)))

  return { success: true }
}

export async function deletePaymentMethod(methodId: string) {
  await verifyRoleLevel(80)

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, Number(methodId)), isNull(paymentMethods.deletedAt)))
    .limit(1)

  if (!existing) {
    return { error: 'Metode pembayaran tidak ditemukan.' }
  }

  await db.update(paymentMethods)
    .set({ deletedAt: new Date() })
    .where(eq(paymentMethods.id, Number(methodId)))

  return { success: true }
}