"use client";

import { Pencil, Trash } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubjectItem = {
  id: number;
  name: string;
  code: string | null;
  credits: number | null;
  className?: string | null;
};

export const columns: ColumnDef<SubjectItem>[] = [
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
    accessorKey: "className",
    header: "Kelas",
  },
  {
    accessorKey: "credits",
    header: "SKS",
    cell: ({ row }) => row.getValue("credits") ?? 0,
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <SubjectActions
        id={row.original.id}
        name={row.original.name}
        code={row.original.code}
        credits={row.original.credits}
      />
    ),
  },
];

function SubjectActions({ id, name, code, credits }: SubjectItem) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleEdit(formData: FormData) {
    const { updateSubject } = await import("@/actions/academic");
    await updateSubject(String(id), formData);
    setEditOpen(false);
  }

  async function handleDelete() {
    if (!confirm("Yakin hapus mapel ini?")) return;
    const { deleteSubject } = await import("@/actions/academic");
    await deleteSubject(String(id));
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
            <DialogTitle>Edit Mata Pelajaran</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`subj-name-${id}`}>Nama Mapel</Label>
              <Input
                id={`subj-name-${id}`}
                name="name"
                defaultValue={name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`subj-code-${id}`}>Kode</Label>
              <Input
                id={`subj-code-${id}`}
                name="code"
                defaultValue={code ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`subj-credits-${id}`}>SKS</Label>
              <Input
                id={`subj-credits-${id}`}
                name="credits"
                type="number"
                min="0"
                defaultValue={String(credits ?? 0)}
                className="w-20"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
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
