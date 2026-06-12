"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { confirmPayment } from "@/actions/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  STATUS_LABELS,
  formatCurrency,
  type StatusConfig,
} from "@/components/ui/data-table";
import { RecordPaymentForm } from "@/features/finance/RecordPaymentForm";

type PaymentRow = {
  id: number;
  studentId: string;
  studentName: string | null;
  code: string;
  description: string;
  price: string;
  total: string;
  status: string | null;
};

export const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: "studentName",
    header: "Siswa",
    cell: ({ row }) => row.original.studentName ?? row.original.studentId,
  },
  {
    accessorKey: "code",
    header: "Kode",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("code")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
  },
  {
    accessorKey: "total",
    header: "Jumlah",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.getValue("total"))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config: StatusConfig = STATUS_LABELS[status ?? "draft"] ?? STATUS_LABELS.draft;
      return (
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      if (row.original.status === "pending") {
        return (
          <Button
            size="sm"
            onClick={() => confirmPayment(String(row.original.id))}
          >
            Konfirmasi
          </Button>
        );
      }
      return null;
    },
  },
];

interface FinanceClientProps {
  paymentList: PaymentRow[];
  studentRows: Array<{ id: string; name: string; email: string }>;
  catalogItems: Array<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    standardPrice: string;
  }>;
  recordPayment: (
    formData: FormData
  ) => Promise<{ error?: string } | { success: boolean }>;
}

export function FinanceClient({
  paymentList,
  studentRows,
  catalogItems,
  recordPayment,
}: FinanceClientProps) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground">Kelola pembayaran siswa.</p>
      </div>

      <RecordPaymentForm
        students={studentRows}
        paymentItems={catalogItems}
        recordAction={recordPayment}
      />

      <DataTable
        columns={columns}
        data={paymentList}
        searchKey="studentName"
        searchPlaceholder="Cari siswa..."
        exportFilename="pembayaran"
        emptyMessage="Belum ada data pembayaran."
      />
    </div>
  );
}
