"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { SubjectDialog } from "@/features/academic/subjects/SubjectDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

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
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteSubject } = await import("@/actions/academic");
      return await deleteSubject(String(item.id));
    },
    { successMessage: "Mapel dihapus." }
  );

  return (
    <div className="flex items-center gap-2">
      <SubjectDialog
        item={{
          id: item.id,
          name: item.name,
          code: item.code,
          credits: item.credits,
        }}
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

export function SubjectsClient({
  data,
  classList: _classList,
}: SubjectsClientProps) {
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
