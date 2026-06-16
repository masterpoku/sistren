"use server";

import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { getOptionalSession, verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import {
  createEventSchema,
  updateEventSchema,
} from "@/lib/validation/schemas/calendar";

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean | null;
  category: string | null;
  isPublic: boolean | null;
}

export async function getEvents(opts?: {
  start?: Date;
  end?: Date;
  isPublicOnly?: boolean;
}): Promise<CalendarEvent[]> {
  const session = await getOptionalSession();
  const conditions = [isNull(calendarEvents.deletedAt)];

  if (opts?.start) {
    conditions.push(gte(calendarEvents.startAt, opts.start));
  }
  if (opts?.end) {
    conditions.push(lte(calendarEvents.startAt, opts.end));
  }

  if (opts?.isPublicOnly) {
    conditions.push(eq(calendarEvents.isPublic, true));
  } else if (session) {
    const ctx = await getAuthContext(session.userId);
    if (!ctx || ctx.roleLevel < 60) {
      conditions.push(eq(calendarEvents.isPublic, true));
    }
  }

  const rows = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startAt: calendarEvents.startAt,
      endAt: calendarEvents.endAt,
      allDay: calendarEvents.allDay,
      category: calendarEvents.category,
      isPublic: calendarEvents.isPublic,
    })
    .from(calendarEvents)
    .where(and(...conditions))
    .orderBy(calendarEvents.startAt);

  return rows;
}

export async function getPublicEvents(opts?: {
  start?: Date;
  end?: Date;
}): Promise<
  Pick<
    CalendarEvent,
    "id" | "title" | "startAt" | "endAt" | "category" | "allDay"
  >[]
> {
  const conditions = [
    isNull(calendarEvents.deletedAt),
    eq(calendarEvents.isPublic, true),
  ];

  if (opts?.start) {
    conditions.push(gte(calendarEvents.startAt, opts.start));
  }
  if (opts?.end) {
    conditions.push(lte(calendarEvents.startAt, opts.end));
  }

  const rows = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      startAt: calendarEvents.startAt,
      endAt: calendarEvents.endAt,
      allDay: calendarEvents.allDay,
      category: calendarEvents.category,
    })
    .from(calendarEvents)
    .where(and(...conditions))
    .orderBy(calendarEvents.startAt);

  return rows;
}

export async function createEvent(formData: FormData) {
  const userId = await verifyRoleLevel(80);

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") as string)?.trim() || null,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt") || null,
    allDay: formData.get("allDay") === "true",
    category: formData.get("category") || "event",
    isPublic: formData.get("isPublic") !== "false",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { title, description, startAt, endAt, allDay, category, isPublic } =
    parsed.data;

  const startAtDate = new Date(startAt);
  if (Number.isNaN(startAtDate.getTime())) {
    return { error: "Tanggal mulai tidak valid." };
  }

  const endAtDate = endAt ? new Date(endAt) : null;
  if (endAtDate && Number.isNaN(endAtDate.getTime())) {
    return { error: "Tanggal selesai tidak valid." };
  }

  await db.insert(calendarEvents).values({
    title: title.trim(),
    description,
    startAt: startAtDate,
    endAt: endAtDate,
    allDay,
    category,
    isPublic,
    createdById: userId,
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEvent(id: number, formData: FormData) {
  await verifyRoleLevel(80);

  const parsed = updateEventSchema.safeParse({
    eventId: id,
    title: formData.get("title"),
    description: (formData.get("description") as string)?.trim() || null,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt") || null,
    allDay: formData.get("allDay") === "true",
    category: formData.get("category") || "event",
    isPublic: formData.get("isPublic") !== "false",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { title, description, startAt, endAt, allDay, category, isPublic } =
    parsed.data;

  const startAtDate = new Date(startAt);
  if (Number.isNaN(startAtDate.getTime())) {
    return { error: "Tanggal mulai tidak valid." };
  }

  const endAtDate = endAt ? new Date(endAt) : null;
  if (endAtDate && Number.isNaN(endAtDate.getTime())) {
    return { error: "Tanggal selesai tidak valid." };
  }

  const [existing] = await db
    .select({ id: calendarEvents.id })
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, id), isNull(calendarEvents.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Acara tidak ditemukan." };
  }

  await db
    .update(calendarEvents)
    .set({
      title: title.trim(),
      description,
      startAt: startAtDate,
      endAt: endAtDate,
      allDay,
      category,
      isPublic,
    })
    .where(eq(calendarEvents.id, id));

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(id: number) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: calendarEvents.id })
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, id), isNull(calendarEvents.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Acara tidak ditemukan." };
  }

  await db
    .update(calendarEvents)
    .set({ deletedAt: new Date() })
    .where(eq(calendarEvents.id, id));

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}
