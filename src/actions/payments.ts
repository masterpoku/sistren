"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { paymentMethods, paymentSlips, payments, users } from "@/lib/db/schema";
import { uploadPaymentSlipSchema } from "@/lib/validation/schemas/paymentSlips";
import {
  idSchema,
  paymentMethodSchema,
  recordPaymentSchema,
} from "@/lib/validation/schemas/payments";

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

// ─── Payment Slips ───────────────────────────────────────────────

const SLIP_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export async function getPaymentSlips(opts?: {
  studentId?: string;
  paymentId?: number;
  status?: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) return [];

  const conditions = [isNull(paymentSlips.deletedAt)];
  if (ctx.roleLevel < 80) {
    conditions.push(eq(paymentSlips.studentId, session.userId));
  }
  if (opts?.studentId) {
    conditions.push(eq(paymentSlips.studentId, opts.studentId));
  }
  if (opts?.paymentId) {
    conditions.push(eq(paymentSlips.paymentId, opts.paymentId));
  }
  if (opts?.status) {
    conditions.push(
      eq(
        paymentSlips.status,
        opts.status as "pending" | "approved" | "rejected"
      )
    );
  }

  return db
    .select({
      id: paymentSlips.id,
      paymentId: paymentSlips.paymentId,
      studentId: paymentSlips.studentId,
      slipFilename: paymentSlips.slipFilename,
      fileSize: paymentSlips.fileSize,
      mimeType: paymentSlips.mimeType,
      uploadedAt: paymentSlips.uploadedAt,
      status: paymentSlips.status,
      reviewedBy: paymentSlips.reviewedBy,
      reviewedAt: paymentSlips.reviewedAt,
      rejectionReason: paymentSlips.rejectionReason,
    })
    .from(paymentSlips)
    .where(and(...conditions))
    .orderBy(desc(paymentSlips.uploadedAt));
}

export async function getPaymentSlipForDownload(slipId: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) return { error: "Tidak terautentikasi." };

  const [slip] = await db
    .select()
    .from(paymentSlips)
    .where(and(eq(paymentSlips.id, slipId), isNull(paymentSlips.deletedAt)))
    .limit(1);

  if (!slip) return { error: "Bukti bayar tidak ditemukan." };
  if (ctx.roleLevel < 80 && slip.studentId !== session.userId) {
    return { error: "Anda tidak memiliki izin." };
  }

  const { decryptBlob } = await import("@/lib/crypto");
  let decrypted: Buffer;
  try {
    decrypted = decryptBlob(Buffer.from(slip.encryptedData, "base64"));
  } catch {
    return { error: "File korup atau tidak dapat dibaca." };
  }
  return {
    file: decrypted,
    fileName: slip.slipFilename,
    mimeType: slip.mimeType,
  };
}

export async function uploadPaymentSlip(formData: FormData) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 40) return { error: "Anda tidak memiliki izin." };

  const parsed = uploadPaymentSlipSchema.safeParse({
    paymentId: formData.get("paymentId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const paymentId = Number(parsed.data.paymentId);
  if (Number.isNaN(paymentId)) return { error: "ID pembayaran tidak valid." };

  const [payment] = await db
    .select({ id: payments.id, studentId: payments.studentId })
    .from(payments)
    .where(and(eq(payments.id, paymentId), isNull(payments.deletedAt)))
    .limit(1);

  if (!payment) return { error: "Pembayaran tidak ditemukan." };
  if (payment.studentId !== session.userId && ctx.roleLevel < 80) {
    return { error: "Pembayaran ini bukan milik Anda." };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { error: "File wajib diisi." };
  if (file.size > SLIP_MAX_SIZE) return { error: "Ukuran file maksimal 5MB." };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Tipe file harus JPG, PNG, GIF, WebP, atau PDF." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { error: "Gagal membaca file." };
  }

  const { encryptBlob } = await import("@/lib/crypto");
  let encrypted: Buffer;
  try {
    encrypted = encryptBlob(buffer);
  } catch {
    return { error: "Gagal mengenkripsi file." };
  }

  await db.insert(paymentSlips).values({
    paymentId,
    studentId: session.userId,
    encryptedData: encrypted.toString("base64"),
    slipFilename: file.name,
    fileSize: file.size,
    mimeType: file.type,
    status: "pending",
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function approvePaymentSlip(slipId: string) {
  await verifyRoleLevel(80);
  const idParsed = idSchema.safeParse(slipId);
  if (!idParsed.success) return { error: "ID tidak valid." };
  const session = await verifySession();

  const [slip] = await db
    .select({ id: paymentSlips.id, paymentId: paymentSlips.paymentId })
    .from(paymentSlips)
    .where(
      and(
        eq(paymentSlips.id, idParsed.data),
        eq(paymentSlips.status, "pending"),
        isNull(paymentSlips.deletedAt)
      )
    )
    .limit(1);

  if (!slip)
    return { error: "Bukti bayar tidak ditemukan atau sudah diproses." };

  await db.transaction(async (tx) => {
    await tx
      .update(paymentSlips)
      .set({
        status: "approved",
        reviewedBy: session.userId,
        reviewedAt: new Date(),
      })
      .where(eq(paymentSlips.id, idParsed.data));
    await tx
      .update(payments)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(payments.id, slip.paymentId));
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function rejectPaymentSlip(slipId: string, reason: string) {
  await verifyRoleLevel(80);
  const idParsed = idSchema.safeParse(slipId);
  if (!idParsed.success) return { error: "ID tidak valid." };
  if (!reason?.trim() || reason.trim().length > 500) {
    return { error: "Alasan penolakan wajib diisi (maks 500 karakter)." };
  }
  const session = await verifySession();

  const [slip] = await db
    .select({ id: paymentSlips.id })
    .from(paymentSlips)
    .where(
      and(
        eq(paymentSlips.id, idParsed.data),
        eq(paymentSlips.status, "pending"),
        isNull(paymentSlips.deletedAt)
      )
    )
    .limit(1);

  if (!slip)
    return { error: "Bukti bayar tidak ditemukan atau sudah diproses." };

  await db
    .update(paymentSlips)
    .set({
      status: "rejected",
      reviewedBy: session.userId,
      reviewedAt: new Date(),
      rejectionReason: reason.trim(),
    })
    .where(eq(paymentSlips.id, idParsed.data));

  revalidatePath("/finance");
  return { success: true };
}
