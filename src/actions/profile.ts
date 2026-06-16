"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { updateProfileSchema } from "@/lib/validation/schemas/profile";

export async function updateProfile(formData: FormData) {
  const session = await verifySession();

  const parsed = updateProfileSchema.safeParse({
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    fatherName: formData.get("fatherName") ?? "",
    motherName: formData.get("motherName") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { phone, address, fatherName, motherName } = parsed.data;

  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.userId, session.userId), isNull(profiles.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Profil tidak ditemukan." };
  }

  const updateValues: Record<string, string> = {};
  if (phone?.trim()) updateValues.phone = phone;
  if (address?.trim()) updateValues.address = address;
  if (fatherName?.trim()) updateValues.fatherName = fatherName;
  if (motherName?.trim()) updateValues.motherName = motherName;

  if (Object.keys(updateValues).length === 0) {
    return { error: "Tidak ada data yang diubah." };
  }

  await db
    .update(profiles)
    .set(updateValues)
    .where(eq(profiles.userId, session.userId));

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const session = await verifySession();
  const file = formData.get("avatar") as File | null;

  if (!file) {
    return { error: "File tidak boleh kosong." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Format harus JPEG, PNG, atau WebP." };
  }

  const maxBytes = 1 * 1024 * 1024; // 1MB
  if (file.size > maxBytes) {
    return { error: "Ukuran maksimal 1MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await db
    .update(users)
    .set({ image: dataUrl })
    .where(eq(users.id, session.userId));

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}
