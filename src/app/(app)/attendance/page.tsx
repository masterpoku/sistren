import { and, asc, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getClasses } from "@/actions/academic";
import { getStudentAttendance } from "@/actions/attendance";
import { AttendanceClient } from "@/features/attendance/AttendanceClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { enrollments, users } from "@/lib/db/schema";

export default async function AttendancePage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    redirect("/login");
  }

  const classList = ctx.roleLevel >= 60 ? await getClasses() : [];

  let roster: Array<{
    enrollmentId: number;
    studentId: string;
    studentName: string;
  }> = [];

  if (ctx.roleLevel >= 60) {
    const rows = await db
      .select({
        enrollmentId: enrollments.id,
        studentId: enrollments.studentId,
        studentName: users.name,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(
        and(eq(enrollments.status, "active"), isNull(enrollments.deletedAt))
      )
      .orderBy(asc(users.name));
    roster = rows;
  }

  let studentItems: Array<{
    sessionDate: Date;
    status: string;
    notes: string | null;
  }> = [];
  if (ctx.roleLevel < 60) {
    const start = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);
    const result = await getStudentAttendance({
      studentId: session.userId,
      startDate: start,
      endDate: end,
    });
    if ("items" in result && result.items) {
      studentItems = result.items;
    }
  }

  return (
    <AttendanceClient
      roleLevel={ctx.roleLevel}
      classes={classList}
      roster={roster}
      studentItems={studentItems}
    />
  );
}
