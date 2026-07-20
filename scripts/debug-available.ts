import { and, eq, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { enrollments, profiles, roles, users } from "@/lib/db/schema";

async function main() {
  const totalSiswa = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(roles.level, 40), isNull(users.deletedAt)));
  console.log("total siswa level 40:", totalSiswa[0].count);

  const verified = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(roles.level, 40),
        eq(profiles.verificationStatus, "verified"),
        isNull(users.deletedAt),
        isNull(profiles.deletedAt)
      )
    );
  console.log("verified:", verified[0].count);

  const enrolled = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(and(eq(enrollments.status, "active"), isNull(enrollments.deletedAt)));
  console.log("enrolled count:", enrolled.length);

  const enrolledIds = enrolled.map((r) => r.studentId);

  const conditions = [
    eq(roles.level, 40),
    eq(profiles.verificationStatus, "verified"),
    isNull(profiles.deletedAt),
    isNull(users.deletedAt),
  ];

  if (enrolledIds.length > 0) {
    conditions.push(notInArray(users.id, enrolledIds));
  }

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(users.name);

  console.log("Available students:", result.length);
  result.slice(0, 5).forEach((s) =>
    console.log(`  - ${s.name} (${s.email}) nisn: ${s.nisn}`)
  );
}

main().catch(console.error);
