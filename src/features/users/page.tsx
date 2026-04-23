'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MOCK_USERS_LIST } from '@/constants';
import type { UserManagement } from '@/constants';
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
  UserPlus,
} from 'phosphor-react';

const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  administrator: 'Administrator',
  guru: 'Guru',
  siswa: 'Siswa',
  alumni: 'Alumni',
};

const roleBadgeVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  superadmin: 'destructive',
  administrator: 'default',
  guru: 'secondary',
  siswa: 'outline',
  alumni: 'outline',
};

export const columns: ColumnDef<UserManagement>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nama
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge
          variant={roleBadgeVariant[role] || 'outline'}
          className="capitalize"
        >
          {roleLabels[role] || role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Login Terakhir',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

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
              onClick={() => navigator.clipboard.writeText(user.email)}
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

export default function UsersPage() {
  const [users, setUsers] = React.useState(MOCK_USERS_LIST);

  const roleCounts = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleImport = (data: unknown[]) => {
    console.log('Imported data:', data);
    setUsers((prev) => [...prev, ...(data as UserManagement[])]);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Manajemen semua pengguna sistem.
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              {roleLabels[role] || role}
            </div>
            <div className="text-2xl font-bold">{count}</div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        exportFilename="data-pengguna-sistren"
        onImport={handleImport}
      />
    </div>
  );
}
