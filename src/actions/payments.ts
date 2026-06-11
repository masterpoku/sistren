"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { paymentMethods, payments, users } from "@/lib/db/schema";

const paymentMethodSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  accountNumber: z.string().max(50).optional().nullable(),
  accountName: z.string().max(255).optional().nullable(),
  provider: z.string().max(100).optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
});
const recordPaymentSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  paymentItemId: z.coerce.number().positive().optional().nullable(),
  description: z.string().min(1, "Deskripsi wajib diisi").max(500),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Harga tidak valid"),
  quantity: z.coerce.number().int().min(1).default(1),
});
const idSchema = z.coerce.number().positive();

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

  const parsed = paymentMethodSchema.safeParse({
    name: formData.get("name"),
    accountNumber: formData.get("accountNumber") || null,
    accountName: formData.get("accountName") || null,
    provider: formData.get("provider") || null,
    instructions: formData.get("instructions") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, accountNumber, accountName, provider, instructions } =
    parsed.data;

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

  const idParsed = idSchema.safeParse(methodId);
  if (!idParsed.success) {
    return { error: "ID metode tidak valid" };
  }

  const parsed = paymentMethodSchema.safeParse({
    name: formData.get("name"),
    accountNumber: formData.get("accountNumber") || null,
    accountName: formData.get("accountName") || null,
    provider: formData.get("provider") || null,
    instructions: formData.get("instructions") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, accountNumber, accountName, provider, instructions } =
    parsed.data;

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, idParsed.data),
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
    .where(eq(paymentMethods.id, idParsed.data));

  revalidatePath("/payments/methods");
  return { success: true };
}

export async function deletePaymentMethod(methodId: string) {
  await verifyRoleLevel(80);

  const idParsed = idSchema.safeParse(methodId);
  if (!idParsed.success) {
    return { error: "ID metode tidak valid" };
  }

  const [existing] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.id, idParsed.data),
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
    .where(eq(paymentMethods.id, idParsed.data));

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

  const parsed = recordPaymentSchema.safeParse({
    studentId: formData.get("studentId"),
    paymentItemId: formData.get("paymentItemId") || null,
    description: formData.get("description"),
    price: formData.get("price"),
    quantity: formData.get("quantity") || 1,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { studentId, paymentItemId, description, price, quantity } =
    parsed.data;

  const priceNum = parseFloat(price);
  const total = priceNum * quantity;
  const code = `SPP-${Date.now()}`;

  await db.insert(payments).values({
    studentId,
    code,
    paymentItemId: paymentItemId ?? null,
    description: description.trim(),
    price,
    quantity,
    total: total.toFixed(2),
    status: "pending",
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function confirmPayment(paymentId: string) {
  await verifyRoleLevel(80);

  const parsed = idSchema.safeParse(paymentId);
  if (!parsed.success) {
    return { error: "ID pembayaran tidak valid" };
  }

  const [existing] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.id, parsed.data), isNull(payments.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Pembayaran tidak ditemukan." };
  }

  await db
    .update(payments)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(payments.id, parsed.data));

  revalidatePath("/finance");
  return { success: true };
}

export async function cancelPayment(paymentId: string) {
  await verifyRoleLevel(80);

  const parsed = idSchema.safeParse(paymentId);
  if (!parsed.success) {
    return { error: "ID pembayaran tidak valid" };
  }

  const [existing] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.id, parsed.data), isNull(payments.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Pembayaran tidak ditemukan." };
  }

  await db
    .update(payments)
    .set({ status: "cancelled" })
    .where(eq(payments.id, parsed.data));

  revalidatePath("/finance");
  return { success: true };
}
