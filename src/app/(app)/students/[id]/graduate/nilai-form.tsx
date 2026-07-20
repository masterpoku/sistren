"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pindahKelas, saveStudentGrades } from "@/actions/promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type GradeData = {
  dailyTest1: string | null;
  dailyTest2: string | null;
  dailyTest3: string | null;
  dailyTest4: string | null;
  dailyTest5: string | null;
  dailyTest6: string | null;
  dailyTest7: string | null;
  dailyTest8: string | null;
  dailyTest9: string | null;
  dailyTest10: string | null;
  midterm: string | null;
  finalExam: string | null;
  score: string | null;
} | null;

type SubjectItem = {
  id: number;
  name: string;
  code: string | null;
  grades: GradeData;
};

type ClassItem = { id: number; name: string; code: string };
type SemesterItem = {
  id: number;
  name: string;
  academicYear: string;
  isActive: number | boolean | null;
};

interface Props {
  studentId: string;
  semesterId: number;
  classId: number;
  subjects: SubjectItem[];
  classes: ClassItem[];
  semesters: SemesterItem[];
}

const DAILY_FIELDS = [
  "dailyTest1",
  "dailyTest2",
  "dailyTest3",
  "dailyTest4",
  "dailyTest5",
  "dailyTest6",
  "dailyTest7",
  "dailyTest8",
  "dailyTest9",
  "dailyTest10",
] as const;

function computeScore(g: Record<string, string>) {
  const vals: number[] = [];
  for (const f of DAILY_FIELDS) {
    const v = parseFloat(g[f] ?? "");
    if (!Number.isNaN(v)) vals.push(v);
  }
  const mt = parseFloat(g.midterm ?? "");
  if (!Number.isNaN(mt)) vals.push(mt);
  const fe = parseFloat(g.finalExam ?? "");
  if (!Number.isNaN(fe)) vals.push(fe);

  if (vals.length === 0) return "0.0";
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return avg.toFixed(1);
}

export function NilaiForm({
  studentId,
  semesterId,
  classId,
  subjects,
  classes,
  semesters: allSemesters,
}: Props) {
  const router = useRouter();
  const [edited, setEdited] = useState<
    Record<number, Record<string, string>>
  >({});
  const [busy, setBusy] = useState(false);

  // Pindah kelas dialog
  const [pkOpen, setPkOpen] = useState(false);
  const [pkBusy, setPkBusy] = useState(false);
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSemesterId, setTargetSemesterId] = useState("");

  function getVal(subjectId: number, field: string): string {
    return edited[subjectId]?.[field] ?? "";
  }

  function setVal(subjectId: number, field: string, value: string) {
    setEdited((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], [field]: value },
    }));
  }

  function getGradeRow(subjectId: number) {
    const base = (subjects.find((s) => s.id === subjectId)?.grades ??
      {}) as Record<string, string | null>;
    return {
      dailyTest1: getVal(subjectId, "dailyTest1") || base.dailyTest1 || "",
      dailyTest2: getVal(subjectId, "dailyTest2") || base.dailyTest2 || "",
      dailyTest3: getVal(subjectId, "dailyTest3") || base.dailyTest3 || "",
      dailyTest4: getVal(subjectId, "dailyTest4") || base.dailyTest4 || "",
      dailyTest5: getVal(subjectId, "dailyTest5") || base.dailyTest5 || "",
      dailyTest6: getVal(subjectId, "dailyTest6") || base.dailyTest6 || "",
      dailyTest7: getVal(subjectId, "dailyTest7") || base.dailyTest7 || "",
      dailyTest8: getVal(subjectId, "dailyTest8") || base.dailyTest8 || "",
      dailyTest9: getVal(subjectId, "dailyTest9") || base.dailyTest9 || "",
      dailyTest10: getVal(subjectId, "dailyTest10") || base.dailyTest10 || "",
      midterm: getVal(subjectId, "midterm") || base.midterm || "",
      finalExam: getVal(subjectId, "finalExam") || base.finalExam || "",
    };
  }

  function buildPayload() {
    return subjects.map((s) => {
      const row = getGradeRow(s.id);
      const score = computeScore(row);
      return {
        subjectId: s.id,
        dailyTest1: row.dailyTest1 || undefined,
        dailyTest2: row.dailyTest2 || undefined,
        dailyTest3: row.dailyTest3 || undefined,
        dailyTest4: row.dailyTest4 || undefined,
        dailyTest5: row.dailyTest5 || undefined,
        dailyTest6: row.dailyTest6 || undefined,
        dailyTest7: row.dailyTest7 || undefined,
        dailyTest8: row.dailyTest8 || undefined,
        dailyTest9: row.dailyTest9 || undefined,
        dailyTest10: row.dailyTest10 || undefined,
        midterm: row.midterm || undefined,
        finalExam: row.finalExam || undefined,
        score,
      };
    });
  }

  async function handleSave() {
    setBusy(true);
    const payload = buildPayload();
    const result = await saveStudentGrades(
      studentId,
      classId,
      semesterId,
      payload
    );
    setBusy(false);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    alert("Nilai berhasil disimpan.");
  }

  async function handlePindahKelas() {
    if (!targetClassId || !targetSemesterId) return;
    setPkBusy(true);

    // Save grades first
    const payload = buildPayload();
    const saveResult = await saveStudentGrades(
      studentId,
      classId,
      semesterId,
      payload
    );
    if ("error" in saveResult) {
      alert(saveResult.error);
      setPkBusy(false);
      return;
    }

    const result = await pindahKelas(
      studentId,
      semesterId,
      Number(targetClassId),
      Number(targetSemesterId)
    );
    setPkBusy(false);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    router.push("/students/manage-class");
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mapel</TableHead>
              {DAILY_FIELDS.map((_, i) => (
                <TableHead
                  key={i}
                  className="text-center w-[60px]"
                >
                  TP{i + 1}
                </TableHead>
              ))}
              <TableHead className="text-center w-[60px]">
                Sumatif Tes
              </TableHead>
              <TableHead className="text-center w-[60px]">
                Sumatif Non Tes
              </TableHead>
              <TableHead className="text-center w-[60px]">Akhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((s) => {
              const row = getGradeRow(s.id);
              const finalScore = computeScore(row);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {s.name}
                    {s.code && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({s.code})
                      </span>
                    )}
                  </TableCell>
                  {DAILY_FIELDS.map((f) => (
                    <TableCell key={f}>
                      <Input
                        className="w-[60px] text-center h-8"
                        value={(row as Record<string, string>)[f]}
                        onChange={(e) => setVal(s.id, f, e.target.value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Input
                      className="w-[60px] text-center h-8"
                      value={row.midterm}
                      onChange={(e) =>
                        setVal(s.id, "midterm", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-[60px] text-center h-8"
                      value={row.finalExam}
                      onChange={(e) =>
                        setVal(s.id, "finalExam", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {finalScore}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            disabled={busy}
            onClick={handleSave}
          >
            {busy ? "Menyimpan..." : "Simpan"}
          </Button>
          <Dialog open={pkOpen} onOpenChange={setPkOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary">
                Pindah Kelas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pindah Kelas</DialogTitle>
                <DialogDescription>
                  Pilih kelas dan semester tujuan. Nilai akan disimpan otomatis
                  sebelum pindah kelas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kelas Tujuan</label>
                  <Select
                    value={targetClassId}
                    onValueChange={setTargetClassId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester Tujuan</label>
                  <Select
                    value={targetSemesterId}
                    onValueChange={setTargetSemesterId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSemesters.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} ({s.academicYear})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPkOpen(false)}>
                  Batal
                </Button>
                <Button
                  variant="default"
                  disabled={pkBusy || !targetClassId || !targetSemesterId}
                  onClick={handlePindahKelas}
                >
                  {pkBusy ? "Memproses..." : "Konfirmasi Pindah Kelas"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
