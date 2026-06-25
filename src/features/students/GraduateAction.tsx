"use client";

import { useState } from "react";
import { graduateStudent } from "@/actions/promotion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

interface GraduateActionProps {
  studentId: string;
  semesterId: number;
  studentName: string;
  disabled?: boolean;
}

export function GraduateAction({
  studentId,
  semesterId,
  studentName,
  disabled,
}: GraduateActionProps) {
  const [open, setOpen] = useState(false);

  const [handleGraduate, isPending] = useActionWithToast(
    async () => graduateStudent({ studentId, semesterId }),
    { successMessage: `${studentName} diluluskan.` }
  );

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="default"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Luluskan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Luluskan Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin meluluskan {studentName}? Aksi ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={isPending}
              onClick={async () => {
                await handleGraduate();
                setOpen(false);
              }}
            >
              {isPending ? "Memproses..." : "Luluskan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
