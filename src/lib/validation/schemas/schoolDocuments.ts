import { z } from "zod";

export const schoolDocumentCategorySchema = z.enum([
  "kebijakan",
  "surat_edaran",
  "formulir",
  "laporan",
]);

export const uploadSchoolDocumentSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  description: z.string().max(2000).optional(),
  category: schoolDocumentCategorySchema.optional(),
  isPublic: z.coerce.boolean().default(false),
});

export type UploadSchoolDocumentInput = z.infer<
  typeof uploadSchoolDocumentSchema
>;
export type SchoolDocumentCategory = z.infer<
  typeof schoolDocumentCategorySchema
>;
