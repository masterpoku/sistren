import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  code: z.string().min(1, "Kode wajib diisi").max(50),
});

export const updateClassSchema = classSchema.extend({
  classId: z.coerce.number().positive(),
});

export const majorSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  description: z.string().max(500).optional().nullable(),
});

export const updateMajorSchema = majorSchema.extend({
  majorId: z.coerce.number().positive(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  code: z.string().max(50).optional().nullable(),
  classId: z.coerce.number().positive("Kelas wajib dipilih"),
  majorId: z.coerce.number().positive().optional().nullable(),
  credits: z.coerce.number().int().min(0).max(20),
});

export const updateSubjectSchema = subjectSchema.extend({
  subjectId: z.coerce.number().positive(),
});

export const semesterSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  academicYear: z.string().min(1, "Tahun ajaran wajib diisi").max(20),
  isActive: z.coerce.boolean(),
});

export const updateSemesterSchema = semesterSchema.extend({
  semesterId: z.coerce.number().positive(),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().min(1, "Guru wajib dipilih"),
  classId: z.coerce.number().positive(),
  subjectId: z.coerce.number().positive(),
  semesterId: z.coerce.number().positive(),
});

export { idSchema } from "./payments";
