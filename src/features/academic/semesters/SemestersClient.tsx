"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { SemesterDialog } from "@/features/academic/semesters/SemesterDialog";

type SemesterItem = {
    id: number;
    name: string;
    academicYear: string | null;
    isActive: boolean | null;
};

interface SemestersClientProps {
    data: SemesterItem[];
}

function SemesterActions({ item }: { item: SemesterItem }) {
    const { toast } = useToast();

    async function handleDelete() {
        const { deleteSemester } = await import("@/actions/academic");
        const result = await deleteSemester(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Semester dihapus." });
    }

    async function handleActivate() {
        const { setActiveSemester } = await import("@/actions/academic");
        const result = await setActiveSemester(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Semester diaktifkan." });
    }

    return (
        <div className="flex items-center gap-2">
            <SemesterDialog
                item={{
                    id: item.id,
                    name: item.name,
                    academicYear: item.academicYear,
                    isActive: item.isActive,
                }}
                trigger={
                    <Button type="button" variant="outline" size="sm">
                        Edit
                    </Button>
                }
            />
            <ActionCell
                onDelete={handleDelete}
                onCustom={
                    item.isActive
                        ? undefined
                        : [
                            {
                                label: "Aktifkan",
                                onClick: handleActivate,
                            },
                        ]
                }
            />
        </div>
    );
}

export function SemestersClient({ data }: SemestersClientProps) {
    const columns: ColumnDef<SemesterItem>[] = [
        {
            accessorKey: "name",
            header: "Nama",
        },
        {
            accessorKey: "academicYear",
            header: "Tahun Ajaran",
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) =>
                row.getValue("isActive") ? (
                    <Badge className="bg-green-500">Aktif</Badge>
                ) : (
                    <Badge variant="outline">Tidak Aktif</Badge>
                ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => <SemesterActions item={row.original} />,
        },
    ];

    return (
        <PageShell
            title="Kelola Semester"
            description="Tambah dan kelola semester serta tahun ajaran."
            actions={
                <SemesterDialog
                    trigger={<Button type="button">Tambah Semester</Button>}
                />
            }
        >
            <DataTable
                columns={columns}
                data={data}
                searchKey="name"
                exportFilename="semester"
            />
        </PageShell>
    );
}
