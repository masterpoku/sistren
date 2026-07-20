import { z } from "zod";

export const documentTypeSchema = z.enum([
  "ijasah",
  "skhun",
  "skl",
  "aktaKelahiran",
  "kk",
  "ktpAyah",
  "ktpIbu",
  "kip",
  "passFoto",
  "nisnDocument",
  "rapor",
]);

export const uploadDocumentSchema = z.object({
  studentId: z.string().min(1, "Student wajib diisi"),
  documentType: documentTypeSchema,
});
