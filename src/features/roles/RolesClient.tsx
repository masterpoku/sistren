"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

const ROLES = [
  { name: "Superadmin", level: 100, description: "Full system access" },
  { name: "Administrator", level: 80, description: "Admin staff (TU)" },
  { name: "Guru", level: 60, description: "Teacher" },
  { name: "Siswa", level: 40, description: "Student" },
  { name: "Alumni", level: 20, description: "Read-only graduate access" },
];

export const columns: ColumnDef<(typeof ROLES)[number]>[] = [
  {
    accessorKey: "name",
    header: "Nama Role",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("name")}
      </Badge>
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
  },
];

export function RolesClient() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
        <p className="text-muted-foreground">Daftar role dan level akses.</p>
      </div>

      <DataTable
        columns={columns}
        data={ROLES}
        searchKey="name"
        searchPlaceholder="Cari role..."
        exportFilename="roles"
      />
    </div>
  );
}
