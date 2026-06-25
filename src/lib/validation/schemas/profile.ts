import { z } from "zod";

export const updateProfileSchema = z.object({
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  fatherName: z.string().max(100).optional().or(z.literal("")),
  motherName: z.string().max(100).optional().or(z.literal("")),
});
