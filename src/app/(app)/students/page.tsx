import { and, eq, isNull, sql } from "drizzle-orm";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { classes, enrollments, majors } from "@/lib/db/schema";
import { RaporClassCards } from "@/features/students/RaporClassCards";

export default async function StudentsPage() {
  await verifyRoleLevel(60);

  const classList = await db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      majorName: majors.name,
      capacity: classes.capacity,
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
    .leftJoin(majors, eq(classes.majorId, majors.id))
    .where(isNull(classes.deletedAt))
    .groupBy(classes.id, classes.name, classes.code, majors.name, classes.capacity)
    .orderBy(classes.code);

  return <RaporClassCards classList={classList} />;
}
