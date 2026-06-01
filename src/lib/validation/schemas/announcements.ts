import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.enum(['info', 'urgent', 'academic', 'event', 'admin']),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  published: z.coerce.boolean().default(false),
});

export const updateAnnouncementSchema = z.object({
  announcementId: z.coerce.number().positive(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.enum(['info', 'urgent', 'academic', 'event', 'admin']),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  published: z.coerce.boolean(),
});

export const deleteAnnouncementSchema = z.object({
  announcementId: z.coerce.number().positive(),
});

export const toggleAnnouncementSchema = z.object({
  announcementId: z.coerce.number().positive(),
  published: z.boolean(),
});

export const sendAnnouncementSchema = z.object({
  announcementId: z.coerce.number().positive(),
  roleFilter: z.enum(['all', 'student', 'teacher', 'admin']).default('all'),
});
