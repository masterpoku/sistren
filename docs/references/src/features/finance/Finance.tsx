import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, History, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Finance() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const bills = [
    { id: "INV-001", name: "SPP April 2026", amount: "Rp 500.000", dueDate: "10 April 2026", status: "Belum Bayar" },
    { id: "INV-002", name: "Uang Gedung (Cicilan 4)", amount: "Rp 1.000.000", dueDate: "15 April 2026", status: "Belum Bayar" },
  ];

  const history = [
    { id: "PAY-992", name: "SPP Maret 2026", amount: "Rp 500.000", date: "5 Maret 2026", method: "Virtual Account Mandiri" },
    { id: "PAY-991", name: "SPP Februari 2026", amount: "Rp 500.000", date: "2 Februari 2026", method: "Virtual Account BCA" },
    { id: "PAY-990", name: "Uang Seragam", amount: "Rp 750.000", date: "15 Januari 2026", method: "QRIS" },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground">
          Kelola pembayaran SPP dan tagihan lainnya melalui sistem terintegrasi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
            <Wallet className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 1.500.000</div>
            <p className="text-xs opacity-70">2 tagihan aktif perlu dibayar</p>
            <Button 
              className="mt-4 w-full bg-white text-primary hover:bg-white/90"
              onClick={() => setShowPaymentModal(true)}
            >
              Bayar Sekarang
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Pembayaran</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Lancar</div>
            <p className="text-xs text-muted-foreground">Tidak ada tunggakan lama</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metode Favorit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">VA Mandiri</div>
            <p className="text-xs text-muted-foreground">Digunakan pada 3 transaksi terakhir</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Tagihan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div className="font-medium">{bill.name}</div>
                      <div className="text-xs text-muted-foreground">Jatuh tempo: {bill.dueDate}</div>
                    </TableCell>
                    <TableCell>{bill.amount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(true)}>
                        Bayar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Riwayat Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.date} • {item.method}</div>
                    </TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Sukses
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-24 bg-blue-600 rounded flex items-center justify-center text-white font-bold italic text-sm">
                    Xendit
                  </div>
                  <span className="text-xs text-muted-foreground">Secure Payment</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)}>✕</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                <h2 className="text-3xl font-bold">Rp 1.500.000</h2>
                <p className="text-xs text-muted-foreground">Order ID: #SISTREN-2026-04-01</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-semibold">Pilih Metode Pembayaran</p>
                <div className="grid gap-2">
                  {[
                    { name: "Mandiri Virtual Account", icon: "🏦" },
                    { name: "BCA Virtual Account", icon: "🏦" },
                    { name: "QRIS (Gopay, OVO, Dana)", icon: "📱" },
                    { name: "Alfamart / Indomaret", icon: "🏪" },
                  ].map((method) => (
                    <Button key={method.name} variant="outline" className="justify-start h-12 gap-3">
                      <span className="text-xl">{method.icon}</span>
                      <span className="flex-1 text-left">{method.name}</span>
                      <ExternalLink className="h-4 w-4 opacity-30" />
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-center text-muted-foreground">
                Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan SMK TERPADU.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
