'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MOCK_STUDENTS } from '@/constants';
import type { Student } from '@/constants';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowsDownUp,
  DotsThree,
  Eye,
  Pencil,
  Trash,
  Plus,
} from 'phosphor-react';

export const columns: ColumnDef<Student>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'studentId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          NIS
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Nama Lengkap',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'class',
    header: 'Kelas',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'aktif'
              ? 'default'
              : status === 'lulus'
                ? 'secondary'
                : 'destructive'
          }
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'joinDate',
    header: 'Tanggal Masuk',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const student = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <DotsThree className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.studentId)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" /> Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" /> Edit Data
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function StudentsPage() {
  const [students, setStudents] = React.useState(MOCK_STUDENTS);

  const activeStudents = students.filter((s) => s.status === 'aktif');
  const inactiveStudents = students.filter((s) => s.status === 'non-aktif');
  const graduatedStudents = students.filter((s) => s.status === 'lulus');

  const handleImport = (data: unknown[]) => {
    console.log('Imported data:', data);
    setStudents((prev) => [...prev, ...(data as Student[])]);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
          <p className="text-muted-foreground">
            Manajemen data siswa SMK TERPADU.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Siswa Aktif
          </div>
          <div className="text-2xl font-bold">{activeStudents.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Non-Aktif
          </div>
          <div className="text-2xl font-bold">{inactiveStudents.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">Lulus</div>
          <div className="text-2xl font-bold">{graduatedStudents.length}</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="name"
        exportFilename="data-siswa-sistren"
        onImport={handleImport}
      />
    </div>
  );
}
