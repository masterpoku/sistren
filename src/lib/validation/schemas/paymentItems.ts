import { z } from "zod";

export const paymentItemTypeSchema = z.enum([
    "recurring",
    "one_time",
    "variable",
]);

export const createPaymentItemSchema = z.object({
    code: z
        .string()
        .min(1, "Kode wajib diisi")
        .max(50)
        .transform((v) => v.trim().toUpperCase()),
    name: z.string().min(1, "Nama wajib diisi").max(255),
    description: z.string().max(1000).optional().nullable(),
    standardPrice: z.coerce.number().min(0, "Harga tidak valid"),
    type: paymentItemTypeSchema.default("one_time"),
    semesterId: z.coerce.number().positive().optional().nullable(),
    isActive: z.coerce.boolean(),
});

export const updatePaymentItemSchema = createPaymentItemSchema.extend({
    itemId: z.coerce.number().positive(),
});
