import { and, eq, isNull, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  classes,
  majors,
  profiles,
  semesters,
  subjects,
  teacherClassSubjects,
  users,
} from "@/lib/db/schema";
import { getStudentGrades } from "@/actions/grades";
import { getAuthContext } from "@/lib/auth/permissions";
import { StudentRaporClient } from "@/features/students/StudentRaporClient";

interface Props {
  params: Promise<{ classId: string; studentId: string }>;
  searchParams: Promise<{ semesterId?: string }>;
}

export default async function RaporPage({ params, searchParams }: Props) {
  const session = await verifySession();
  await verifyRoleLevel(60);

  const { classId, studentId } = await params;
  const { semesterId } = await searchParams;

  const [studentInfo] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.id, studentId), isNull(users.deletedAt)))
    .limit(1);

  if (!studentInfo) notFound();

  const [classInfo] = await db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      majorId: classes.majorId,
      majorName: majors.name,
      homeroomTeacherId: classes.homeroomTeacherId,
    })
    .from(classes)
    .leftJoin(majors, eq(classes.majorId, majors.id))
    .where(and(eq(classes.id, Number(classId)), isNull(classes.deletedAt)))
    .limit(1);

  if (!classInfo) notFound();

  const ctx = await getAuthContext(session.userId);
  const canEdit = (ctx && ctx.roleLevel >= 100) || classInfo.homeroomTeacherId === session.userId;

  const grades = await getStudentGrades(
    studentId,
    semesterId ? Number(semesterId) : undefined
  );

  const semesterList = await db
    .select({ id: semesters.id, name: semesters.name, academicYear: semesters.academicYear })
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.id);

  let subjectList = await db
    .selectDistinct({ id: subjects.id, name: subjects.name })
    .from(teacherClassSubjects)
    .innerJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
    .where(
      and(
        eq(teacherClassSubjects.classId, Number(classId)),
        semesterId
          ? eq(teacherClassSubjects.semesterId, Number(semesterId))
          : undefined,
        isNull(teacherClassSubjects.deletedAt),
        isNull(subjects.deletedAt)
      )
    )
    .orderBy(subjects.name);

  // Fallback to subjects for this class+major if no assignments exist
  if (subjectList.length === 0) {
    subjectList = await db
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(
        and(
          eq(subjects.classId, Number(classId)),
          classInfo.majorId
            ? or(eq(subjects.majorId, classInfo.majorId), isNull(subjects.majorId))
            : isNull(subjects.majorId),
          isNull(subjects.deletedAt)
        )
      )
      .orderBy(subjects.name);
  }

  return (
    <StudentRaporClient
      studentInfo={studentInfo}
      classInfo={classInfo}
      grades={grades}
      semesters={semesterList}
      currentSemesterId={semesterId ?? ""}
      canEdit={canEdit}
      subjectList={subjectList}
    />
  );
}
