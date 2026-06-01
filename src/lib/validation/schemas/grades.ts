import { z } from 'zod';

export const gradeTypeSchema = z.enum([
  'knowledge',
  'skill',
  'attitude',
  'extracurricular',
]);

export const upsertGradeSchema = z.object({
  enrollmentId: z.coerce.number().positive(),
  subjectId: z.coerce.number().positive(),
  type: gradeTypeSchema,
  score: z.string().optional(),
  grade: z.string().max(2).optional(),
  predicate: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  dailyTest1: z.string().optional(),
  dailyTest2: z.string().optional(),
  dailyTest3: z.string().optional(),
  dailyTest4: z.string().optional(),
  midterm: z.string().optional(),
  finalExam: z.string().optional(),
  practical: z.string().optional(),
  project: z.string().optional(),
  portfolio: z.string().optional(),
});

export const bulkGradesSchema = z.object({
  rows: z.string().transform((val) => {
    const parsed = JSON.parse(val);
    if (!Array.isArray(parsed)) throw new Error('Rows must be an array');
    return parsed;
  }),
});

export const deleteGradeSchema = z.object({
  gradeId: z.coerce.number().positive(),
});
