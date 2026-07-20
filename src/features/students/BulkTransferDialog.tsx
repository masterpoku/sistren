"use client";

import { useState } from "react";
import { bulkTransferStudents } from "@/actions/promotion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

interface BulkTransferDialogProps {
  studentIds: string[];
  semesters: { id: number; name: string }[];
  classes: { id: number; name: string; code: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkTransferDialog({
  studentIds,
  semesters,
  classes,
  open,
  onOpenChange,
}: BulkTransferDialogProps) {
  const [semesterId, setSemesterId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [handleTransfer, isPending] = useActionWithToast(
    async () =>
      bulkTransferStudents({
        studentIds,
        sourceSemesterId: Number(semesterId),
        targetClassId: Number(targetClassId),
      }),
    { successMessage: `${studentIds.length} siswa dipindahkan.` }
  );

  const ready =
    studentIds.length > 0 && semesterId && targetClassId && confirmed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pindahkan {studentIds.length} Siswa</DialogTitle>
          <DialogDescription>
            Bulk transfer siswa ke kelas baru. Aksi ini akan mengupdate
            enrollment aktif.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Semester</Label>
            <Select value={semesterId} onValueChange={setSemesterId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Kelas Tujuan</Label>
            <Select value={targetClassId} onValueChange={setTargetClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="size-4"
            />
            Saya yakin ingin memindahkan {studentIds.length} siswa.
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={isPending || !ready}
            onClick={async () => {
              await handleTransfer();
              onOpenChange(false);
              setConfirmed(false);
            }}
          >
            {isPending ? "Memindahkan..." : "Pindahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
