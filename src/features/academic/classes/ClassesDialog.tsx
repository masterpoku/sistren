"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { createClass, updateClass } from "@/actions/academic";
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
import { ClassesForm, type ClassesFormValues } from "./ClassesForm";

interface ClassesDialogProps {
  item?: ClassesFormValues & { id: number };
  trigger: ReactNode;
}

export function ClassesDialog({ item, trigger }: ClassesDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = item !== undefined;

  async function handleSubmit(formData: FormData) {
    const result = isEdit
      ? await updateClass(String(item!.id), formData)
      : await createClass(formData);
    if (result && "error" in result) {
      toast({ variant: "destructive", description: result.error });
      return;
    }
    toast({ description: isEdit ? "Kelas diperbarui." : "Kelas ditambahkan." });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit: ${item!.name}` : "Tambah Kelas"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <ClassesForm item={item} />
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
