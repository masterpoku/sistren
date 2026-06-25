import { z } from "zod";

const bigintLike = z.coerce.number().int().positive();

export const transferStudentSchema = z.object({
  studentId: z.string().min(1),
  sourceSemesterId: bigintLike,
  targetClassId: bigintLike,
});

export const bulkTransferStudentsSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1).max(100),
  sourceSemesterId: bigintLike,
  targetClassId: bigintLike,
});

export const promoteClassSchema = z.object({
  sourceClassId: bigintLike,
  sourceSemesterId: bigintLike,
  targetSemesterId: bigintLike,
  targetClassId: bigintLike,
});

export const graduateStudentSchema = z.object({
  studentId: z.string().min(1),
  semesterId: bigintLike,
});

export type TransferStudentInput = z.infer<typeof transferStudentSchema>;
export type BulkTransferStudentsInput = z.infer<
  typeof bulkTransferStudentsSchema
>;
export type PromoteClassInput = z.infer<typeof promoteClassSchema>;
export type GraduateStudentInput = z.infer<typeof graduateStudentSchema>;
