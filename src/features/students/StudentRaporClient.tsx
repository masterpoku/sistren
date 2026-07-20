"use client";

import { ArrowLeft, Pencil } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

type GradeRow = {
  id: number;
  studentId: string;
  classId: number;
  semesterId: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string | null;
  subjectCredits: number | null;
  type: "knowledge" | "skill" | "attitude" | "extracurricular";
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
  semesterName: string;
  semesterYear: string;
  classCode: string;
};

type StudentInfo = { id: string; name: string; email: string; nisn: string | null };
type ClassInfo = { id: number; name: string; code: string; majorName: string | null };
type Semester = { id: number; name: string; academicYear: string };

const tpFields = [
  "dailyTest1", "dailyTest2", "dailyTest3", "dailyTest4",
  "dailyTest5", "dailyTest6", "dailyTest7", "dailyTest8",
  "dailyTest9", "dailyTest10",
];
const sumatifFields = ["midterm", "finalExam"];

const fieldLabels: Record<string, string> = {
  dailyTest1: "TP1", dailyTest2: "TP2", dailyTest3: "TP3", dailyTest4: "TP4",
  dailyTest5: "TP5", dailyTest6: "TP6", dailyTest7: "TP7", dailyTest8: "TP8",
  dailyTest9: "TP9", dailyTest10: "TP10",
  midterm: "Tes",
  finalExam: "Non Tes",
};

function GradeCell({ value }: { value: string | null }) {
  return (
    <TableCell className="text-center font-mono tabular-nums">
      {value !== null ? value : "-"}
    </TableCell>
  );
}

export function StudentRaporClient({
  studentInfo,
  classInfo,
  grades,
  semesters,
  currentSemesterId,
  canEdit = false,
  subjectList = [],
}: {
  studentInfo: StudentInfo;
  classInfo: ClassInfo;
  grades: GradeRow[];
  semesters: Semester[];
  currentSemesterId: string;
  canEdit?: boolean;
  subjectList?: { id: number; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSemesterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("semesterId", value);
    router.replace(
      `/students/class/${classInfo.id}/${studentInfo.id}/rapor?${params.toString()}`
    );
  }

  const activeSemester = semesters.find((s) => s.id.toString() === currentSemesterId);
  const semesterName = activeSemester
    ? `${activeSemester.name} ${activeSemester.academicYear}`
    : "";

  const grouped = grades.reduce<Record<string, GradeRow[]>>((acc, g) => {
    if (!acc[g.subjectName]) acc[g.subjectName] = [];
    acc[g.subjectName].push(g);
    return acc;
  }, {});

  const [editSubjectId, setEditSubjectId] = useState(
    subjectList[0]?.id.toString() ?? ""
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href={`/students/class/${classInfo.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{studentInfo.name}</h1>
          <p className="text-muted-foreground">
            {classInfo.code} · {classInfo.majorName ?? "Umum"}
            {studentInfo.nisn ? ` · NISN ${studentInfo.nisn}` : ""}
          </p>
        </div>
        <Select value={currentSemesterId} onValueChange={handleSemesterChange}>
          <SelectTrigger className="w-56">
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

      <div className="flex items-center justify-between">
        {semesterName && (
          <p className="text-sm text-muted-foreground">
            Laporan hasil belajar &mdash; Semester {semesterName}
          </p>
        )}
        {canEdit && currentSemesterId && subjectList.length > 0 && (
          <div className="flex items-center gap-2">
            <Select value={editSubjectId} onValueChange={setEditSubjectId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih mapel" />
              </SelectTrigger>
              <SelectContent>
                {subjectList.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link
              href={`/academic/grades?classId=${classInfo.id}&subjectId=${editSubjectId}&semesterId=${currentSemesterId}`}
            >
              <Button size="sm" variant="outline">
                <Pencil className="size-4 mr-1" />
                Input Nilai
              </Button>
            </Link>
          </div>
        )}
      </div>

      {grades.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <p className="text-lg">Belum ada nilai</p>
          <p className="text-sm">Nilai untuk semester ini belum dimasukkan.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">No</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="text-center border-x" colSpan={10}>
                  FORMATIF
                </TableHead>
                <TableHead className="text-center border-x" colSpan={2}>
                  SUMATIF AKHIR LINGKUP MATERI
                </TableHead>
                <TableHead className="text-center font-bold">Nilai</TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                <TableHead></TableHead>
                {tpFields.map((f) => (
                  <TableHead key={f} className="text-center text-xs font-normal w-14">
                    {fieldLabels[f]}
                  </TableHead>
                ))}
                {sumatifFields.map((f) => (
                  <TableHead key={f} className="text-center text-xs font-normal w-16">
                    {fieldLabels[f]}
                  </TableHead>
                ))}
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(grouped).map(([subjectName, rows], idx) => {
                const g = rows[0];
                return (
                  <TableRow key={g.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{subjectName}</TableCell>
                    {tpFields.map((f) => (
                      <GradeCell key={f} value={(g as any)[f]} />
                    ))}
                    {sumatifFields.map((f) => (
                      <GradeCell key={f} value={(g as any)[f]} />
                    ))}
                    <TableCell className="text-center font-bold font-mono tabular-nums">
                      {g.score !== null ? g.score : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
