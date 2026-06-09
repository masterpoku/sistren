import { redirect } from "next/navigation";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function UsersPage() {
  await verifyRoleLevel(80);
  redirect("/admin/users");
}
