"use client";

import { PageShell } from "@/components/ui/page-shell";
import { AttendanceReportClient } from "@/features/attendance/AttendanceReportClient";
import { AttendanceStudentClient } from "@/features/attendance/AttendanceStudentClient";
import { AttendanceTeacherClient } from "@/features/attendance/AttendanceTeacherClient";

interface RosterItem {
  enrollmentId: number;
  studentId: string;
  studentName: string;
}

interface StudentItem {
  sessionDate: Date;
  status: string;
  notes: string | null;
}

interface AttendanceClientProps {
  roleLevel: number;
  classes: { id: number; name: string }[];
  roster: RosterItem[];
  studentItems: StudentItem[];
}

export function AttendanceClient({
  roleLevel,
  classes,
  roster,
  studentItems,
}: AttendanceClientProps) {
  const isStudent = roleLevel < 60;

  return (
    <PageShell
      title="Absensi"
      description={
        isStudent
          ? "Lihat catatan kehadiran Anda."
          : "Catat dan kelola absensi siswa."
      }
    >
      {isStudent ? (
        <AttendanceStudentClient items={studentItems} />
      ) : (
        <div className="space-y-6">
          <AttendanceTeacherClient classes={classes} initialRoster={roster} />
          {roleLevel >= 80 && <AttendanceReportClient classes={classes} />}
        </div>
      )}
    </PageShell>
  );
}
