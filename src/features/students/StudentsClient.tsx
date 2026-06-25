"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

type Student = {
  id: string;
  name: string;
  email: string;
  nisn: string | null;
};

export const columns: ColumnDef<Student>[] = [
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
    cell: ({ row }) => row.getValue("nisn") ?? "-",
  },
  {
    id: "actions",
    header: "Dokumen",
    cell: ({ row }) => (
      <Link href={`/students/${row.original.id}/documents`}>
        <Button size="sm" variant="outline">
          Dokumen
        </Button>
      </Link>
    ),
  },
];

interface StudentsClientProps {
  data: Student[];
}

export function StudentsClient({ data }: StudentsClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
        <p className="text-muted-foreground">Daftar siswa ter-register.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Cari nama siswa..."
        exportFilename="siswa"
      />
    </div>
  );
}
