"use server";

import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { religions } from "@/lib/db/schema";

export async function getReligions() {
  return db
    .select({ id: religions.id, name: religions.name })
    .from(religions)
    .where(isNull(religions.deletedAt))
    .orderBy(religions.name);
}
