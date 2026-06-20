"use client";

import { useState, useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import {
  STATUS_LABELS,
  formatCurrency,
  type StatusConfig,
} from "@/components/ui/data-table";
import { PageShell } from "@/components/ui/page-shell";
import { useToast } from "@/hooks/use-toast";
import { RecordPaymentDialog } from "@/features/finance/RecordPaymentDialog";
import { PaymentSlipUploadDialog } from "./PaymentSlipUploadDialog";

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

type SlipRow = {
  id: number;
  paymentId: number;
  studentId: string;
  slipFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date | string;
  status: string | null;
  rejectionReason: string | null;
};

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
  canManage: boolean;
  slips?: SlipRow[];
}

export function FinanceClient({
  paymentList,
  studentRows,
  catalogItems,
  recordPayment,
  canManage,
  slips = [],
}: FinanceClientProps) {
  const [rejectTarget, setRejectTarget] = useState<SlipRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Build a map: paymentId -> slip
  const slipMap = new Map<number, SlipRow>();
  for (const slip of slips) {
    if (!slipMap.has(slip.paymentId)) {
      slipMap.set(slip.paymentId, slip);
    }
  }

  function handleApprove(slipId: number) {
    startTransition(async () => {
      const { approvePaymentSlip } = await import("@/actions/payments");
      const result = await approvePaymentSlip(String(slipId));
      if ("error" in result) {
        toast({ variant: "destructive", description: result.error });
        return;
      }
      toast({ description: "Bukti bayar disetujui. Pembayaran ditandai lunas." });
    });
  }

  function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    startTransition(async () => {
      const { rejectPaymentSlip } = await import("@/actions/payments");
      const result = await rejectPaymentSlip(String(rejectTarget.id), rejectReason);
      if ("error" in result) {
        toast({ variant: "destructive", description: result.error });
        return;
      }
      toast({ description: "Bukti bayar ditolak." });
      setRejectTarget(null);
      setRejectReason("");
    });
  }

  const columns: ColumnDef<PaymentRow>[] = [
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
        const config: StatusConfig =
          STATUS_LABELS[status ?? "draft"] ?? STATUS_LABELS.draft;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    ...(canManage
      ? [
          {
            id: "slip" as const,
            header: "Bukti Bayar",
            cell: ({ row }: { row: { original: PaymentRow } }) => {
              const slip = slipMap.get(row.original.id);
              if (!slip) return <span className="text-muted-foreground text-xs">—</span>;
              if (slip.status === "pending") {
                return (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a
                        href={`/api/payments/slips/${slip.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(slip.id)}
                      disabled={isPending}
                    >
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectTarget(slip)}
                    >
                      Tolak
                    </Button>
                  </div>
                );
              }
              if (slip.status === "approved") {
                return (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`/api/payments/slips/${slip.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Lihat
                    </a>
                  </Button>
                );
              }
              return (
                <span className="text-destructive text-xs">
                  Ditolak: {slip.rejectionReason ?? ""}
                </span>
              );
            },
          } as ColumnDef<PaymentRow>,
        ]
      : [
          {
            id: "slip" as const,
            header: "Bukti Bayar",
            cell: ({ row }: { row: { original: PaymentRow } }) => {
              const slip = slipMap.get(row.original.id);
              if (!slip) {
                if (row.original.status === "pending") {
                  return (
                    <PaymentSlipUploadDialog
                      paymentId={row.original.id}
                      trigger={
                        <Button size="sm" type="button">
                          Upload
                        </Button>
                      }
                    />
                  );
                }
                return <span className="text-muted-foreground text-xs">—</span>;
              }
              if (slip.status === "pending") {
                return <Badge variant="outline">Menunggu review</Badge>;
              }
              if (slip.status === "approved") {
                return (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`/api/payments/slips/${slip.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat
                      </a>
                    </Button>
                    <Badge variant="default">Disetujui</Badge>
                  </div>
                );
              }
              if (slip.status === "rejected") {
                return (
                  <div className="flex flex-col gap-1">
                    <Badge variant="destructive">Ditolak</Badge>
                    <span className="text-xs text-destructive">
                      {slip.rejectionReason}
                    </span>
                    <PaymentSlipUploadDialog paymentId={row.original.id}>
                      <Button size="sm" variant="outline" type="button">
                        Upload ulang
                      </Button>
                    </PaymentSlipUploadDialog>
                  </div>
                );
              }
              return null;
            },
          } as ColumnDef<PaymentRow>,
        ]),
  ];

  return (
    <>
      <PageShell
        title="Keuangan"
        description="Kelola pembayaran siswa."
        actions={
          canManage ? (
            <RecordPaymentDialog
              students={studentRows}
              paymentItems={catalogItems}
              recordAction={recordPayment}
              trigger={<Button type="button">Catat Pembayaran</Button>}
            />
          ) : null
        }
      >
        <DataTable
          columns={columns}
          data={paymentList}
          searchKey="studentName"
          searchPlaceholder="Cari siswa..."
          exportFilename="pembayaran"
          emptyMessage="Belum ada data pembayaran."
        />
      </PageShell>

      <AlertDialog
        open={rejectTarget !== null}
        onOpenChange={(o) => !o && setRejectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Bukti Bayar</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan alasan penolakan agar siswa bisa mengunggah ulang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={3}
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectReason.trim() || isPending}
            >
              {isPending ? "Menolak..." : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
