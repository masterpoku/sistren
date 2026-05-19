'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getAnnouncements } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { announcements } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export async function fetchAnnouncements() {
  await verifyPermission('announcements.read')
  return await getAnnouncements()
}

export async function createAnnouncement(data: {
  title: string
  description?: string
  content: string
  category?: string
  priority?: 'normal' | 'important' | 'urgent'
  publishedAt?: string | null
}): Promise<{ success: true; id: number } | { success: false; error: string }> {
  await verifyPermission('announcements.create')

  const [result] = await db.insert(announcements).values({
    title: data.title,
    description: data.description || null,
    content: data.content,
    category: data.category || 'umum',
    priority: data.priority || 'normal',
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    authorId: null,
  })
  return { success: true, id: result.insertId }
}

export async function updateAnnouncement(id: number, data: {
  title?: string
  description?: string
  content?: string
  category?: string
  priority?: 'normal' | 'important' | 'urgent'
}): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('announcements.update')

  const updateFields: Record<string, unknown> = {}
  if (data.title !== undefined) updateFields.title = data.title
  if (data.description !== undefined) updateFields.description = data.description
  if (data.content !== undefined) updateFields.content = data.content
  if (data.category !== undefined) updateFields.category = data.category
  if (data.priority !== undefined) updateFields.priority = data.priority

  await db.update(announcements)
    .set(updateFields)
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))

  return { success: true }
}

export async function publishAnnouncement(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('announcements.publish')

  await db.update(announcements)
    .set({ publishedAt: new Date() })
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))

  return { success: true }
}

export async function unpublishAnnouncement(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('announcements.publish')

  await db.update(announcements)
    .set({ publishedAt: null })
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))

  return { success: true }
}

export async function deleteAnnouncement(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('announcements.delete')

  await db.update(announcements)
    .set({ deletedAt: new Date() })
    .where(and(eq(announcements.id, id), isNull(announcements.deletedAt)))

  return { success: true }
}