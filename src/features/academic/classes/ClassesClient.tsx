'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash } from '@phosphor-icons/react';

type ClassItem = {
  id: number;
  name: string;
  code: string;
};

export const columns: ColumnDef<ClassItem>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'code',
    header: 'Kode',
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue('code')}</Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const kelas = row.original;
      return (
        <form
          action={async () => {
            const { deleteClass } = await import('@/actions/academic');
            await deleteClass(String(kelas.id));
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
