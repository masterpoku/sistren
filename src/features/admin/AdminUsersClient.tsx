"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable, formatDate } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { StaffAccountDialog } from "@/features/admin/StaffAccountDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

type User = {
  id: string;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  roleLevel: number | null;
  emailVerified: boolean | null;
  createdAt: Date | null;
};

interface AdminUsersClientProps {
  data: User[];
  roles: { id: number; name: string }[];
}

function UserActions({
  user,
  roles,
}: {
  user: User;
  roles: { id: number; name: string }[];
}) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteStaffAccount } = await import("@/actions/admin");
      return await deleteStaffAccount(user.id);
    },
    { successMessage: "Akun dihapus." }
  );

  if (user.roleName === "superadmin") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <StaffAccountDialog
        item={{
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId ?? 0,
        }}
        roles={roles}
        trigger={
          <Button type="button" variant="outline" size="sm">
            Edit
          </Button>
        }
      />
      <ActionCell onDelete={handleDelete} />
    </div>
  );
}

export function AdminUsersClient({ data, roles }: AdminUsersClientProps) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "roleName",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.getValue("roleName") ?? "unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("emailVerified") ? (
          <Badge variant="default" className="bg-green-500">
            Aktif
          </Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Dibuat",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => <UserActions user={row.original} roles={roles} />,
    },
  ];

  return (
    <PageShell
      title="Manajemen Pengguna"
      description="Kelola akun staff, role, dan approval."
      actions={
        <StaffAccountDialog
          roles={roles}
          trigger={<Button type="button">Tambah Akun</Button>}
        />
      }
    >
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Cari nama..."
        exportFilename="pengguna"
        emptyMessage="Belum ada pengguna."
      />
    </PageShell>
  );
}
