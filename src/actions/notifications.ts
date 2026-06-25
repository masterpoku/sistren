"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export async function listNotifications(
  limit = 20
): Promise<{ items: NotificationItem[]; unread: number } | { error: string }> {
  const session = await verifySession();

  const rows = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      message: notifications.message,
      type: notifications.type,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.userId),
        isNull(notifications.deletedAt)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  const unread = rows.filter((r) => r.readAt === null).length;

  return { items: rows, unread };
}

export async function getUnreadCount(): Promise<number> {
  const session = await verifySession();

  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.userId),
        isNull(notifications.readAt),
        isNull(notifications.deletedAt)
      )
    );

  return rows.length;
}

export async function markRead(notificationId: number) {
  const session = await verifySession();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.userId)
      )
    );

  revalidatePath("/", "layout");
  return { success: true };
}

export async function markAllRead() {
  const session = await verifySession();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, session.userId),
        isNull(notifications.readAt)
      )
    );

  revalidatePath("/", "layout");
  return { success: true };
}
