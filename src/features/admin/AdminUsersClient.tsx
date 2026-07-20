"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, formatDate } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { StaffAccountDialog } from "@/features/admin/StaffAccountDialog";

type User = {
  id: string;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  roleLevel: number | null;
  emailVerified: boolean | null;
  createdAt: Date | null;
  enrollmentId: number | null;
  semesterId: number | null;
};

interface AdminUsersClientProps {
  data: User[];
  roles: { id: number; name: string }[];
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
