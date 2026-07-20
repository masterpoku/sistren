"use client";

import { useCallback, useEffect, useState } from "react";
import { FloppyDisk, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getGradeInputSubjects, getGradeInputTable, bulkUpsertGrades } from "@/actions/grades";

type ClassItem = { id: number; name: string; code: string; majorName: string | null };
type SemesterItem = { id: number; name: string; academicYear: string };

type EditableCell = { value: string; dirty: boolean };

type RowData = {
  studentId: string;
  studentName: string;
  cells: Record<string, EditableCell>;
};

const tpFields = [
  "dailyTest1", "dailyTest2", "dailyTest3", "dailyTest4",
  "dailyTest5", "dailyTest6", "dailyTest7", "dailyTest8",
  "dailyTest9", "dailyTest10",
];

const sumatifFields = ["midterm", "finalExam"];

const allFields = [...tpFields, ...sumatifFields];

const fieldLabels: Record<string, string> = {
  dailyTest1: "TP1", dailyTest2: "TP2", dailyTest3: "TP3", dailyTest4: "TP4",
  dailyTest5: "TP5", dailyTest6: "TP6", dailyTest7: "TP7", dailyTest8: "TP8",
  dailyTest9: "TP9", dailyTest10: "TP10",
  midterm: "Tes",
  finalExam: "Non Tes",
};

function initCells(existing: Record<string, any> | null): Record<string, EditableCell> {
  const cells: Record<string, EditableCell> = {};
  for (const f of allFields) {
    cells[f] = { value: existing?.[f] ?? "", dirty: false };
  }
  return cells;
}

function calcScore(cells: Record<string, EditableCell>): string {
  const vals = allFields
    .map((f) => {
      const n = Number(cells[f]?.value);
      return Number.isNaN(n) || cells[f]?.value === "" ? null : n;
    })
    .filter((n): n is number => n !== null);
  if (vals.length === 0) return "";
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

export function GradeInputClient({
  userClasses,
  semesters,
  defaultClassId,
  userId: _userId,
}: {
  userClasses: ClassItem[];
  semesters: SemesterItem[];
  defaultClassId?: number;
  userId: string;
}) {
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get("classId");
  const urlSemesterId = searchParams.get("semesterId");
  const urlSubjectId = searchParams.get("subjectId");

  const [selectedClassId, setSelectedClassId] = useState(
    urlClassId ?? defaultClassId?.toString() ?? ""
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    urlSemesterId ?? ""
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    urlSubjectId ?? ""
  );

  const [subjects, setSubjects] = useState<{ id: number; name: string; code: string | null }[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (urlClassId) setSelectedClassId(urlClassId);
    if (urlSemesterId) setSelectedSemesterId(urlSemesterId);
    if (urlSubjectId) setSelectedSubjectId(urlSubjectId);
  }, [urlClassId, urlSemesterId, urlSubjectId]);

  const activeSemester = semesters.find((s) => s.id === 1);
  useEffect(() => {
    if (!selectedSemesterId && activeSemester) {
      setSelectedSemesterId(activeSemester.id.toString());
    }
  }, [activeSemester, selectedSemesterId]);

  const loadSubjects = useCallback(async (classId: number, semesterId: number) => {
    setSubjects([]);
    setSelectedSubjectId("");
    setRows([]);
    const data = await getGradeInputSubjects(classId, semesterId);
    setSubjects(data);
  }, []);

  const loadTable = useCallback(async (classId: number, subjectId: number, semesterId: number) => {
    setLoading(true);
    setMessage(null);
    const data = await getGradeInputTable(classId, subjectId, semesterId);
    const mapped: RowData[] = data.rows.map((r: any) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      cells: initCells(r.existing),
    }));
    setRows(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSemesterId) {
      loadSubjects(Number(selectedClassId), Number(selectedSemesterId));
    }
  }, [selectedClassId, selectedSemesterId, loadSubjects]);

  useEffect(() => {
    if (selectedClassId && selectedSemesterId && selectedSubjectId) {
      loadTable(Number(selectedClassId), Number(selectedSubjectId), Number(selectedSemesterId));
    } else {
      setRows([]);
    }
  }, [selectedClassId, selectedSemesterId, selectedSubjectId, loadTable]);

  function updateCell(studentIdx: number, field: string, value: string) {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[studentIdx] };
      const cells = { ...row.cells };
      cells[field] = { value, dirty: true };
      row.cells = cells;
      next[studentIdx] = row;
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const payload: any[] = [];
    const classId = Number(selectedClassId);
    const semesterId = Number(selectedSemesterId);
    const subjectId = Number(selectedSubjectId);

    for (const row of rows) {
      const cells = row.cells;
      const hasValue = Object.values(cells).some((c) => c.value !== "");
      if (!hasValue) continue;

      const entry: Record<string, any> = {
        studentId: row.studentId,
        classId,
        semesterId,
        subjectId,
        type: "knowledge",
      };
      for (const f of allFields) {
        if (cells[f]?.value) entry[f] = cells[f].value;
      }
      payload.push(entry);
    }

    if (payload.length === 0) {
      setMessage({ type: "error", text: "Tidak ada data nilai untuk disimpan." });
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.set("rows", JSON.stringify(payload));
    const result = await bulkUpsertGrades(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: `Berhasil menyimpan ${result.count} nilai.` });
      loadTable(classId, subjectId, semesterId);
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href="/academic">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Input Nilai</h1>
          <p className="text-muted-foreground">
            Kelola nilai siswa per mata pelajaran.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filter</CardTitle>
          <CardDescription>Pilih kelas, semester, dan mata pelajaran.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kelas</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {userClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Semester</label>
              <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} {s.academicYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mata Pelajaran</label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={subjects.length === 0}
              >
                <SelectTrigger className="w-56">
                  <SelectValue
                    placeholder={
                      subjects.length === 0 ? "Tidak ada mapel" : "Pilih mapel"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
              : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : rows.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Nilai</CardTitle>
                <CardDescription>
                  {rows.length} siswa · Nilai dihitung otomatis rata-rata
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <FloppyDisk className="size-4 mr-1" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-2 py-2 w-8" rowSpan={2}>No</th>
                  <th className="px-2 py-2" rowSpan={2}>Nama</th>
                  <th className="px-1 py-2 text-center border-x" colSpan={10}>
                    FORMATIF
                  </th>
                  <th className="px-1 py-2 text-center border-x" colSpan={2}>
                    SUMATIF AKHIR LINGKUP MATERI
                  </th>
                  <th className="px-2 py-2 text-center w-16" rowSpan={2}>Nilai</th>
                </tr>
                <tr className="border-b">
                  {tpFields.map((f) => (
                    <th key={f} className="px-1 py-1 text-center w-14 text-xs font-normal">
                      {fieldLabels[f]}
                    </th>
                  ))}
                  {sumatifFields.map((f) => (
                    <th key={f} className="px-1 py-1 text-center w-16 text-xs font-normal">
                      {fieldLabels[f]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.studentId} className="border-b hover:bg-muted/50">
                    <td className="px-2 py-1">{idx + 1}</td>
                    <td className="px-2 py-1 font-medium">{row.studentName}</td>
                    {allFields.map((f) => (
                      <td key={f} className="px-1 py-1">
                        <Input
                          className="h-8 w-14 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          value={row.cells[f]?.value ?? ""}
                          onChange={(e) => updateCell(idx, f, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-bold font-mono tabular-nums">
                      {calcScore(row.cells) || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : selectedSubjectId ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Tidak ada siswa ditemukan.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
