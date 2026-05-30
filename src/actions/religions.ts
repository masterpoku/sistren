'use server';

import { db } from '@/lib/db';
import { religions } from '@/lib/db/schema';
import { isNull } from 'drizzle-orm';

export async function getReligions() {
  return db
    .select({ id: religions.id, name: religions.name })
    .from(religions)
    .where(isNull(religions.deletedAt))
    .orderBy(religions.name);
}
