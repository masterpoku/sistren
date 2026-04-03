'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MOCK_PAYMENTS } from '@/util/mock/finance';
import type { Payment } from '@/util/mock/finance';
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
import { DotsThree, Eye, Pencil, Trash, Plus } from 'phosphor-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const columns: ColumnDef<Payment>[] = [
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
    accessorKey: 'studentName',
    header: 'Siswa',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('studentName')}</div>
    ),
  },
  {
    accessorKey: 'studentId',
    header: 'NIS',
  },
  {
    accessorKey: 'type',
    header: 'Jenis',
  },
  {
    accessorKey: 'amount',
    header: 'Jumlah',
    cell: ({ row }) => formatCurrency(row.getValue('amount')),
  },
  {
    accessorKey: 'date',
    header: 'Tanggal',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'lunas'
              ? 'default'
              : status === 'belum-lunas'
                ? 'destructive'
                : 'secondary'
          }
          className="capitalize"
        >
          {status === 'lunas'
            ? 'Lunas'
            : status === 'belum-lunas'
              ? 'Belum Lunas'
              : 'Menunggu'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;

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
              onClick={() => navigator.clipboard.writeText(payment.id)}
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

export default function FinancePage() {
  const [payments, setPayments] = React.useState(MOCK_PAYMENTS);

  const paidPayments = payments.filter((p) => p.status === 'lunas');
  const unpaidPayments = payments.filter((p) => p.status === 'belum-lunas');
  const pendingPayments = payments.filter(
    (p) => p.status === 'menunggu-konfirmasi'
  );

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleImport = (data: unknown[]) => {
    console.log('Imported data:', data);
    setPayments((prev) => [...prev, ...(data as Payment[])]);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
          <p className="text-muted-foreground">
            Manajemen pembayaran siswa SMK TERPADU.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pembayaran
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">Lunas</div>
          <div className="text-2xl font-bold">{paidPayments.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Belum Lunas
          </div>
          <div className="text-2xl font-bold">{unpaidPayments.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Menunggu Konfirmasi
          </div>
          <div className="text-2xl font-bold">{pendingPayments.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Total Pendapatan
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchKey="studentName"
        exportFilename="data-pembayaran-sistren"
        onImport={handleImport}
      />
    </div>
  );
}
