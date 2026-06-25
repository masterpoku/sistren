"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { SemesterDialog } from "@/features/academic/semesters/SemesterDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

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
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteSemester } = await import("@/actions/academic");
      return await deleteSemester(String(item.id));
    },
    { successMessage: "Semester dihapus." }
  );
  const [handleActivate] = useActionWithToast(
    async () => {
      const { setActiveSemester } = await import("@/actions/academic");
      return await setActiveSemester(String(item.id));
    },
    { successMessage: "Semester diaktifkan." }
  );

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
