'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Trash, Pencil } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    cell: ({ row }) => <MajorActions id={row.original.id} name={row.original.name} description={row.original.description} />,
  },
];

function MajorActions({ id, name, description }: MajorItem) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleEdit(formData: FormData) {
    const { updateMajor } = await import('@/actions/academic');
    await updateMajor(String(id), formData);
    setEditOpen(false);
  }

  async function handleDelete() {
    if (!confirm('Yakin hapus jurusan ini?')) return;
    const { deleteMajor } = await import('@/actions/academic');
    await deleteMajor(String(id));
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-1" />
          Hapus
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jurusan</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`major-name-${id}`}>Nama Jurusan</Label>
              <Input id={`major-name-${id}`} name="name" defaultValue={name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`major-desc-${id}`}>Deskripsi</Label>
              <Input id={`major-desc-${id}`} name="description" defaultValue={description ?? ''} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

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