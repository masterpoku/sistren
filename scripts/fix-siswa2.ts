import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, profiles, users } from "@/lib/db/schema";

const email = "siswa2@sister.com";

const [u] = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

if (u) {
  await db.delete(accounts).where(eq(accounts.userId, u.id));
  await db.delete(profiles).where(eq(profiles.userId, u.id));
  await db.delete(users).where(eq(users.id, u.id));
  console.log("Deleted incomplete siswa2");
} else {
  console.log("Not found");
}
