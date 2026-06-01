import { z } from 'zod';

export const schoolSettingsSchema = z.object({
  schoolName: z.string().min(3, 'Nama sekolah minimal 3 karakter').max(255),
  schoolAddress: z.string().min(5, 'Alamat terlalu pendek').max(500),
  headmaster: z.string().min(2, 'Nama kepala sekolah minimal 2 karakter').max(255),
  npsn: z.string().regex(/^\d{8}$/, 'NPSN harus 8 digit angka'),
  nss: z
    .string()
    .regex(/^\d{12}$/, 'NSS harus 12 digit angka')
    .optional()
    .nullable(),
});

export type SchoolSettingsInput = z.infer<typeof schoolSettingsSchema>;