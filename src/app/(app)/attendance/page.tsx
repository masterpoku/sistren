import { redirect } from "next/navigation";
import { getClasses } from "@/actions/academic";
import { getStudentSubjects } from "@/actions/attendance";
import { AttendanceClient } from "@/features/attendance/AttendanceClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

export default async function AttendancePage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    redirect("/login");
  }

  const classList = ctx.roleLevel >= 60 ? await getClasses() : [];

  let subjects: { id: number; name: string; code: string | null }[] = [];
  if (ctx.roleLevel < 60) {
    subjects = await getStudentSubjects(session.userId);
  }

  return (
    <AttendanceClient
      roleLevel={ctx.roleLevel}
      classes={classList}
      studentSubjects={subjects}
      studentId={ctx.roleLevel < 60 ? session.userId : undefined}
    />
  );
}
