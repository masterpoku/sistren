"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { paymentMethods, payments, users } from "@/lib/db/schema";

export async function getPaymentMethods() {
  await verifyRoleLevel(80);

  return db
    .select()
    .from(paymentMethods)
    .where(isNull(paymentMethods.deletedAt))
    .orderBy(paymentMethods.name);
}

export async function createPaymentMethod(formData: FormData) {
  await verifyRoleLevel(80);

  const name = formData.get("name") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountName = formData.get("accountName") as string;
  const provider = formData.get("provider") as string;
  const instructions = formData.get("instructions") as string;

  if (!name?.trim()) {
    return { error: "Nama metode pembayaran wajib diisi." };
  }

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.name, name.trim()),
        isNull(paymentMethods.deletedAt)
      )
    )
    .limit(1);

  if (existing) {
    return { error: "Nama metode sudah ada." };
  }

  await db.insert(paymentMethods).values({
    name: name.trim(),
    accountNumber: accountNumber?.trim() || null,
    accountName: accountName?.trim() || null,
    provider: provider?.trim() || null,
    instructions: instructions?.trim() || null,
  });

  revalidatePath("/payments/methods");
  return { success: true };
}

export async function updatePaymentMethod(
  methodId: string,
  formData: FormData
) {
  await verifyRoleLevel(80);

  const name = formData.get("name") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountName = formData.get("accountName") as string;
  const provider = formData.get("provider") as string;
  const instructions = formData.get("instructions") as string;

  if (!name?.trim()) {
    return { error: "Nama metode pembayaran wajib diisi." };
  }

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, Number(methodId)),
        isNull(paymentMethods.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Metode pembayaran tidak ditemukan." };
  }

  await db
    .update(paymentMethods)
    .set({
      name: name.trim(),
      accountNumber: accountNumber?.trim() || null,
      accountName: accountName?.trim() || null,
      provider: provider?.trim() || null,
      instructions: instructions?.trim() || null,
    })
    .where(eq(paymentMethods.id, Number(methodId)));

  revalidatePath("/payments/methods");
  return { success: true };
}

export async function deletePaymentMethod(methodId: string) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, Number(methodId)),
        isNull(paymentMethods.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Metode pembayaran tidak ditemukan." };
  }

  await db
    .update(paymentMethods)
    .set({ deletedAt: new Date() })
    .where(eq(paymentMethods.id, Number(methodId)));

  revalidatePath("/payments/methods");
  return { success: true };
}

// ─── Student Payment Records ────────────────────────────────────

export async function getPayments(opts?: {
  studentId?: string;
  status?: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) return [];

  const conditions = [isNull(payments.deletedAt)];

  // Siswa hanya bisa lihat own payments
  if (ctx.roleLevel < 60) {
    conditions.push(eq(payments.studentId, session.userId));
  } else if (opts?.studentId) {
    conditions.push(eq(payments.studentId, opts.studentId));
  }

  if (opts?.status) {
    conditions.push(
      eq(
        payments.status,
        opts.status as "draft" | "pending" | "paid" | "cancelled"
      )
    );
  }

  return db
    .select({
      id: payments.id,
      studentId: payments.studentId,
      studentName: users.name,
      code: payments.code,
      paymentItemId: payments.paymentItemId,
      description: payments.description,
      price: payments.price,
      quantity: payments.quantity,
      total: payments.total,
      status: payments.status,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .leftJoin(users, eq(payments.studentId, users.id))
    .where(and(...conditions))
    .orderBy(desc(payments.createdAt));
}

export async function recordPayment(formData: FormData) {
  await verifyRoleLevel(80);

  const studentId = formData.get("studentId") as string;
  const paymentItemIdStr = formData.get("paymentItemId") as string;
  const description = formData.get("description") as string;
  const priceStr = formData.get("price") as string;
  const quantityStr = formData.get("quantity") as string;

  if (!studentId || !description || !priceStr) {
    return { error: "Student, deskripsi, dan jumlah wajib diisi." };
  }

  // Optional catalog item — pre-fills description/standardPrice but never enforces
  const paymentItemId = paymentItemIdStr
    ? parseInt(paymentItemIdStr, 10)
    : null;

  const price = parseFloat(priceStr);
  const quantity = parseInt(quantityStr || "1", 10);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Harga tidak valid." };
  }

  const total = price * quantity;
  const code = `SPP-${Date.now()}`;

  await db.insert(payments).values({
    studentId,
    code,
    paymentItemId:
      paymentItemId && !Number.isNaN(paymentItemId) ? paymentItemId : null,
    description: description.trim(),
    price: String(price),
    quantity,
    total: String(total),
    status: "pending",
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function confirmPayment(paymentId: string) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.id, Number(paymentId)), isNull(payments.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Pembayaran tidak ditemukan." };
  }

  await db
    .update(payments)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(payments.id, Number(paymentId)));

  revalidatePath("/finance");
  return { success: true };
}

export async function cancelPayment(paymentId: string) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.id, Number(paymentId)), isNull(payments.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Pembayaran tidak ditemukan." };
  }

  await db
    .update(payments)
    .set({ status: "cancelled" })
    .where(eq(payments.id, Number(paymentId)));

  revalidatePath("/finance");
  return { success: true };
}
