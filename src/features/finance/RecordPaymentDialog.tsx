"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecordPaymentForm } from "./RecordPaymentForm";

interface RecordPaymentDialogProps {
  students: { id: string; name: string; email: string }[];
  paymentItems: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    standardPrice: string;
  }[];
  recordAction: (
    formData: FormData
  ) => Promise<{ error?: string } | { success: boolean }>;
  trigger: ReactNode;
}

export function RecordPaymentDialog({
  students,
  paymentItems,
  recordAction,
  trigger,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Catat Pembayaran</DialogTitle>
        </DialogHeader>
        <RecordPaymentForm
          students={students}
          paymentItems={paymentItems}
          recordAction={async (formData) => {
            const result = await recordAction(formData);
            if (result && "error" in result && result.error) {
              return result;
            }
            setOpen(false);
            router.refresh();
            return { success: true };
          }}
        />
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
