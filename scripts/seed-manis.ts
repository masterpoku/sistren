// Seed manis@sister.com — siswa yang belum upload dokumen
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, roles, users } from "@/lib/db/schema";

async function seed() {
  const email = "manis@sister.com";
  const password = "password123";
  const name = "Manis Manja";

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (existing) {
    console.log(`User ${email} already exists`);
    return;
  }

  const user = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  const userId = ("id" in user ? user.id : user.user.id) as string;
  console.log(`Created user: ${email} (id=${userId})`);

  const [siswaRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "siswa"))
    .limit(1);

  if (siswaRole) {
    await db.update(users).set({ roleId: siswaRole.id }).where(eq(users.id, userId));
    console.log(`Set roleId=${siswaRole.id} (siswa)`);
  }

  // Create profile with draft status (belum upload dokumen)
  await db.insert(profiles).values({
    userId,
    verificationStatus: "draft",
  });
  console.log("Created profile with status: draft");

  console.log("\nDone! Login with:");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

seed().catch(console.error);
