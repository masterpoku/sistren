"use server";

import { and, eq, isNull, like, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { paymentItems, semesters } from "@/lib/db/schema";
import {
  createPaymentItemSchema,
  updatePaymentItemSchema,
} from "@/lib/validation/schemas/paymentItems";

export async function getPaymentItems(opts?: {
  search?: string;
  type?: string;
  isActive?: boolean;
}) {
  await verifyRoleLevel(80);

  const conditions = [isNull(paymentItems.deletedAt)];

  if (opts?.type) {
    conditions.push(
      eq(paymentItems.type, opts.type as "recurring" | "one_time" | "variable")
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

export async function getActivePaymentItems() {
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
    .where(and(eq(paymentItems.isActive, true), isNull(paymentItems.deletedAt)))
    .orderBy(paymentItems.code);

  return rows;
}

export async function createPaymentItem(formData: FormData) {
  await verifyRoleLevel(80);

  const parsed = createPaymentItemSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: (formData.get("description") as string)?.trim() || null,
    standardPrice: formData.get("standardPrice"),
    type: formData.get("type") || "one_time",
    semesterId: formData.get("semesterId") || null,
    isActive: formData.get("isActive") !== "false",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { code, name, description, standardPrice, type, semesterId, isActive } =
    parsed.data;

  const [existing] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(and(eq(paymentItems.code, code), isNull(paymentItems.deletedAt)))
    .limit(1);

  if (existing) {
    return { error: `Kode item pembayaran "${code}" sudah ada.` };
  }

  await db.insert(paymentItems).values({
    code,
    name: name.trim(),
    description,
    standardPrice: String(standardPrice),
    type,
    semesterId: semesterId ?? null,
    isActive,
  });

  revalidatePath("/admin/payment-items");
  return { success: true };
}

export async function updatePaymentItem(itemId: string, formData: FormData) {
  await verifyRoleLevel(80);

  const parsed = updatePaymentItemSchema.safeParse({
    itemId,
    code: formData.get("code"),
    name: formData.get("name"),
    description: (formData.get("description") as string)?.trim() || null,
    standardPrice: formData.get("standardPrice"),
    type: formData.get("type") || "one_time",
    semesterId: formData.get("semesterId") || null,
    isActive: formData.get("isActive") !== "false",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { code, name, description, standardPrice, type, semesterId, isActive } =
    parsed.data;

  const [existing] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(
      and(eq(paymentItems.id, parsed.data.itemId), isNull(paymentItems.deletedAt))
    )
    .limit(1);

  if (!existing) {
    return { error: "Item pembayaran tidak ditemukan." };
  }

  const [codeConflict] = await db
    .select({ id: paymentItems.id })
    .from(paymentItems)
    .where(
      and(
        eq(paymentItems.code, code),
        isNull(paymentItems.deletedAt),
        ne(paymentItems.id, parsed.data.itemId)
      )
    )
    .limit(1);

  if (codeConflict) {
    return { error: `Kode "${code}" sudah digunakan item lain.` };
  }

  await db
    .update(paymentItems)
    .set({
      code,
      name: name.trim(),
      description,
      standardPrice: String(standardPrice),
      type,
      semesterId: semesterId ?? null,
      isActive,
    })
    .where(eq(paymentItems.id, parsed.data.itemId));

  revalidatePath("/admin/payment-items");
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
    return { error: "Item pembayaran tidak ditemukan." };
  }

  await db
    .update(paymentItems)
    .set({ deletedAt: new Date() })
    .where(eq(paymentItems.id, Number(itemId)));

  revalidatePath("/admin/payment-items");
  return { success: true };
}
