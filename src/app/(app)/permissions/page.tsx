import { redirect } from "next/navigation";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function PermissionsPage() {
  await verifyRoleLevel(100);
  redirect("/admin/users");
}
