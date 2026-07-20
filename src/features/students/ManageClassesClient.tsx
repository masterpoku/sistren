"use client";

import { ArrowRight, User, Users, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { getStudentsByClass } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

type ClassItem = {
  id: number;
  name: string;
  code: string;
  studentCount: number;
};

type StudentItem = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  semesterId: number;
};

interface ManageClassesClientProps {
  classes: ClassItem[];
  unassignedCount: number;
}

export function ManageClassesClient({
  classes,
  unassignedCount,
}: ManageClassesClientProps) {
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openClass(cls: ClassItem) {
    setSelectedClass(cls);
    setLoading(true);
    setError(null);
    const result = await getStudentsByClass(cls.id);
    setLoading(false);
    if ("error" in result) {
      setError(result.error ?? null);
      setStudents([]);
    } else {
      setStudents(result.students);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Management Kelas Siswa</h1>
      </div>

      {!selectedClass && (
        <div className="flex items-center gap-3">
          <Card className="flex-1 border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 py-4">
              <WarningCircle className="size-5 shrink-0 text-yellow-700" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Siswa Belum Punya Kelas
                </p>
                <p className="text-xs text-yellow-700">
                  {unassignedCount} siswa terverifikasi belum masuk kelas
                </p>
              </div>
            </CardContent>
          </Card>
          <Link href="/students/manage-class/unassigned">
            <Button type="button" size="sm">
              Kelola
            </Button>
          </Link>
        </div>
      )}

      {selectedClass ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedClass(null);
                setStudents([]);
              }}
            >
              &larr; Kembali
            </Button>
            <h2 className="text-xl font-semibold">
              Kelas {selectedClass.code}
            </h2>
            <Badge variant="secondary">{students.length} siswa</Badge>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Belum ada siswa di kelas ini.
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.enrollmentId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{s.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.studentEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MoveStudentDialog
                      studentId={s.studentId}
                      studentName={s.studentName}
                      currentClassId={selectedClass.id}
                      currentSemesterId={s.semesterId}
                      allClasses={classes}
                      onMoved={() => openClass(selectedClass)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openClass(c)}
              className="text-left transition-all hover:scale-[1.02]"
            >
              <Card className="cursor-pointer hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">{c.code}</CardTitle>
                  <CardDescription>{c.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    <span>{c.studentCount} siswa aktif</span>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MoveStudentDialog({
  studentId,
  studentName,
  currentClassId,
  currentSemesterId,
  allClasses,
  onMoved,
}: {
  studentId: string;
  studentName: string;
  currentClassId: number;
  currentSemesterId: number;
  allClasses: ClassItem[];
  onMoved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState<string>("");
  const [targetSemesterId, setTargetSemesterId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function handleMove() {
    if (!targetClassId || !targetSemesterId) return;
    setBusy(true);
    const { pindahKelas } = await import("@/actions/promotion");
    const result = await pindahKelas(
      studentId,
      currentSemesterId,
      Number(targetClassId),
      Number(targetSemesterId)
    );
    setBusy(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Siswa berhasil dipindahkan");
    setOpen(false);
    setTargetClassId("");
    setTargetSemesterId("");
    onMoved();
  }

  const otherClasses = allClasses.filter((c) => c.id !== currentClassId);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setTargetClassId("");
          setTargetSemesterId("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <ArrowRight className="size-4 mr-1" />
          Pindah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pindah Kelas</DialogTitle>
          <DialogDescription>
            Pindahkan <span className="font-medium">{studentName}</span> ke kelas lain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kelas Tujuan</label>
            <Select value={targetClassId} onValueChange={setTargetClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {otherClasses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Semester Tujuan</label>
            <Select value={targetSemesterId} onValueChange={setTargetSemesterId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(currentSemesterId)}>
                  Semester Saat Ini
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={!targetClassId || !targetSemesterId || busy}
          >
            {busy ? "Memproses..." : "Pindahkan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
