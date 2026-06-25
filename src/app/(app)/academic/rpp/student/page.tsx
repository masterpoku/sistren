import { getRppForCurrentStudent } from "@/actions/rpp";
import { RppStudentClient } from "@/features/rpp/RppStudentClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function RppStudentPage() {
  await verifyRoleLevel(40);
  const result = await getRppForCurrentStudent();
  const documents = !("error" in result) ? result.documents : [];

  return <RppStudentClient documents={documents} />;
}
