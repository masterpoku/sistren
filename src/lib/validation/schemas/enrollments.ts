import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid("ID siswa tidak valid"),
  semesterId: z.coerce.number().positive("Semester harus dipilih"),
  classId: z.coerce.number().positive("Kelas harus dipilih"),
});

export const bulkEnrollmentSchema = z.object({
  classId: z.coerce.number().positive("Kelas harus dipilih"),
  semesterId: z.coerce.number().positive("Semester harus dipilih"),
});

export const updateEnrollmentStatusSchema = z.object({
  enrollmentId: z.coerce.number().positive(),
  newStatus: z.enum(["active", "transferred", "dropped", "graduated"]),
});

export const deleteEnrollmentSchema = z.object({
  enrollmentId: z.coerce.number().positive(),
});
