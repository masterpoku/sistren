"use client";

import { BookOpen, GraduationCap } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionCell, DataTable } from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassesDialog } from "@/features/academic/classes/ClassesDialog";
import { MajorDialog } from "@/features/academic/classes/MajorDialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

type ClassItem = {
  id: number;
  name: string;
  code: string;
  majorId: number | null;
  capacity: number | null;
};

type MajorItem = {
  id: number;
  name: string;
  description: string | null;
};

type Major = { id: number; name: string; description: string | null };

interface ClassesClientProps {
  classList: ClassItem[];
  majorList: Major[];
}

function ClassesActions({ item, majors }: { item: ClassItem; majors: Major[] }) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteClass } = await import("@/actions/academic");
      return await deleteClass(String(item.id));
    },
    { successMessage: "Kelas dihapus." }
  );

  return (
    <div className="flex items-center gap-2">
      <ClassesDialog
        item={{ id: item.id, name: item.name, majorId: item.majorId, capacity: item.capacity }}
        trigger={
          <Button type="button" variant="outline" size="sm">
            Edit
          </Button>
        }
        majors={majors}
      />
      <ActionCell onDelete={handleDelete} />
    </div>
  );
}

function MajorActions({ item }: { item: MajorItem }) {
  const [handleDelete] = useActionWithToast(
    async () => {
      const { deleteMajor } = await import("@/actions/academic");
      return await deleteMajor(String(item.id));
    },
    { successMessage: "Jurusan dihapus." }
  );

  return (
    <div className="flex items-center gap-2">
      <MajorDialog
        item={{ id: item.id, name: item.name, description: item.description }}
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

export function ClassesClient({ classList, majorList }: ClassesClientProps) {
  const [tab, setTab] = useState("classes");

  const majorMap = new Map(majorList.map((m) => [m.id, m.name]));

  const classColumns: ColumnDef<ClassItem>[] = [
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "code", header: "Kode" },
    {
      id: "major",
      header: "Jurusan",
      cell: ({ row }) => (
        <span>
          {row.original.majorId ? majorMap.get(row.original.majorId) ?? "-" : "-"}
        </span>
      ),
    },
    {
      id: "capacity",
      header: "Kapasitas",
      cell: ({ row }) => {
        const cap = row.original.capacity;
        return cap ? `${cap} siswa` : "-";
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <ClassesActions item={row.original} majors={majorList} />
      ),
    },
  ];

  const majorColumns: ColumnDef<MajorItem>[] = [
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "description", header: "Deskripsi" },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => <MajorActions item={row.original} />,
    },
  ];

  return (
    <PageShell
      title="Kelas & Jurusan"
      description="Kelola kelas (X, XI, XII) dan jurusan (TKJ, RPL, dll)."
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="classes">
            <GraduationCap className="size-4 mr-2" />
            Kelas
          </TabsTrigger>
          <TabsTrigger value="majors">
            <BookOpen className="size-4 mr-2" />
            Jurusan
          </TabsTrigger>
        </TabsList>
        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-end">
            <ClassesDialog
              trigger={<Button type="button">Tambah Kelas</Button>}
              majors={majorList}
            />
          </div>
          <DataTable
            columns={classColumns}
            data={classList}
            searchKey="name"
            exportFilename="kelas"
          />
        </TabsContent>
        <TabsContent value="majors" className="space-y-4">
          <div className="flex justify-end">
            <MajorDialog
              trigger={<Button type="button">Tambah Jurusan</Button>}
            />
          </div>
          <DataTable
            columns={majorColumns}
            data={majorList}
            searchKey="name"
            exportFilename="jurusan"
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
