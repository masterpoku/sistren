import { getClasses, getMajors } from "@/actions/academic";
import { UnassignedClient } from "@/features/students/UnassignedClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function UnassignedPage() {
  await verifyRoleLevel(80);

  const [classList, majorList] = await Promise.all([
    getClasses(),
    getMajors(),
  ]);

  return <UnassignedClient classes={classList} majors={majorList} />;
}
