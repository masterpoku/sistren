"use server";

import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { systemConfigs } from "@/lib/db/schema";
import { isSystemConfigKey } from "@/lib/db/system-config-keys";
import {
  schoolSettingsSchema,
  systemConfigValueSchema,
} from "@/lib/validation/schemas/settings";

export async function getSchoolSettings() {
  await verifyRoleLevel(80);

  const rows = await db
    .select()
    .from(systemConfigs)
    .where(isNull(systemConfigs.deletedAt))
    .orderBy(systemConfigs.key);

  return rows;
}

export async function getSystemConfigs() {
  await verifyRoleLevel(100);

  const rows = await db
    .select()
    .from(systemConfigs)
    .where(isNull(systemConfigs.deletedAt))
    .orderBy(systemConfigs.key);

  return rows;
}

export async function updateSchoolSetting(key: string, value: string) {
  await verifyRoleLevel(100);

  if (!isSystemConfigKey(key)) {
    return { error: `Key konfigurasi tidak dikenal: ${key}` };
  }

  const parsed = systemConfigValueSchema.safeParse({ key, value });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  await db
    .insert(systemConfigs)
    .values({ key: parsed.data.key, value: parsed.data.value })
    .onDuplicateKeyUpdate({
      set: { value: parsed.data.value, updatedAt: new Date() },
    });

  revalidatePath("/settings/school");
  revalidatePath("/settings/system");
  return { success: true };
}

export async function batchUpdateSchoolSettings(
  data: Record<string, string>
): Promise<{ success: true; data: { updated: number } } | { error: string }> {
  await verifyRoleLevel(80);

  const unknownKeys = Object.keys(data).filter((k) => !isSystemConfigKey(k));
  if (unknownKeys.length > 0) {
    return {
      error: `Key konfigurasi tidak dikenal: ${unknownKeys.join(", ")}`,
    };
  }

  const parsed = schoolSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
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
  revalidatePath("/settings/system");
  return { success: true, data: { updated } };
}

export async function createSystemConfig(input: {
  key: string;
  value: string;
  description?: string;
}) {
  await verifyRoleLevel(100);

  const parsed = systemConfigValueSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  if (!isSystemConfigKey(parsed.data.key)) {
    return { error: `Key konfigurasi tidak dikenal: ${parsed.data.key}` };
  }

  try {
    await db.insert(systemConfigs).values({
      key: parsed.data.key,
      value: parsed.data.value,
      description: parsed.data.description ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan";
    if (message.includes("Duplicate")) {
      return { error: `Key '${parsed.data.key}' sudah ada` };
    }
    return { error: message };
  }

  revalidatePath("/settings/system");
  return { success: true };
}

export async function deleteSystemConfig(key: string) {
  await verifyRoleLevel(100);

  if (!isSystemConfigKey(key)) {
    return { error: `Key konfigurasi tidak dikenal: ${key}` };
  }

  await db
    .update(systemConfigs)
    .set({ deletedAt: new Date() })
    .where(eq(systemConfigs.key, key));

  revalidatePath("/settings/system");
  return { success: true };
}

// Re-export for consumers — but use server only allows async functions
// Consumers should import SYSTEM_CONFIG_KEYS directly from system-config-keys.
