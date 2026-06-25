"use client";

import { useEffect, useState } from "react";
import { getPromotionPreview, promoteClass } from "@/actions/promotion";
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

interface PromoteClassDialogProps {
  classes: { id: number; name: string }[];
  semesters: { id: number; name: string }[];
}

export function PromoteClassDialog({
  classes,
  semesters,
}: PromoteClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [sourceClassId, setSourceClassId] = useState("");
  const [sourceSemesterId, setSourceSemesterId] = useState("");
  const [targetSemesterId, setTargetSemesterId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  useEffect(() => {
    if (!sourceClassId || !sourceSemesterId) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const result = await getPromotionPreview({
        sourceClassId: Number(sourceClassId),
        sourceSemesterId: Number(sourceSemesterId),
      });
      if (!cancelled && "count" in result && typeof result.count === "number") {
        setPreview(result.count);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceClassId, sourceSemesterId]);

  const [handlePromote, isPending] = useActionWithToast(
    async () =>
      promoteClass({
        sourceClassId: Number(sourceClassId),
        sourceSemesterId: Number(sourceSemesterId),
        targetSemesterId: Number(targetSemesterId),
        targetClassId: Number(targetClassId),
      }),
    { successMessage: "Kelas berhasil dinaikkan." }
  );

  const ready =
    sourceClassId &&
    sourceSemesterId &&
    targetSemesterId &&
    targetClassId &&
    sourceSemesterId !== targetSemesterId &&
    confirmed &&
    preview !== null &&
    preview > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Naik Kelas</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Naik Kelas</DialogTitle>
          <DialogDescription>
            Buat enrollment baru di semester tujuan untuk seluruh siswa aktif.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Kelas Asal</Label>
            <Select value={sourceClassId} onValueChange={setSourceClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Semester Asal</Label>
            <Select
              value={sourceSemesterId}
              onValueChange={setSourceSemesterId}
            >
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
            <Label>Semester Tujuan</Label>
            <Select
              value={targetSemesterId}
              onValueChange={setTargetSemesterId}
            >
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
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {preview !== null && (
            <p className="text-sm text-muted-foreground">
              {preview} siswa akan dinaikkan.
            </p>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="size-4"
            />
            Saya yakin ingin menaikkan kelas ini.
          </label>
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
            disabled={isPending || !ready}
            onClick={async () => {
              await handlePromote();
              setOpen(false);
              setConfirmed(false);
            }}
          >
            {isPending ? "Memproses..." : "Naikkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
