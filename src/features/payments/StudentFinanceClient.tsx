"use client";

import {
  Bank,
  Building,
  CheckCircle,
  Clock,
  QrCode,
  Wallet,
  WarningCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
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
import { EmptyState } from "@/components/ui/empty-state";

interface Payment {
  id: number;
  code: string | null;
  description: string | null;
  total: string | null;
  status: string | null;
  createdAt: Date | null;
}

interface StudentFinanceClientProps {
  payments: Payment[];
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
  }
> = {
  draft: { label: "Draft", variant: "secondary", icon: Clock },
  pending: { label: "Menunggu", variant: "outline", icon: Clock },
  paid: { label: "Lunas", variant: "default", icon: CheckCircle },
  cancelled: { label: "Batal", variant: "destructive", icon: WarningCircle },
};

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
              Rp {totalTagihan.toLocaleString("id-ID")}
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
          {payments.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Belum ada tagihan"
              description="Tidak ada tagihan SPP atau biaya lainnya saat ini."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Kode</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Deskripsi
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Jumlah</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const statusInfo =
                      STATUS_MAP[p.status ?? "draft"] ?? STATUS_MAP.draft;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {p.code}
                        </td>
                        <td className="px-4 py-3">{p.description}</td>
                        <td className="px-4 py-3 font-medium">
                          Rp {Number(p.total).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>
                            <span className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {payments.filter((p) => p.status === "paid").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
            <CardDescription>Pembayaran yang sudah lunas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Kode</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Deskripsi
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Jumlah</th>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .filter((p) => p.status === "paid")
                    .map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {p.code}
                        </td>
                        <td className="px-4 py-3">{p.description}</td>
                        <td className="px-4 py-3 font-medium">
                          Rp {Number(p.total).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
