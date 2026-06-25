"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { uploadDocument } from "@/actions/documents";
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
import { DocumentUploadForm } from "./DocumentUploadForm";

interface DocumentUploadDialogProps {
  studentId: string;
  trigger: ReactNode;
}

export function DocumentUploadDialog({
  studentId,
  trigger,
}: DocumentUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    formData.set("studentId", studentId);
    const result = await uploadDocument(formData);
    if (result && "error" in result) {
      toast({ variant: "destructive", description: result.error });
      return;
    }
    toast({ description: "Dokumen berhasil diunggah." });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unggah Dokumen</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <DocumentUploadForm studentId={studentId} />
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit">Unggah</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
