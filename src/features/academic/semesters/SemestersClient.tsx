'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, Play } from '@phosphor-icons/react';

type SemesterItem = {
  id: number;
  name: string;
  academicYear: string | null;
  isActive: boolean | null;
};

export const columns: ColumnDef<SemesterItem>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'academicYear',
    header: 'Tahun Ajaran',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) =>
      row.getValue('isActive') ? (
        <Badge className="bg-green-500">Aktif</Badge>
      ) : (
        <Badge variant="outline">Tidak Aktif</Badge>
      ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const semester = row.original;
      return (
        <div className="flex gap-2">
          {!semester.isActive && (
            <form
              action={async () => {
                const { setActiveSemester } = await import('@/actions/academic');
                await setActiveSemester(String(semester.id));
              }}
            >
              <Button size="sm" variant="outline" type="submit">
                <Play className="h-4 w-4 mr-1" />
                Aktifkan
              </Button>
            </form>
          )}
          <form
            action={async () => {
              const { deleteSemester } = await import('@/actions/academic');
              await deleteSemester(String(semester.id));
            }}
          >
            <Button size="sm" variant="destructive" type="submit">
              <Trash className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          </form>
        </div>
      );
    },
  },
];

interface SemestersClientProps {
  data: SemesterItem[];
}

export function SemestersClient({ data }: SemestersClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      exportFilename="semester"
    />
  );
}
