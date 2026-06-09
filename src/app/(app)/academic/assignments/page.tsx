import {
  getAssignments,
  getClasses,
  getSemesters,
  getSubjects,
  getTeachers,
} from "@/actions/academic";
import { AssignmentsClient } from "@/features/academic/AssignmentsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function AssignmentsPage() {
  await verifyRoleLevel(60);
  const [assignmentList, teacherList, classList, subjectList, semesterList] =
    await Promise.all([
      getAssignments(),
      getTeachers(),
      getClasses(),
      getSubjects(),
      getSemesters(),
    ]);
  return (
    <AssignmentsClient
      assignments={assignmentList}
      teachers={teacherList}
      classes={classList}
      subjects={subjectList}
      semesters={semesterList}
    />
  );
}
