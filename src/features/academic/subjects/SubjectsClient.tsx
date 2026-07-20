"use client";

import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteSubject } from "@/actions/academic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubjectDialog } from "@/features/academic/subjects/SubjectDialog";

type SubjectItem = {
  id: number;
  name: string;
  code: string | null;
  classId: number | null;
  credits: number | null;
  className: string | null;
  classCode: string | null;
};

interface SubjectsClientProps {
  data: SubjectItem[];
  classList: { id: number; name: string; code: string }[];
}

function DeleteConfirm({
  item,
  onDeleted,
}: {
  item: SubjectItem;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const result = await deleteSubject(String(item.id));
    setBusy(false);
    if (result && "error" in result) {
      alert(result.error);
      return;
    }
    setOpen(false);
    onDeleted();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Mapel</DialogTitle>
          <DialogDescription>
            Yakin ingin menghapus <strong>{item.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={handleDelete}
          >
            {busy ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubjectsClient({ data, classList }: SubjectsClientProps) {
  const router = useRouter();

  const grouped: Record<string, { class: typeof classList[0]; subjects: SubjectItem[] }> = {};

  for (const cls of classList) {
    grouped[cls.code] = { class: cls, subjects: [] };
  }

  for (const s of data) {
    const key = s.classCode ?? "Lainnya";
    if (!grouped[key]) {
      grouped[key] = {
        class: { id: s.classId ?? 0, name: s.className ?? key, code: key },
        subjects: [],
      };
    }
    grouped[key].subjects.push(s);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kelola Mata Pelajaran
          </h1>
          <p className="text-muted-foreground">
            Tambah dan kelola mata pelajaran per kelas.
          </p>
        </div>
        <SubjectDialog
          classList={classList}
          trigger={
            <Button type="button">
              <Plus className="size-4 mr-1" />
              Tambah Mapel
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([key, group]) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{key}</CardTitle>
                <SubjectDialog
                  defaultClassId={group.class.id}
                  classList={classList}
                  trigger={
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Tambah mapel"
                    >
                      <Plus className="size-4" />
                    </button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {group.subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Belum ada mapel
                </p>
              ) : (
                <div className="space-y-1">
                  {group.subjects.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.code ?? "-"} · {s.credits ?? 0} SKS
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <SubjectDialog
                          item={{
                            id: s.id,
                            name: s.name,
                            code: s.code,
                            classId: s.classId,
                            credits: s.credits,
                          }}
                          classList={classList}
                          trigger={
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <PencilSimple className="size-4" />
                            </button>
                          }
                        />
                        <DeleteConfirm
                          item={s}
                          onDeleted={() => router.refresh()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
