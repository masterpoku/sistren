import { desc, eq, inArray, isNull } from "drizzle-orm";
import { PageShell } from "@/components/ui/page-shell";
import { AdminUsersClient } from "@/features/admin/AdminUsersClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

async function getUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      roleLevel: roles.level,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt));
}

async function getStaffRoles() {
  return db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(inArray(roles.level, [60, 80]));
}

export default async function AdminUsersPage() {
  await verifyRoleLevel(80);
  const [userList, roleList] = await Promise.all([getUsers(), getStaffRoles()]);
  return (
    <PageShell
      title="Manajemen Pengguna"
      description="Kelola akun staff, role, dan approval."
    >
      <AdminUsersClient data={userList} roles={roleList} />
    </PageShell>
  );
}
