"use client";

import { useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { createEnrollment } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/ui/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BulkEnrollmentForm } from "@/features/enrollments/BulkEnrollmentForm";
import { StatusChangeForm } from "@/features/enrollments/StatusChangeForm";

type Enrollment = {
  id: number;
  studentName: string;
  studentEmail: string;
  className: string;
  semesterName: string;
  academicYear: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  graduated: "bg-blue-100 text-blue-800",
  dropped: "bg-red-100 text-red-800",
};

export const columns: ColumnDef<Enrollment>[] = [
  {
    accessorKey: "studentName",
    header: "Siswa",
  },
  {
    accessorKey: "studentEmail",
    header: "Email",
  },
  {
    accessorKey: "className",
    header: "Kelas",
  },
  {
    accessorKey: "semesterName",
    header: "Semester",
    cell: ({ row }) =>
      `${row.original.semesterName} (${row.original.academicYear})`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
      return (
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.status === "active" ? (
          <StatusChangeForm enrollmentId={row.original.id} />
        ) : (
          <span className="text-xs text-muted-foreground">
            Tidak dapat diubah
          </span>
        )}
        <ActionCell
          onDelete={async () => {
            const { deleteEnrollment } = await import("@/actions/enrollments");
            await deleteEnrollment(String(row.original.id));
          }}
        />
      </div>
    ),
  },
];

interface EnrollmentsClientProps {
  enrollmentList: Enrollment[];
  studentList: { id: string; name: string }[];
  semesterList: { id: number; name: string; academicYear: string }[];
  classList: { id: number; name: string }[];
}

export function EnrollmentsClient({
  enrollmentList,
  studentList,
  semesterList,
  classList,
}: EnrollmentsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreateEnrollment(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createEnrollment(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <PageShell
      title="Pendaftaran"
      description="Kelola pendaftaran siswa ke kelas per semester."
    >
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Bulk Enrollment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkEnrollmentForm
            classList={classList}
            semesterList={semesterList}
          />
        </CardContent>
      </Card>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={handleCreateEnrollment}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select name="studentId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {studentList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select name="semesterId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select name="classId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isPending}>
                Daftarkan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Enrollment List */}
      <DataTable
        columns={columns}
        data={enrollmentList}
        searchKey="studentName"
        searchPlaceholder="Cari siswa..."
        exportFilename="pendaftaran"
        emptyMessage="Belum ada pendaftaran."
      />
    </PageShell>
  );


}
