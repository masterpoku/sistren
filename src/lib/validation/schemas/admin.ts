import { z } from "zod";

export const createStaffAccountSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    roleId: z.coerce.number().positive("Role wajib dipilih"),
});

export const updateStaffAccountSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().email("Email tidak valid"),
    roleId: z.coerce.number().positive("Role wajib dipilih"),
});
