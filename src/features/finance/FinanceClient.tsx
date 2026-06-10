"use client";

import { useTransition } from "react";
import { confirmPayment } from "@/actions/payments";
import { RecordPaymentForm } from "@/features/finance/RecordPaymentForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Menunggu", variant: "outline" },
  paid: { label: "Lunas", variant: "default" },
  cancelled: { label: "Batal", variant: "destructive" },
};

interface FinanceClientProps {
  paymentList: Array<{
    id: number;
    studentId: string;
    studentName: string | null;
    code: string;
    description: string;
    price: string;
    total: string;
    status: string | null;
  }>;
  studentRows: Array<{ id: string; name: string; email: string }>;
  catalogItems: Array<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    standardPrice: string;
  }>;
  recordPayment: (formData: FormData) => Promise<{ error?: string } | { success: boolean }>;
}

export function FinanceClient({
  paymentList,
  studentRows,
  catalogItems,
  recordPayment,
}: FinanceClientProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm(paymentId: number) {
    startTransition(async () => {
      await confirmPayment(String(paymentId));
    });
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground">Kelola pembayaran siswa.</p>
      </div>

      {/* Record Payment Form */}
      <RecordPaymentForm
        students={studentRows}
        paymentItems={catalogItems}
        recordAction={recordPayment}
      />

      {/* All Payments Table */}
      {paymentList.length === 0 ? (
        <div className="rounded-md border bg-card">
          <div className="py-8 text-center text-muted-foreground">
            Belum ada data pembayaran.
          </div>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentList.map((p) => {
                const statusInfo =
                  STATUS_LABELS[p.status ?? "draft"] ?? STATUS_LABELS.draft;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.studentName ?? p.studentId}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {p.code}
                    </TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell className="font-medium">
                      Rp {Number(p.total).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleConfirm(p.id)}
                        >
                          Konfirmasi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
