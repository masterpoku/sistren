"use client";

import { Trash } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTransition } from "react";
import { createClassAction, deleteClass } from "@/actions/academic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/ui/page-shell";

type ClassItem = {
  id: number;
  name: string;
  code: string;
};

interface ClassesClientProps {
  classList: ClassItem[];
}

export const columns: ColumnDef<ClassItem>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "code",
    header: "Kode",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("code")}</Badge>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const kelas = row.original;
      return (
        <form
          action={async () => {
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

export function ClassesClient({ classList }: ClassesClientProps) {
  const [isPending, startTransition] = useTransition();

  function handleCreateClass(formData: FormData) {
    startTransition(async () => {
      await createClassAction(formData);
    });
  }

  return (
    <PageShell
      title="Kelola Kelas"
      description="Tambah dan kelola kelas (X, XI, XII)."
    >
      <Card>
        <CardHeader>
          <CardTitle>Tambah Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreateClass} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: X, XI, XII"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                name="code"
                placeholder="Contoh: X-1, XI-2"
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={classList}
          searchKey="name"
          exportFilename="kelas"
        />
      </div>
    </PageShell>
  );
}
