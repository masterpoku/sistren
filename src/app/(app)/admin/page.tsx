import { redirect } from "next/navigation";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function AdminPage() {
  await verifyRoleLevel(80);
  redirect("/admin/users");
}
