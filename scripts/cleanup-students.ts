// Hapus siswa selain jangan@sister.com
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, profiles, roles, sessions, studentDocuments, users } from "@/lib/db/schema";

async function main() {
  const [siswaRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "siswa"))
    .limit(1);

  if (!siswaRole) {
    console.log("siswa role not found");
    return;
  }

  const toDelete = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(
      and(
        eq(users.roleId, siswaRole.id),
        isNull(users.deletedAt),
        ne(users.email, "jangan@sister.com")
      )
    );

  if (toDelete.length === 0) {
    console.log("No siswa to delete (excluding jangan@sister.com)");
    return;
  }

  console.log(`Deleting ${toDelete.length} siswa:`);
  for (const u of toDelete) {
    console.log(`  - ${u.email} (${u.id})`);
  }

  const ids = toDelete.map((u) => u.id);

  await db.delete(studentDocuments).where(inArray(studentDocuments.studentId, ids));
  await db.delete(profiles).where(inArray(profiles.userId, ids));
  await db.delete(sessions).where(inArray(sessions.userId, ids));
  await db.delete(accounts).where(inArray(accounts.userId, ids));
  await db.delete(users).where(inArray(users.id, ids));

  console.log("Done");
}

main().catch(console.error);
