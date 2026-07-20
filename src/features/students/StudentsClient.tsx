"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { GraduateAction } from "./GraduateAction";

type Student = {
  id: string;
  name: string;
  email: string;
  nisn: string | null;
  roleName: string;
  enrollmentId: number | null;
  semesterId: number | null;
  enrollmentStatus: string | null;
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
    accessorKey: "roleName",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("roleName") as string;
      return (
        <Badge variant={role === "alumni" ? "secondary" : "default"}>
          {role}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const s = row.original;
      const isAlumni = s.roleName === "alumni";
      return (
        <div className="flex gap-2">
          <Link href={`/students/${s.id}/documents`}>
            <Button size="sm" variant="outline">
              Dokumen
            </Button>
          </Link>
          {!isAlumni && s.semesterId ? (
            <GraduateAction
              studentId={s.id}
              semesterId={s.semesterId}
              studentName={s.name}
            />
          ) : null}
        </div>
      );
    },
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
