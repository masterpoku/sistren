import { getClasses, getSemesters } from "@/actions/academic";
import { getAvailableStudents, getEnrollments } from "@/actions/enrollments";
import { EnrollmentsClient } from "@/features/enrollments/EnrollmentsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function EnrollmentsPage() {
  await verifyRoleLevel(60);

  const [enrollmentList, studentList, semesterList, classList] =
    await Promise.all([
      getEnrollments(),
      getAvailableStudents(),
      getSemesters(),
      getClasses(),
    ]);

  return (
    <EnrollmentsClient
      enrollmentList={enrollmentList}
      studentList={studentList}
      semesterList={semesterList}
      classList={classList}
    />
  );
}
