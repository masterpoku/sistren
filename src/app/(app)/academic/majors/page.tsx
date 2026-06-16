import { getMajors } from "@/actions/academic";
import { MajorsClient } from "@/features/academic/majors/MajorsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function MajorsPage() {
  await verifyRoleLevel(60);
  const majorList = await getMajors();

  return <MajorsClient data={majorList} />;
}
