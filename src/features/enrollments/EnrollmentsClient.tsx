"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { BulkEnrollmentForm } from "@/features/enrollments/BulkEnrollmentForm";
import { EnrollmentDialog } from "@/features/enrollments/EnrollmentDialog";
import { StatusChangeForm } from "@/features/enrollments/StatusChangeForm";

type Enrollment = {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  classId: number;
  className: string;
  semesterId: number;
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

function EnrollmentsActions({
  enrollment,
  studentList,
  semesterList,
  classList,
}: {
  enrollment: Enrollment;
  studentList: { id: string; name: string }[];
  semesterList: { id: number; name: string; academicYear: string }[];
  classList: { id: number; name: string }[];
}) {
  const { toast } = useToast();

  async function handleDelete() {
    const { deleteEnrollment } = await import("@/actions/enrollments");
    const result = await deleteEnrollment(String(enrollment.id));
    if (result && "error" in result && result.error) {
      toast({ variant: "destructive", description: result.error });
      return;
    }
    toast({ description: "Pendaftaran dihapus." });
  }

  return (
    <div className="flex items-center gap-2">
      {enrollment.status === "active" ? (
        <>
          <StatusChangeForm enrollmentId={enrollment.id} />
          <EnrollmentDialog
            students={studentList}
            semesters={semesterList}
            classes={classList}
            item={{
              id: enrollment.id,
              studentId: enrollment.studentId,
              semesterId: enrollment.semesterId,
              classId: enrollment.classId,
            }}
            trigger={
              <Button type="button" variant="outline" size="sm">
                Edit
              </Button>
            }
          />
        </>
      ) : (
        <span className="text-xs text-muted-foreground">
          Tidak dapat diubah
        </span>
      )}
      <ActionCell onDelete={handleDelete} />
    </div>
  );
}

export function EnrollmentsClient({
  enrollmentList,
  studentList,
  semesterList,
  classList,
}: {
  enrollmentList: Enrollment[];
  studentList: { id: string; name: string }[];
  semesterList: { id: number; name: string; academicYear: string }[];
  classList: { id: number; name: string }[];
}) {
  const columns: ColumnDef<Enrollment>[] = [
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
        <EnrollmentsActions
          enrollment={row.original}
          studentList={studentList}
          semesterList={semesterList}
          classList={classList}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Pendaftaran"
      description="Kelola pendaftaran siswa ke kelas per semester."
      actions={
        <EnrollmentDialog
          students={studentList}
          semesters={semesterList}
          classes={classList}
          trigger={<Button type="button">Tambah Pendaftaran</Button>}
        />
      }
    >
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
