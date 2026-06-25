"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { createStaffAccount, updateStaffAccount } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  StaffAccountForm,
  type StaffAccountFormValues,
} from "./StaffAccountForm";

interface StaffAccountDialogProps {
  item?: StaffAccountFormValues & { id: string };
  roles: { id: number; name: string }[];
  trigger: ReactNode;
}

export function StaffAccountDialog({
  item,
  roles,
  trigger,
}: StaffAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = item !== undefined;

  async function handleSubmit(formData: FormData) {
    const result = isEdit
      ? await updateStaffAccount(item!.id, formData)
      : await createStaffAccount(formData);
    if (result && "error" in result) {
      toast({ variant: "destructive", description: result.error });
      return;
    }
    toast({
      description: isEdit
        ? "Akun staff diperbarui."
        : "Akun staff berhasil ditambahkan.",
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit: ${item!.name}` : "Tambah Akun Staff"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <StaffAccountForm item={item} roles={roles} showPassword={!isEdit} />
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
