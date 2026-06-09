"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PaymentItem = {
  id?: number;
  code: string;
  name: string;
  description: string | null;
  standardPrice: string;
  type: "recurring" | "one_time" | "variable" | null;
  semesterId: number | null;
  isActive: boolean | null;
};

type Semester = {
  id: number;
  name: string;
};

type Props = {
  mode: "create" | "edit";
  item?: PaymentItem;
  semesters: Semester[];
  createAction: (
    formData: FormData
  ) => Promise<{ error?: string } | { success: boolean }>;
  updateAction: (
    itemId: string,
    formData: FormData
  ) => Promise<{ error?: string } | { success: boolean }>;
  trigger: ReactNode;
  children: ReactNode;
};

export function PaymentItemDialog({
  mode,
  item,
  createAction,
  updateAction,
  trigger,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const action =
    mode === "create" ? "Tambah Item Pembayaran" : `Edit: ${item?.name}`;
  const isEdit = mode === "edit";

  async function handleSubmit(formData: FormData) {
    if (isEdit && item?.id) {
      const result = await updateAction(String(item.id), formData);
      if (result && "error" in result) {
        throw new Error(result.error);
      }
    } else {
      const result = await createAction(formData);
      if (result && "error" in result) {
        throw new Error(result.error);
      }
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          {children}
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit">{isEdit ? "Simpan" : "Tambah"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
