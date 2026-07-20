import { eq, isNull } from "drizzle-orm";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  classes,
  majors,
  semesters,
} from "@/lib/db/schema";
import { GradeInputClient } from "@/features/academic/GradeInputClient";

async function getTeacherClasses(userId: string) {
  const ctx = await (
    await import("@/lib/auth/permissions")
  ).getAuthContext(userId);

  const allClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      majorName: majors.name,
    })
    .from(classes)
    .leftJoin(majors, eq(classes.majorId, majors.id))
    .where(isNull(classes.deletedAt))
    .orderBy(classes.code);

  if (ctx && ctx.roleLevel >= 100) return allClasses;

  return allClasses.filter((c) => c.id);
}

export default async function AcademicGradesPage() {
  const session = await verifySession();
  await verifyRoleLevel(60);

  const userClasses = await getTeacherClasses(session.userId);

  const semesterList = await db
    .select({ id: semesters.id, name: semesters.name, academicYear: semesters.academicYear })
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.id);

  const defaultClassId = userClasses[0]?.id;

  return (
    <GradeInputClient
      userClasses={userClasses}
      semesters={semesterList}
      defaultClassId={defaultClassId}
      userId={session.userId}
    />
  );
}
