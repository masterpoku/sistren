import { z } from "zod";

export const rppStatusSchema = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
  "archived",
]);

export const rppFileTypeSchema = z.enum([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export const createRppDraftSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  description: z.string().max(2000).optional(),
  classId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  fileName: z.string().min(1).max(255),
  fileType: rppFileTypeSchema,
  fileSize: z.coerce
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024),
  encryptedData: z.string().min(1).max(100_000_000),
});

export const submitRppSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const reviewRppSchema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().max(2000).optional(),
});

export const archiveRppSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type RppStatus = z.infer<typeof rppStatusSchema>;
export type RppFileType = z.infer<typeof rppFileTypeSchema>;
export type CreateRppDraftInput = z.infer<typeof createRppDraftSchema>;
export type SubmitRppInput = z.infer<typeof submitRppSchema>;
export type ReviewRppInput = z.infer<typeof reviewRppSchema>;
export type ArchiveRppInput = z.infer<typeof archiveRppSchema>;
