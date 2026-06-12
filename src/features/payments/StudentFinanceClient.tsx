"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Bank,
  Building,
  CheckCircle,
  Clock,
  QrCode,
  Wallet,
  WarningCircle,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  STATUS_LABELS,
  formatCurrency,
  formatDate,
  type StatusConfig,
} from "@/components/ui/data-table";

interface Payment {
  id: number;
  code: string | null;
  description: string | null;
  total: string | null;
  status: string | null;
  createdAt: Date | null;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  draft: Clock,
  pending: Clock,
  paid: CheckCircle,
  cancelled: WarningCircle,
};

const INVOICE_COLUMNS: ColumnDef<Payment>[] = [
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
        {formatCurrency(row.getValue("total") ?? 0)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config: StatusConfig = STATUS_LABELS[status ?? "draft"] ?? STATUS_LABELS.draft;
      const StatusIcon = STATUS_ICONS[status ?? "draft"] ?? Clock;
      return (
        <Badge variant={config.variant}>
          <span className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
];

const PAID_COLUMNS: ColumnDef<Payment>[] = [
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
        {formatCurrency(row.getValue("total") ?? 0)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
];

interface StudentFinanceClientProps {
  payments: Payment[];
}

export function StudentFinanceClient({ payments }: StudentFinanceClientProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const totalTagihan = payments
    .filter((p) => p.status !== "cancelled")
    .reduce((sum, p) => sum + Number(p.total ?? 0), 0);

  const totalLunas = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.total ?? 0), 0);

  const pendingCount = payments.filter(
    (p) => p.status === "pending" || p.status === "draft"
  ).length;

  const unpaidPayments = payments.filter((p) => p.status !== "paid");
  const paidPayments = payments.filter((p) => p.status === "paid");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pembayaran</h1>
        <p className="text-muted-foreground">
          Ringkasan tagihan dan riwayat pembayaran.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-primary-foreground/80 text-xs">
              Total Tagihan
            </CardDescription>
            <Wallet className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalTagihan)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs">
              Status Pembayaran
            </CardDescription>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTagihan > 0
                ? `${Math.round((totalLunas / totalTagihan) * 100)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0
                ? `${pendingCount} tagihan menunggu`
                : "Semua lunas"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs">
              Metode Favorit
            </CardDescription>
            <Bank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Transfer</div>
            <p className="text-xs text-muted-foreground">Bank Mandiri</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tagihan</CardTitle>
              <CardDescription>
                Daftar tagihan SPP dan biaya lainnya.
              </CardDescription>
            </div>
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={pendingCount === 0}>
                  Bayar Sekarang
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
                  <DialogDescription>
                    Pilih metode pembayaran yang tersedia.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {[
                    {
                      id: "va",
                      name: "Virtual Account",
                      icon: Bank,
                      desc: "BCA, Mandiri, BNI, BRI",
                    },
                    {
                      id: "qris",
                      name: "QRIS",
                      icon: QrCode,
                      desc: "Scan via GoPay, OVO, Dana",
                    },
                    {
                      id: "retail",
                      name: "Convenience Store",
                      icon: Building,
                      desc: "Alfamart, Indomaret",
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {method.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full"
                  disabled={!selectedMethod}
                  onClick={() => {
                    alert(`Pembayaran via ${selectedMethod} akan diproses.`);
                    setPaymentOpen(false);
                  }}
                >
                  {selectedMethod
                    ? `Bayar via ${selectedMethod.toUpperCase()}`
                    : "Pilih metode"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {unpaidPayments.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Belum ada tagihan"
              description="Tidak ada tagihan SPP atau biaya lainnya saat ini."
            />
          ) : (
            <DataTable
              columns={INVOICE_COLUMNS}
              data={unpaidPayments}
              searchKey="description"
              searchPlaceholder="Cari tagihan..."
              exportFilename="tagihan"
              emptyMessage="Tidak ada tagihan aktif."
            />
          )}
        </CardContent>
      </Card>

      {paidPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
            <CardDescription>Pembayaran yang sudah lunas.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={PAID_COLUMNS}
              data={paidPayments}
              searchKey="description"
              searchPlaceholder="Cari riwayat..."
              exportFilename="riwayat-pembayaran"
              emptyMessage="Belum ada pembayaran lunas."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
