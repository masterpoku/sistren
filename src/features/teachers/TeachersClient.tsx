"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

type Teacher = {
  id: string;
  name: string;
  email: string;
  roleName: string | null;
};

export const columns: ColumnDef<Teacher>[] = [
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
        {row.getValue("roleName") ?? "guru"}
      </Badge>
    ),
  },
];

interface TeachersClientProps {
  data: Teacher[];
}

export function TeachersClient({ data }: TeachersClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Guru</h1>
        <p className="text-muted-foreground">Daftar guru ter-register.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Cari nama guru..."
        exportFilename="guru"
      />
    </div>
  );
}
