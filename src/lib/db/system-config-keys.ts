/**
 * System key-value configuration keys.
 *
 * Convention: snake_case in DB. Group by domain.
 * Add new keys here, not as magic strings elsewhere.
 */

export const SYSTEM_CONFIG_KEYS = {
  // School identity (Phase 1)
  SCHOOL_NAME: "school_name",
  SCHOOL_ADDRESS: "school_address",
  HEADMASTER: "headmaster",
  NPSN: "npsn",
  NSS: "nss",

  // Academic calendar
  ACADEMIC_YEAR: "academic_year",
  CURRENT_SEMESTER_ID: "current_semester_id",

  // Payment config
  SPP_DEFAULT_AMOUNT: "spp_default_amount",
  SPP_DUE_DAY: "spp_due_day",
  PAYMENT_GRACE_DAYS: "payment_grace_days",

  // Grading thresholds
  MIN_SCORE: "min_score",
  MAX_SCORE: "max_score",
  PASSING_SCORE: "passing_score",
} as const;

export type SystemConfigKey =
  (typeof SYSTEM_CONFIG_KEYS)[keyof typeof SYSTEM_CONFIG_KEYS];

export const ALL_SYSTEM_CONFIG_KEYS: readonly SystemConfigKey[] =
  Object.values(SYSTEM_CONFIG_KEYS);

export const SYSTEM_CONFIG_DESCRIPTIONS: Record<SystemConfigKey, string> = {
  school_name: "Nama resmi sekolah",
  school_address: "Alamat lengkap sekolah",
  headmaster: "Nama kepala sekolah",
  npsn: "Nomor Pokok Sekolah Nasional (8 digit)",
  nss: "Nomor Statistik Sekolah (12 digit, opsional)",
  academic_year: "Tahun ajaran aktif, mis. 2025/2026",
  current_semester_id: "ID semester aktif (foreign reference)",
  spp_default_amount: "Nominal SPP default per bulan dalam rupiah",
  spp_due_day: "Tanggal jatuh tempo SPP setiap bulan (1-31)",
  payment_grace_days: "Toleransi keterlambatan pembayaran (hari)",
  min_score: "Nilai minimum yang dapat diinput (default 0)",
  max_score: "Nilai maksimum yang dapat diinput (default 100)",
  passing_score: "Nilai minimum kelulusan (default 75)",
};

export function isSystemConfigKey(value: string): value is SystemConfigKey {
  return (ALL_SYSTEM_CONFIG_KEYS as readonly string[]).includes(value);
}
