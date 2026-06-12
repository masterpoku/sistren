"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { createStaffAccount } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { formatDate } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  roleLevel: number | null;
  emailVerified: boolean | null;
  createdAt: Date | null;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roleName",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("roleName") ?? "unknown"}
      </Badge>
    ),
  },
  {
    accessorKey: "emailVerified",
    header: "Status",
    cell: ({ row }) =>
      row.getValue("emailVerified") ? (
        <Badge variant="default" className="bg-green-500">
          Aktif
        </Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      row.original.roleName !== "superadmin" ? (
        <ActionCell
          onDelete={async () => {
            const { deleteStaffAccount } = await import("@/actions/admin");
            await deleteStaffAccount(row.original.id);
          }}
        />
      ) : null,
  },
];

interface AdminUsersClientProps {
  data: User[];
}

export function AdminUsersClient({ data }: AdminUsersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createStaffAccount(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Buat dan kelola akun staff (guru, administrator).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Pengguna Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" placeholder="Nama lengkap" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@sekolah.sch.id"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 karakter"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="roleId">Role</Label>
              <Select name="roleId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">Guru</SelectItem>
                  <SelectItem value="80">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Cari nama..."
        exportFilename="pengguna"
        emptyMessage="Belum ada pengguna."
      />
    </div>
  );
}
