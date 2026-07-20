import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { classes, enrollments, majors, semesters, users } from "@/lib/db/schema";
import { ClassStudentList } from "@/features/students/ClassStudentList";

interface Props {
  params: Promise<{ classId: string }>;
}

export default async function ClassDetailPage({ params }: Props) {
  await verifyRoleLevel(60);
  const { classId } = await params;

  const [classInfo] = await db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      majorName: majors.name,
      capacity: classes.capacity,
    })
    .from(classes)
    .leftJoin(majors, eq(classes.majorId, majors.id))
    .where(and(eq(classes.id, Number(classId)), isNull(classes.deletedAt)))
    .limit(1);

  if (!classInfo) notFound();

  const students = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: enrollments.studentId,
      studentName: users.name,
      studentEmail: users.email,
      semesterId: enrollments.semesterId,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(
      and(
        eq(enrollments.classId, Number(classId)),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .orderBy(users.name);

  const semesterList = await db
    .select({ id: semesters.id, name: semesters.name, academicYear: semesters.academicYear })
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.id);

  return (
    <ClassStudentList
      classInfo={classInfo}
      students={students}
      semesters={semesterList}
    />
  );
}
