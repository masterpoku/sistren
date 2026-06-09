"use server";

import { isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { systemConfigs } from "@/lib/db/schema";
import { schoolSettingsSchema } from "@/lib/validation/schemas/settings";

export async function getSchoolSettings() {
  await verifyRoleLevel(80);

  const rows = await db
    .select()
    .from(systemConfigs)
    .where(isNull(systemConfigs.deletedAt))
    .orderBy(systemConfigs.key);

  return rows;
}

export async function updateSchoolSetting(key: string, value: string) {
  await verifyRoleLevel(80);

  await db
    .insert(systemConfigs)
    .values({ key, value })
    .onDuplicateKeyUpdate({
      set: { value, updatedAt: new Date() },
    });

  revalidatePath("/settings/school");
  return { success: true };
}

export async function batchUpdateSchoolSettings(
  data: Record<string, string>
): Promise<{ success: true; data: { updated: number } } | { error: string }> {
  await verifyRoleLevel(80);

  const parsed = schoolSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const entries = Object.entries(parsed.data);
  if (entries.length === 0) {
    return { error: "Tidak ada data untuk disimpan." };
  }

  let updated = 0;

  await db.transaction(async (tx) => {
    for (const [key, value] of entries) {
      await tx
        .insert(systemConfigs)
        .values({ key, value })
        .onDuplicateKeyUpdate({
          set: { value, updatedAt: new Date() },
        });
      updated++;
    }
  });

  revalidatePath("/settings/school");
  return { success: true, data: { updated } };
}
