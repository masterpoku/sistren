"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { MajorDialog } from "@/features/academic/majors/MajorDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

type MajorItem = {
  id: number;
  name: string;
  description: string | null;
};

interface MajorsClientProps {
  data: MajorItem[];
}

function MajorActions({ item }: { item: MajorItem }) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteMajor } = await import("@/actions/academic");
      return await deleteMajor(String(item.id));
    },
    { successMessage: "Jurusan dihapus." }
  );

  return (
    <div className="flex items-center gap-2">
      <MajorDialog
        item={{ id: item.id, name: item.name, description: item.description }}
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

export function MajorsClient({ data }: MajorsClientProps) {
  const columns: ColumnDef<MajorItem>[] = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => row.getValue("description") ?? "-",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => <MajorActions item={row.original} />,
    },
  ];

  return (
    <PageShell
      title="Kelola Jurusan"
      description="Tambah dan kelola jurusan (IPA, IPS, Bahasa)."
      actions={
        <MajorDialog trigger={<Button type="button">Tambah Jurusan</Button>} />
      }
    >
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        exportFilename="jurusan"
      />
    </PageShell>
  );
}
