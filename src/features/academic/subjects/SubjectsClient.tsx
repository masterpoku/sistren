'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Trash } from '@phosphor-icons/react';

type SubjectItem = {
  id: number;
  name: string;
  code: string | null;
  credits: number | null;
  className: string | null;
};

export const columns: ColumnDef<SubjectItem>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'code',
    header: 'Kode',
    cell: ({ row }) => row.getValue('code') ?? '-',
  },
  {
    accessorKey: 'className',
    header: 'Kelas',
  },
  {
    accessorKey: 'credits',
    header: 'SKS',
    cell: ({ row }) => row.getValue('credits') ?? 0,
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const subject = row.original;
      return (
        <form
          action={async () => {
            const { deleteSubject } = await import('@/actions/academic');
            await deleteSubject(String(subject.id));
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

interface SubjectsClientProps {
  data: SubjectItem[];
}

export function SubjectsClient({ data }: SubjectsClientProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      exportFilename="mapel"
    />
  );
}
