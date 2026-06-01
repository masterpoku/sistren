import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
});

export const updateClassSchema = z.object({
  classId: z.coerce.number().positive(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
});

export const createMajorSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional().nullable(),
});

export const updateMajorSchema = z.object({
  majorId: z.coerce.number().positive(),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional().nullable(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  credits: z.coerce.number().int().min(1).max(10),
  classLevel: z.coerce.number().int().min(10).max(13).optional(),
  majorId: z.coerce.number().positive().optional().nullable(),
});

export const updateSubjectSchema = z.object({
  subjectId: z.coerce.number().positive(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  credits: z.coerce.number().int().min(1).max(10),
  classLevel: z.coerce.number().int().min(10).max(13).optional(),
  majorId: z.coerce.number().positive().optional().nullable(),
});

export const createSemesterSchema = z.object({
  name: z.string().min(1).max(100),
  academicYear: z.string().min(1).max(20),
  isActive: z.boolean().default(false),
});

export const updateSemesterSchema = z.object({
  semesterId: z.coerce.number().positive(),
  name: z.string().min(1).max(100),
  academicYear: z.string().min(1).max(20),
  isActive: z.boolean(),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().uuid(),
  classId: z.coerce.number().positive(),
  subjectId: z.coerce.number().positive(),
  semesterId: z.coerce.number().positive(),
});

export const deleteTeacherAssignmentSchema = z.object({
  assignmentId: z.coerce.number().positive(),
});
