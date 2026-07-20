"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { createSubject, updateSubject } from "@/actions/academic";
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
import { SubjectForm, type SubjectFormValues } from "./SubjectForm";

interface SubjectDialogProps {
  item?: SubjectFormValues & { id: number };
  classList: { id: number; name: string; code: string }[];
  trigger: ReactNode;
  defaultClassId?: number;
}

export function SubjectDialog({
  item,
  classList,
  trigger,
  defaultClassId,
}: SubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = item !== undefined;

  async function handleSubmit(formData: FormData) {
    const result = isEdit
      ? await updateSubject(String(item!.id), formData)
      : await createSubject(formData);
    if (result && "error" in result) {
      toast({ variant: "destructive", description: result.error });
      return;
    }
    toast({ description: isEdit ? "Mapel diperbarui." : "Mapel ditambahkan." });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit: ${item!.name}` : "Tambah Mata Pelajaran"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <SubjectForm item={item} classList={classList} defaultClassId={isEdit ? undefined : defaultClassId} />
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
