"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { createPaymentMethod } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ActionCell } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentMethod = {
  id: number;
  name: string;
  provider: string | null;
  accountNumber: string | null;
  accountName: string | null;
};

export const columns: ColumnDef<PaymentMethod>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => row.getValue("provider") ?? "-",
  },
  {
    accessorKey: "accountNumber",
    header: "Nomor Rekening",
    cell: ({ row }) => row.getValue("accountNumber") ?? "-",
  },
  {
    accessorKey: "accountName",
    header: "Nama Pemilik",
    cell: ({ row }) => row.getValue("accountName") ?? "-",
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <ActionCell
        onDelete={() => {
          const { deletePaymentMethod } = require("@/actions/payments");
          deletePaymentMethod(String(row.original.id));
        }}
      />
    ),
  },
];

interface PaymentMethodsClientProps {
  data: PaymentMethod[];
}

export function PaymentMethodsClient({ data }: PaymentMethodsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createPaymentMethod(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Metode Pembayaran</h1>
        <p className="text-muted-foreground">
          Kelola metode pembayaran (transfer, cash, e-wallet).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Metode</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nama Metode</Label>
              <Input id="name" name="name" placeholder="Bank BCA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Pemilik</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="SMK Terpadu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" name="provider" placeholder="Bank BCA" />
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
        searchPlaceholder="Cari metode..."
        exportFilename="metode-pembayaran"
        emptyMessage="Belum ada metode pembayaran."
      />
    </div>
  );
}
