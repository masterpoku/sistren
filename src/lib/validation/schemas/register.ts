import { z } from "zod";

export const registerSchema = z
    .object({
        name: z.string().min(2, "Nama minimal 2 karakter").max(100),
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
        nisn: z.string().max(20).optional().or(z.literal("")),
        birthPlace: z.string().max(100).optional().or(z.literal("")),
        birthDate: z.string().optional().or(z.literal("")),
        gender: z.enum(["male", "female"]).optional().or(z.literal("")),
        religionId: z.string().optional().or(z.literal("")),
        address: z.string().max(500).optional().or(z.literal("")),
        fatherName: z.string().max(100).optional().or(z.literal("")),
        motherName: z.string().max(100).optional().or(z.literal("")),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password dan konfirmasi password tidak cocok",
        path: ["confirmPassword"],
    });
