import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nisn: z.string().length(10, "NISN harus 10 digit"),
});

export const studentApprovalSchema = z.object({
  userId: z.string().uuid(),
});
