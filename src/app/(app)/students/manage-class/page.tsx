import { and, eq, isNull, notInArray, sql } from "drizzle-orm";
import { ManageClassesClient } from "@/features/students/ManageClassesClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { classes, enrollments, profiles, roles, users } from "@/lib/db/schema";

export default async function PromotePage() {
  await verifyRoleLevel(80);

  const [rows, unassignedCount] = await Promise.all([
    db
      .select({
        id: classes.id,
        name: classes.name,
        code: classes.code,
        studentCount: sql<number>`count(${enrollments.id})`,
      })
      .from(classes)
      .leftJoin(
        enrollments,
        and(
          eq(enrollments.classId, classes.id),
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt)
        )
      )
      .where(isNull(classes.deletedAt))
      .groupBy(classes.id, classes.name, classes.code)
      .orderBy(classes.name),
    countUnassigned(),
  ]);

  return <ManageClassesClient classes={rows} unassignedCount={unassignedCount} />;
}

async function countUnassigned() {
  const enrolled = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(and(eq(enrollments.status, "active"), isNull(enrollments.deletedAt)));

  const enrolledIds = enrolled.map((r) => r.studentId);

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(roles.level, 40),
        eq(profiles.verificationStatus, "verified"),
        isNull(profiles.deletedAt),
        isNull(users.deletedAt),
        enrolledIds.length > 0 ? notInArray(users.id, enrolledIds) : undefined
      )
    );

  return Number(result.count);
}
