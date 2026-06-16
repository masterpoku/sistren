"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { SubjectDialog } from "@/features/academic/subjects/SubjectDialog";

type SubjectItem = {
    id: number;
    name: string;
    code: string | null;
    credits: number | null;
};

interface SubjectsClientProps {
    data: SubjectItem[];
    classList?: { id: number; name: string }[];
}

function SubjectActions({ item }: { item: SubjectItem }) {
    const { toast } = useToast();

    async function handleDelete() {
        const { deleteSubject } = await import("@/actions/academic");
        const result = await deleteSubject(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Mapel dihapus." });
    }

    return (
        <div className="flex items-center gap-2">
            <SubjectDialog
                item={{ id: item.id, name: item.name, code: item.code, credits: item.credits }}
                trigger={
                    <Button type="button" variant="outline" size="sm">
                        Edit
                    </Button>
                }
            />
            <ActionCell onDelete={handleDelete} />
        </div>
    );
}

export function SubjectsClient({ data, classList: _classList }: SubjectsClientProps) {
    const columns: ColumnDef<SubjectItem>[] = [
        {
            accessorKey: "name",
            header: "Nama",
        },
        {
            accessorKey: "code",
            header: "Kode",
            cell: ({ row }) => row.getValue("code") ?? "-",
        },
        {
            accessorKey: "credits",
            header: "SKS",
            cell: ({ row }) => row.getValue("credits") ?? 0,
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => <SubjectActions item={row.original} />,
        },
    ];

    return (
        <PageShell
            title="Kelola Mata Pelajaran"
            description="Tambah dan kelola mata pelajaran."
            actions={
                <SubjectDialog
                    trigger={<Button type="button">Tambah Mata Pelajaran</Button>}
                />
            }
        >
            <DataTable
                columns={columns}
                data={data}
                searchKey="name"
                exportFilename="mapel"
            />
        </PageShell>
    );
}
