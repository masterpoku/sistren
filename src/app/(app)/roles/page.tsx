import { RolesClient } from "@/features/roles/RolesClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function RolesPage() {
  await verifyRoleLevel(80);
  return <RolesClient />;
}
