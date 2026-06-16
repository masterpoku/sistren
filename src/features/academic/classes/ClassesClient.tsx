"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { ClassesDialog } from "@/features/academic/classes/ClassesDialog";

type ClassItem = {
    id: number;
    name: string;
    code: string;
};

interface ClassesClientProps {
    classList: ClassItem[];
}

function ClassesActions({ item }: { item: ClassItem }) {
    const { toast } = useToast();

    async function handleDelete() {
        const { deleteClass } = await import("@/actions/academic");
        const result = await deleteClass(String(item.id));
        if (result && "error" in result && result.error) {
            toast({ variant: "destructive", description: result.error });
            return;
        }
        toast({ description: "Kelas dihapus." });
    }

    return (
        <div className="flex items-center gap-2">
            <ClassesDialog
                item={{ id: item.id, name: item.name, code: item.code }}
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

export function ClassesClient({ classList }: ClassesClientProps) {
    const columns: ColumnDef<ClassItem>[] = [
        {
            accessorKey: "name",
            header: "Nama",
        },
        {
            accessorKey: "code",
            header: "Kode",
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => <ClassesActions item={row.original} />,
        },
    ];

    return (
        <PageShell
            title="Kelola Kelas"
            description="Tambah dan kelola kelas (X, XI, XII)."
            actions={
                <ClassesDialog
                    trigger={<Button type="button">Tambah Kelas</Button>}
                />
            }
        >
            <DataTable
                columns={columns}
                data={classList}
                searchKey="name"
                exportFilename="kelas"
            />
        </PageShell>
    );
}
