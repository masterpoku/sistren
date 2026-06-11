"use server";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { announcementRecipients, announcements, users } from "@/lib/db/schema";

const announcementSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  content: z.string().min(1, "Konten wajib diisi"),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  priority: z.enum(["normal", "important", "urgent"]).default("normal"),
});

export async function getAnnouncements(limit?: number) {
  const session = await verifySession();
  if (!session) return [];

  const ctx = await getAuthContext(session.userId);
  if (!ctx) return [];

  // All authenticated users can see announcements
  const result = db
    .select({
      id: announcements.id,
      title: announcements.title,
      description: announcements.description,
      content: announcements.content,
      category: announcements.category,
      priority: announcements.priority,
      publishedAt: announcements.publishedAt,
      authorName: users.name,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.authorId, users.id))
    .where(
      and(isNull(announcements.deletedAt), isNotNull(announcements.publishedAt))
    )
    .orderBy(desc(announcements.createdAt));

  if (limit) {
    return result.limit(limit);
  }
  return result;
}

export async function createAnnouncement(formData: FormData) {
  const session = await verifySession();
  if (!session) return { error: "Tidak ada sesi." };

  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    description: formData.get("description") || null,
    category: formData.get("category") || null,
    priority: formData.get("priority") || "normal",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { title, content, description, category, priority } = parsed.data;

  await db.insert(announcements).values({
    title: title.trim(),
    content: content.trim(),
    description: description?.trim() || null,
    category: category?.trim() || null,
    priority,
    authorId: session.userId,
    publishedAt: new Date(),
  });

  revalidatePath("/announcements");

  return { success: true };
}

export async function deleteAnnouncement(announcementId: string) {
  const session = await verifySession();
  if (!session) return { error: "Tidak ada sesi." };

  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [existing] = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(
      and(
        eq(announcements.id, Number(announcementId)),
        isNull(announcements.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pengumuman tidak ditemukan." };
  }

  await db
    .update(announcements)
    .set({ deletedAt: new Date() })
    .where(eq(announcements.id, Number(announcementId)));

  revalidatePath("/announcements");

  return { success: true };
}

export async function updateAnnouncement(
  announcementId: string,
  formData: FormData
) {
  const session = await verifySession();
  if (!session) return { error: "Tidak ada sesi." };

  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [existing] = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(
      and(
        eq(announcements.id, Number(announcementId)),
        isNull(announcements.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pengumuman tidak ditemukan." };
  }

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    description: formData.get("description") || null,
    category: formData.get("category") || null,
    priority: formData.get("priority") || "normal",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { title, content, description, category, priority } = parsed.data;

  await db
    .update(announcements)
    .set({
      title: title.trim(),
      content: content.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      priority,
    })
    .where(eq(announcements.id, Number(announcementId)));

  revalidatePath("/announcements");

  return { success: true };
}

export async function publishAnnouncement(announcementId: string) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(
      and(
        eq(announcements.id, Number(announcementId)),
        isNull(announcements.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pengumuman tidak ditemukan." };
  }

  await db
    .update(announcements)
    .set({ publishedAt: new Date() })
    .where(eq(announcements.id, Number(announcementId)));

  revalidatePath("/announcements");

  return { success: true };
}

export async function unpublishAnnouncement(announcementId: string) {
  await verifyRoleLevel(80);

  const [existing] = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(
      and(
        eq(announcements.id, Number(announcementId)),
        isNull(announcements.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pengumuman tidak ditemukan." };
  }

  await db
    .update(announcements)
    .set({ publishedAt: null })
    .where(eq(announcements.id, Number(announcementId)));

  revalidatePath("/announcements");

  return { success: true };
}

export async function getAllAnnouncementsAdmin() {
  await verifyRoleLevel(80);

  return db
    .select({
      id: announcements.id,
      title: announcements.title,
      description: announcements.description,
      content: announcements.content,
      category: announcements.category,
      priority: announcements.priority,
      publishedAt: announcements.publishedAt,
      authorName: users.name,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.authorId, users.id))
    .where(isNull(announcements.deletedAt))
    .orderBy(desc(announcements.createdAt));
}

export async function markAnnouncementAsRead(announcementId: string) {
  const session = await verifySession();

  await db
    .insert(announcementRecipients)
    .values({
      announcementId: Number(announcementId),
      userId: session.userId,
      isRead: true,
      readAt: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: { isRead: true, readAt: new Date() },
    });

  return { success: true };
}

export async function getReadReceipts(announcementId: string) {
  await verifyRoleLevel(80);

  const receipts = await db
    .select({
      userId: announcementRecipients.userId,
      userName: users.name,
      isRead: announcementRecipients.isRead,
      readAt: announcementRecipients.readAt,
    })
    .from(announcementRecipients)
    .leftJoin(users, eq(announcementRecipients.userId, users.id))
    .where(eq(announcementRecipients.announcementId, Number(announcementId)));

  return receipts;
}
