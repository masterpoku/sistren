"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { AssignmentDialog } from "@/features/academic/AssignmentDialog";

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
    const { toast } = useToast();

    async function handleDelete() {
        const { removeAssignment } = await import("@/actions/academic");
        const result = await removeAssignment(String(id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Tugas dihapus." });
    }

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
