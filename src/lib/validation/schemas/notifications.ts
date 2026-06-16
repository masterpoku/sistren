import { z } from "zod";

export const notificationTypeSchema = z.enum([
    "announcement",
    "grade",
    "payment",
    "system",
]);

export const listNotificationsSchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const markReadSchema = z.object({
    notificationId: z.coerce.number().positive(),
});
