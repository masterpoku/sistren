"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { formatDate } from "@/components/ui/data-table";

type PendingStudent = {
  id: string;
  name: string;
  email: string;
  createdAt: Date | null;
  nisn: string | null;
};

export const columns: ColumnDef<PendingStudent>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "nisn",
    header: "NISN",
    cell: ({ row }) => row.getValue("nisn") || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Daftar",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <ActionCell
        onCustom={[
          {
            label: "Setujui",
            variant: "default",
            onClick: async () => {
              const { approveStudent } = await import("@/actions/admin");
              await approveStudent(row.original.id);
            },
          },
          {
            label: "Tolak",
            variant: "destructive",
            onClick: async () => {
              const { rejectStudent } = await import("@/actions/admin");
              await rejectStudent(row.original.id);
            },
          },
        ]}
      />
    ),
  },
];

interface ApprovalsClientProps {
  data: PendingStudent[];
}

export function ApprovalsClient({ data }: ApprovalsClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Persetujuan Pendaftaran
        </h1>
        <p className="text-muted-foreground">
          Lihat dan setujui siswa yang menunggu aktivasi akun.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Cari nama..."
        exportFilename="persetujuan"
        emptyMessage="Tidak ada siswa yang menunggu persetujuan."
      />
    </div>
  );
}
