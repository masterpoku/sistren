"use client";

import { useState } from "react";
import { transferStudent } from "@/actions/promotion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

interface TransferStudentDialogProps {
  students: { id: string; name: string }[];
  semesters: { id: number; name: string }[];
  classes: { id: number; name: string; code: string }[];
  trigger?: React.ReactNode;
}

export function TransferStudentDialog({
  students,
  semesters,
  classes,
  trigger,
}: TransferStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");

  const [handleTransfer, isPending] = useActionWithToast(
    async () =>
      transferStudent({
        studentId,
        sourceSemesterId: Number(semesterId),
        targetClassId: Number(targetClassId),
      }),
    { successMessage: "Siswa dipindahkan." }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Pindah Kelas</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pindahkan Siswa</DialogTitle>
          <DialogDescription>
            Pindahkan satu siswa ke kelas lain pada semester yang sama.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Siswa</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        </div>
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
            disabled={isPending || !studentId || !semesterId || !targetClassId}
            onClick={async () => {
              await handleTransfer();
              setOpen(false);
            }}
          >
            {isPending ? "Memindahkan..." : "Pindahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
