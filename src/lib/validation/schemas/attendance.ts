import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "present",
  "sick",
  "permit",
  "absent",
  "late",
]);

export const markAttendanceSchema = z.object({
  classId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  sessionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  records: z
    .array(
      z.object({
        enrollmentId: z.coerce.number().int().positive(),
        status: attendanceStatusSchema,
        notes: z.string().max(500).optional(),
      })
    )
    .min(1)
    .max(100),
});

export const getAttendanceQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  studentId: z.string().min(1).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type GetAttendanceQueryInput = z.infer<typeof getAttendanceQuerySchema>;
