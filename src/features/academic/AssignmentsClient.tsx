"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { AssignmentDialog } from "@/features/academic/AssignmentDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

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

interface AssignmentsClientProps {
  assignments: Assignment[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  semesters: Semester[];
}

function AssignmentActions({ id }: { id: number }) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const { removeAssignment } = await import("@/actions/academic");
      return await removeAssignment(String(id));
    },
    { successMessage: "Tugas dihapus." }
  );

  return <ActionCell onDelete={handleDelete} />;
}

export function AssignmentsClient({
  assignments,
  teachers,
  classes,
  subjects,
  semesters,
}: AssignmentsClientProps) {
  const columns: ColumnDef<Assignment>[] = [
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
      cell: ({ row }) => <AssignmentActions id={row.original.id} />,
    },
  ];

  return (
    <PageShell
      title="Tugas Guru"
      description="Tugaskan guru ke kelas dan mata pelajaran per semester."
      actions={
        <AssignmentDialog
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          semesters={semesters}
          trigger={<Button type="button">Tambah Tugas</Button>}
        />
      }
    >
      <DataTable
        columns={columns}
        data={assignments}
        searchKey="teacherName"
        searchPlaceholder="Cari guru..."
        exportFilename="tugas-guru"
        emptyMessage="Belum ada tugas."
      />
    </PageShell>
  );
}
