"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_VARIANTS,
  formatCurrency,
  type BadgeVariant,
} from "@/components/ui/data-table";

export interface PaymentCatalogItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
  type: "recurring" | "one_time" | "variable" | null;
  semesterName: string | null;
  isActive: boolean | null;
}

export const columns: ColumnDef<PaymentCatalogItem>[] = [
  {
    accessorKey: "code",
    header: "Kode",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("code")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => row.getValue("description") ?? "-",
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      if (!type) return "-";
      return (
        <Badge variant={PAYMENT_TYPE_VARIANTS[type] as BadgeVariant}>
          {PAYMENT_TYPE_LABELS[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "semesterName",
    header: "Semester",
    cell: ({ row }) => row.getValue("semesterName") ?? "-",
  },
  {
    accessorKey: "standardPrice",
    header: "Harga",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.getValue("standardPrice"))}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive === false ? "destructive" : "default"}>
          {isActive === false ? "Non-aktif" : "Aktif"}
        </Badge>
      );
    },
  },
];

interface PaymentCatalogClientProps {
  items: PaymentCatalogItem[];
}

export function PaymentCatalogClient({ items }: PaymentCatalogClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Katalog Pembayaran</h1>
        <p className="text-muted-foreground">
          Daftar item pembayaran yang tersedia di sekolah.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="name"
        searchPlaceholder="Cari item..."
        exportFilename="katalog-pembayaran"
        emptyMessage="Belum ada item pembayaran tersedia."
      />
    </div>
  );
}
