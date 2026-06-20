import { z } from "zod";

export const uploadPaymentSlipSchema = z.object({
  paymentId: z.string().min(1, "ID pembayaran wajib diisi"),
});

export const rejectPaymentSlipSchema = z.object({
  slipId: z.string().min(1, "ID bukti bayar wajib diisi"),
  reason: z.string().min(1, "Alasan penolakan wajib diisi").max(500),
});
