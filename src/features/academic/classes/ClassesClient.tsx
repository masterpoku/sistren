"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { ClassesDialog } from "@/features/academic/classes/ClassesDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

type ClassItem = {
  id: number;
  name: string;
  code: string;
};

interface ClassesClientProps {
  classList: ClassItem[];
}

function ClassesActions({ item }: { item: ClassItem }) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteClass } = await import("@/actions/academic");
      return await deleteClass(String(item.id));
    },
    { successMessage: "Kelas dihapus." }
  );

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
        <ClassesDialog trigger={<Button type="button">Tambah Kelas</Button>} />
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
