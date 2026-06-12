"use client";

import { useEffect, useState } from "react";
import { bulkUpsertGrades, getGrades } from "@/actions/grades";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableShell } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type ClassItem = { id: number; name: string; code: string };
type SubjectItem = { id: number; name: string; code: string | null };
type SemesterItem = {
  id: number;
  name: string;
  academicYear: string;
  isActive: boolean | null;
};

type GradeRow = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
  score: string;
  grade: string;
  predicate: string;
  dailyTest1: string;
  dailyTest2: string;
  dailyTest3: string;
  dailyTest4: string;
  midterm: string;
  finalExam: string;
  practical: string;
  project: string;
  portfolio: string;
};

type Props = {
  classes: ClassItem[];
  subjects: SubjectItem[];
  semesters: SemesterItem[];
  roleLevel: number;
  assignedSubjectIds?: number[];
};

export function GradesClient({
  classes,
  subjects,
  semesters,
  roleLevel,
  assignedSubjectIds,
}: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [editedRows, setEditedRows] = useState<
    Record<number, Partial<GradeRow>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isTeacher = roleLevel === 60;
  const filteredSubjects =
    isTeacher && assignedSubjectIds
      ? subjects.filter((s) => assignedSubjectIds.includes(s.id))
      : subjects;

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedSemester) {
      loadGrades();
    }
  }, [selectedClass, selectedSubject, selectedSemester, loadGrades]);

  async function loadGrades() {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await getGrades(
        Number(selectedClass),
        Number(selectedSubject),
        Number(selectedSemester)
      );
      if (Array.isArray(result)) {
        setRows(
          result.map((r) => ({
            enrollmentId: r.enrollmentId,
            studentId: r.studentId,
            studentName: r.studentName,
            score: r.score ?? "",
            grade: r.grade ?? "",
            predicate: r.predicate ?? "",
            dailyTest1: r.dailyTest1 ?? "",
            dailyTest2: r.dailyTest2 ?? "",
            dailyTest3: r.dailyTest3 ?? "",
            dailyTest4: r.dailyTest4 ?? "",
            midterm: r.midterm ?? "",
            finalExam: r.finalExam ?? "",
            practical: r.practical ?? "",
            project: r.project ?? "",
            portfolio: r.portfolio ?? "",
          }))
        );
      } else {
        setRows([]);
      }
    } catch {
      setMessage({ type: "error", text: "Gagal memuat nilai." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleScoreChange(
    enrollmentId: number,
    field: keyof GradeRow,
    value: string
  ) {
    setEditedRows((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value },
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const grades = rows.map((row) => {
        const edited = editedRows[row.enrollmentId] ?? {};
        return {
          enrollmentId: row.enrollmentId,
          studentId: row.studentId,
          dailyTest1: String(edited.dailyTest1 ?? row.dailyTest1 ?? ""),
          dailyTest2: String(edited.dailyTest2 ?? row.dailyTest2 ?? ""),
          dailyTest3: String(edited.dailyTest3 ?? row.dailyTest3 ?? ""),
          dailyTest4: String(edited.dailyTest4 ?? row.dailyTest4 ?? ""),
          midterm: String(edited.midterm ?? row.midterm ?? ""),
          finalExam: String(edited.finalExam ?? row.finalExam ?? ""),
          practical: String(edited.practical ?? row.practical ?? ""),
          project: String(edited.project ?? row.project ?? ""),
          portfolio: String(edited.portfolio ?? row.portfolio ?? ""),
        };
      });
      const fd = new FormData();
      fd.set("rows", JSON.stringify(grades));
      const result = await bulkUpsertGrades(fd);
      if (result && "error" in result) {
        setMessage({ type: "error", text: result.error as string });
      } else {
        setMessage({ type: "success", text: "Nilai berhasil disimpan." });
        setEditedRows({});
        loadGrades();
      }
    } catch {
      setMessage({ type: "error", text: "Gagal menyimpan nilai." });
    } finally {
      setIsSaving(false);
    }
  }

  function computeScore(row: GradeRow): string {
    const edited = editedRows[row.enrollmentId] ?? {};
    const d1 = parseFloat(String(edited.dailyTest1 ?? row.dailyTest1)) || 0;
    const d2 = parseFloat(String(edited.dailyTest2 ?? row.dailyTest2)) || 0;
    const d3 = parseFloat(String(edited.dailyTest3 ?? row.dailyTest3)) || 0;
    const d4 = parseFloat(String(edited.dailyTest4 ?? row.dailyTest4)) || 0;
    const mt = parseFloat(String(edited.midterm ?? row.midterm)) || 0;
    const fe = parseFloat(String(edited.finalExam ?? row.finalExam)) || 0;
    const pr = parseFloat(String(edited.practical ?? row.practical)) || 0;
    const pj = parseFloat(String(edited.project ?? row.project)) || 0;
    const po = parseFloat(String(edited.portfolio ?? row.portfolio)) || 0;

    const dailyAvg = (d1 + d2 + d3 + d4) / 4;
    const knowledgeScore = dailyAvg * 0.4 + mt * 0.3 + fe * 0.3;
    const skillScore = pr * 0.4 + pj * 0.3 + po * 0.3;
    const finalScore = knowledgeScore * 0.5 + skillScore * 0.5;
    return finalScore.toFixed(1);
  }

  function computePredicate(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[180px]">
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
            <div className="space-y-2">
              <Label>Mapel</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih mapel" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject && selectedSemester && (
        <DataTableShell
          toolbar={
            <>
              <div className="flex flex-1 items-center gap-2">
                {message && (
                  <p
                    className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}
                  >
                    {message.text}
                  </p>
                )}
                {!message && (
                  <p className="text-sm text-muted-foreground">
                    {isLoading
                      ? "Memuat..."
                      : `${rows.length} siswa`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || Object.keys(editedRows).length === 0}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </div>
            </>
          }
          footer={
            <div className="flex-1 text-sm text-muted-foreground">
              Daftar Nilai
            </div>
          }
        >
          {isLoading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Memuat...
            </p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Tidak ada data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">No</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="text-center">Harian 1</TableHead>
                    <TableHead className="text-center">Harian 2</TableHead>
                    <TableHead className="text-center">Harian 3</TableHead>
                    <TableHead className="text-center">Harian 4</TableHead>
                    <TableHead className="text-center">UTS</TableHead>
                    <TableHead className="text-center">UAS</TableHead>
                    <TableHead className="text-center">Praktek</TableHead>
                    <TableHead className="text-center">Projek</TableHead>
                    <TableHead className="text-center">Porto</TableHead>
                    <TableHead className="text-center">Akhir</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => {
                    const score = computeScore(row);
                    const grade = computePredicate(parseFloat(score));
                    const edited = editedRows[row.enrollmentId];
                    return (
                      <TableRow key={row.enrollmentId}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {row.studentName}
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.dailyTest1 ?? row.dailyTest1}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "dailyTest1",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.dailyTest2 ?? row.dailyTest2}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "dailyTest2",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.dailyTest3 ?? row.dailyTest3}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "dailyTest3",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.dailyTest4 ?? row.dailyTest4}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "dailyTest4",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.midterm ?? row.midterm}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "midterm",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.finalExam ?? row.finalExam}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "finalExam",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.practical ?? row.practical}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "practical",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.project ?? row.project}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "project",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-[60px] text-center"
                            value={edited?.portfolio ?? row.portfolio}
                            onChange={(e) =>
                              handleScoreChange(
                                row.enrollmentId,
                                "portfolio",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {score}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {grade}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableShell>
      )}
    </div>
  );
}
