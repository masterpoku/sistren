import { AttendanceClient } from "@/features/attendance/AttendanceClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function AttendancePage() {
  await verifyRoleLevel(60);
  return <AttendanceClient />;
}
