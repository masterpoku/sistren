import { z } from "zod";

export const paymentMethodSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  accountNumber: z.string().max(50).optional().nullable(),
  accountName: z.string().max(255).optional().nullable(),
  provider: z.string().max(100).optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
});

export const recordPaymentSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  paymentItemId: z.coerce.number().positive().optional().nullable(),
  description: z.string().min(1, "Deskripsi wajib diisi").max(500),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Harga tidak valid"),
  quantity: z.coerce.number().int().min(1).default(1),
});

export const idSchema = z.coerce.number().positive();
