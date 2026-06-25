import { z } from "zod";
import { SYSTEM_CONFIG_KEYS } from "@/lib/db/system-config-keys";

const numericString = (min: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/, "Harus berupa angka")
    .transform((v) => Number.parseInt(v, 10))
    .refine((n) => n >= min && n <= max, `Nilai harus ${min}-${max}`);

export const schoolInfoSchema = z.object({
  [SYSTEM_CONFIG_KEYS.SCHOOL_NAME]: z
    .string()
    .min(3, "Nama sekolah minimal 3 karakter")
    .max(255),
  [SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS]: z
    .string()
    .min(5, "Alamat terlalu pendek")
    .max(500),
  [SYSTEM_CONFIG_KEYS.HEADMASTER]: z
    .string()
    .min(2, "Nama kepala sekolah minimal 2 karakter")
    .max(255),
  [SYSTEM_CONFIG_KEYS.NPSN]: z
    .string()
    .regex(/^\d{8}$/, "NPSN harus 8 digit angka"),
  [SYSTEM_CONFIG_KEYS.NSS]: z
    .string()
    .regex(/^\d{12}$/, "NSS harus 12 digit angka")
    .optional()
    .nullable(),
});

export const academicConfigSchema = z.object({
  [SYSTEM_CONFIG_KEYS.ACADEMIC_YEAR]: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY"),
  [SYSTEM_CONFIG_KEYS.CURRENT_SEMESTER_ID]: numericString(
    1,
    Number.MAX_SAFE_INTEGER
  ),
});

export const paymentConfigSchema = z.object({
  [SYSTEM_CONFIG_KEYS.SPP_DEFAULT_AMOUNT]: numericString(0, 999_999_999),
  [SYSTEM_CONFIG_KEYS.SPP_DUE_DAY]: numericString(1, 31),
  [SYSTEM_CONFIG_KEYS.PAYMENT_GRACE_DAYS]: numericString(0, 365),
});

export const gradingConfigSchema = z.object({
  [SYSTEM_CONFIG_KEYS.MIN_SCORE]: numericString(0, 100),
  [SYSTEM_CONFIG_KEYS.MAX_SCORE]: numericString(0, 100),
  [SYSTEM_CONFIG_KEYS.PASSING_SCORE]: numericString(0, 100),
});

export const systemConfigValueSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(10_000),
  description: z.string().max(255).optional(),
});

/**
 * Backward-compatible alias — same keys as the old schoolSettingsSchema
 * but in snake_case form.
 */
export const schoolSettingsSchema = schoolInfoSchema;

export type SchoolSettingsInput = z.infer<typeof schoolInfoSchema>;
export type SystemConfigValueInput = z.infer<typeof systemConfigValueSchema>;
