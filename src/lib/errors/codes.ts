/**
 * Error codes for machine-readable action results.
 * Use these codes for programmatic error handling on the client.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "ALREADY_EXISTS"
  | "INVALID_STATE"
  | "DB_ERROR"
  | "UNKNOWN";

export const ErrorMessages: Record<ErrorCode, string> = {
  UNAUTHORIZED: "Anda belum login. Silakan login terlebih dahulu.",
  FORBIDDEN: "Anda tidak memiliki izin untuk mengakses resource ini.",
  NOT_FOUND: "Resource tidak ditemukan.",
  VALIDATION_ERROR: "Data yang diberikan tidak valid.",
  CONFLICT: "Terjadi konflik data. Silakan refresh dan coba lagi.",
  ALREADY_EXISTS: "Data sudah ada.",
  INVALID_STATE: "Status tidak valid untuk operasi ini.",
  DB_ERROR: "Terjadi kesalahan database. Silakan coba lagi.",
  UNKNOWN: "Terjadi kesalahan yang tidak diketahui.",
};
