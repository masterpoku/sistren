import { getClasses, getMajors } from "@/actions/academic";
import { ClassesClient } from "@/features/academic/classes/ClassesClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function ClassesPage() {
  await verifyRoleLevel(60);
  const [classList, majorList] = await Promise.all([
    getClasses(),
    getMajors(),
  ]);

  return <ClassesClient classList={classList} majorList={majorList} />;
}
