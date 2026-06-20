import { getPermissions, getRolePermissions, getRoles } from "@/actions/permissions";
import { PageShell } from "@/components/ui/page-shell";
import { PermissionsClient } from "@/features/admin/PermissionsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function PermissionsPage() {
  await verifyRoleLevel(100);

  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);

  // Fetch assigned permissions for each role
  const rolePermissions: Record<number, number[]> = {};
  await Promise.all(
    roles.map(async (role) => {
      rolePermissions[role.id] = await getRolePermissions(role.id);
    })
  );

  return (
    <PageShell
      title="Izin & Peran"
      description="Kelola mapping izin (permission) ke setiap peran (role)."
    >
      <PermissionsClient
        roles={roles}
        permissions={permissions}
        rolePermissions={rolePermissions}
      />
    </PageShell>
  );
}
