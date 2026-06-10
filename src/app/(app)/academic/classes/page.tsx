import { getClasses } from "@/actions/academic";
import { ClassesClient } from "@/features/academic/classes/ClassesClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function ClassesPage() {
  await verifyRoleLevel(60);
  const classList = await getClasses();

  return <ClassesClient classList={classList} />;
}
