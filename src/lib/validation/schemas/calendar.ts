import { z } from "zod";

export const eventCategorySchema = z.enum([
    "academic",
    "holiday",
    "event",
    "meeting",
    "exam",
    "other",
]);

export const createEventSchema = z.object({
    title: z.string().min(1, "Judul wajib diisi").max(255),
    description: z.string().max(1000).optional().nullable(),
    startAt: z.string().min(1, "Tanggal mulai wajib diisi"),
    endAt: z.string().optional().nullable(),
    allDay: z.coerce.boolean(),
    category: eventCategorySchema.default("event"),
    isPublic: z.coerce.boolean(),
});

export const updateEventSchema = createEventSchema.extend({
    eventId: z.coerce.number().positive(),
});
