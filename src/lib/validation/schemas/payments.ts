import { z } from 'zod';

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1).max(255),
  accountNumber: z.string().max(50).optional().nullable(),
  accountName: z.string().max(255).optional().nullable(),
  provider: z.string().max(100).optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
});

export const updatePaymentMethodSchema = z.object({
  methodId: z.coerce.number().positive(),
  name: z.string().min(1).max(255),
  accountNumber: z.string().max(50).optional().nullable(),
  accountName: z.string().max(255).optional().nullable(),
  provider: z.string().max(100).optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
});

export const deletePaymentMethodSchema = z.object({
  methodId: z.coerce.number().positive(),
});

export const recordPaymentSchema = z.object({
  studentId: z.string().uuid(),
  paymentItemId: z.coerce.number().positive().optional().nullable(),
  description: z.string().min(1).max(500),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Harga harus format desimal'),
  quantity: z.coerce.number().int().min(1).default(1),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.coerce.number().positive(),
});

export const cancelPaymentSchema = z.object({
  paymentId: z.coerce.number().positive(),
});
