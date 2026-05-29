'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Trash } from '@phosphor-icons/react';

type MajorItem = {
  id: number;
  name: string;
  description: string | null;
};

export const columns: ColumnDef<MajorItem>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => row.getValue('description') ?? '-',
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const major = row.original;
      return (
        <form
          action={async () => {
            const { deleteMajor } = await import('@/actions/academic');
            await deleteMajor(String(major.id));
          }}
        >
          <Button size="sm" variant="destructive" type="submit">
            <Trash className="h-4 w-4 mr-1" />
            Hapus
          </Button>
        </form>
      );
    },
  },
];

interface MajorsClientProps {
  data: MajorItem[];
}

export function MajorsClient({ data }: MajorsClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      exportFilename="jurusan"
    />
  );
}
