import { z } from "zod";

export const announcementSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi").max(255),
    content: z.string().min(1, "Konten wajib diisi"),
    description: z.string().max(500).optional().nullable(),
    category: z.string().max(50).optional().nullable(),
    priority: z.enum(["normal", "important", "urgent"]).default("normal"),
});
