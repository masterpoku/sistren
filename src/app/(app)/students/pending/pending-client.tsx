"use client";

import { CheckCircle, Clock } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { handleLogout } from "./actions";

export function PendingClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleCancel() {
    setBusy(true);
    const { cancelVerification } = await import("@/actions/verification");
    const result = await cancelVerification();
    setBusy(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    router.push("/students/profile/complete");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sedang di Verifikasi
        </h1>
        <p className="text-slate-500">
          Data diri Anda sedang diperiksa oleh admin. Silakan tunggu konfirmasi
          untuk dapat mengakses dashboard.
        </p>
        <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Status: Menunggu Verifikasi</span>
        </div>
        <div className="flex justify-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Batalkan & Edit Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batalkan Pengajuan?</DialogTitle>
                <DialogDescription>
                  Data yang sudah diisi tidak akan hilang. Anda bisa
                  melengkapi kembali dan mengajukan ulang.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button type="button" variant="destructive" onClick={handleCancel} disabled={busy}>
                  {busy ? "Memproses..." : "Ya, Batalkan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <form action={handleLogout}>
            <Button type="submit" variant="outline">
              Keluar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
