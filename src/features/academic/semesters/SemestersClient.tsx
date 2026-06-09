"use client";

import { Pencil, Play, Trash } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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

type SemesterItem = {
  id: number;
  name: string;
  academicYear: string | null;
  isActive: boolean | null;
};

export const columns: ColumnDef<SemesterItem>[] = [
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
    cell: ({ row }) => (
      <SemesterActions
        id={row.original.id}
        name={row.original.name}
        academicYear={row.original.academicYear}
        isActive={row.original.isActive}
      />
    ),
  },
];

function SemesterActions({ id, name, academicYear, isActive }: SemesterItem) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleEdit(formData: FormData) {
    const { updateSemester } = await import("@/actions/academic");
    await updateSemester(String(id), formData);
    setEditOpen(false);
  }

  async function handleDelete() {
    if (!confirm("Yakin hapus semester ini?")) return;
    const { deleteSemester } = await import("@/actions/academic");
    await deleteSemester(String(id));
  }

  async function handleActivate() {
    const { setActiveSemester } = await import("@/actions/academic");
    await setActiveSemester(String(id));
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        {!isActive && (
          <Button size="sm" variant="outline" onClick={handleActivate}>
            <Play className="h-4 w-4 mr-1" />
            Aktifkan
          </Button>
        )}
        <Button size="sm" variant="destructive" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-1" />
          Hapus
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Semester</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`sem-name-${id}`}>Nama Semester</Label>
              <Input
                id={`sem-name-${id}`}
                name="name"
                defaultValue={name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sem-year-${id}`}>Tahun Ajaran</Label>
              <Input
                id={`sem-year-${id}`}
                name="academicYear"
                defaultValue={academicYear ?? ""}
                required
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
