"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { assignTeacher } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Assignment = {
  id: number;
  teacherName: string;
  className: string;
  subjectName: string;
  semesterName: string;
  academicYear: string;
};

type Teacher = { id: string; name: string };
type Class = { id: number; name: string };
type Subject = { id: number; name: string };
type Semester = { id: number; name: string; academicYear: string };

export const columns: ColumnDef<Assignment>[] = [
  {
    accessorKey: "teacherName",
    header: "Guru",
  },
  {
    accessorKey: "className",
    header: "Kelas",
  },
  {
    accessorKey: "subjectName",
    header: "Mapel",
  },
  {
    accessorKey: "semesterName",
    header: "Semester",
    cell: ({ row }) =>
      `${row.original.semesterName} (${row.original.academicYear})`,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <ActionCell
        onDelete={async () => {
          const { removeAssignment } = await import("@/actions/academic");
          await removeAssignment(String(row.original.id));
        }}
      />
    ),
  },
];

interface AssignmentsClientProps {
  assignments: Assignment[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  semesters: Semester[];
}

export function AssignmentsClient({
  assignments,
  teachers,
  classes,
  subjects,
  semesters,
}: AssignmentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAssign(formData: FormData) {
    startTransition(async () => {
      const result = await assignTeacher(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tugas Guru</h1>
          <p className="text-muted-foreground">
            Tugaskan guru ke kelas dan mata pelajaran per semester.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Tugas Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={handleAssign}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="teacherId">Guru</Label>
              <Select name="teacherId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classId">Kelas</Label>
              <Select name="classId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectId">Mapel</Label>
              <Select name="subjectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mapel" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semesterId">Semester</Label>
              <Select name="semesterId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={assignments}
        searchKey="teacherName"
        searchPlaceholder="Cari guru..."
        exportFilename="tugas-guru"
        emptyMessage="Belum ada tugas."
      />
    </div>
  );
}
