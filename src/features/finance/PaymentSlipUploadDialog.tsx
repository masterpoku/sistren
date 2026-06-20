"use client";

import { useRef, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PaymentSlipUploadDialogProps {
  paymentId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function PaymentSlipUploadDialog({
  paymentId,
  onSuccess,
  trigger,
}: PaymentSlipUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function handleSubmit(formData: FormData) {
    if (!selectedFile) {
      toast({ variant: "destructive", description: "Pilih file terlebih dahulu." });
      return;
    }
    formData.set("file", selectedFile);
    startTransition(async () => {
      const { uploadPaymentSlip } = await import("@/actions/payments");
      const result = await uploadPaymentSlip(formData);
      if ("error" in result) {
        toast({ variant: "destructive", description: result.error ?? "Gagal mengunggah" });
        return;
      }
      setOpen(false);
      setSelectedFile(null);
      toast({ description: "Bukti bayar berhasil diunggah." });
      onSuccess?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button">
            Upload Bukti Bayar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="paymentId" value={paymentId} />
          <DialogHeader>
            <DialogTitle>Upload Bukti Bayar</DialogTitle>
            <DialogDescription>
              Unggah foto atau PDF bukti transfer. Maksimal 5MB. Format: JPG, PNG, GIF, WebP, PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full h-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors text-sm text-muted-foreground"
            >
              {selectedFile ? selectedFile.name : "Klik untuk pilih file"}
            </button>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedFile}
            >
              {isPending ? "Mengunggah..." : "Unggah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
