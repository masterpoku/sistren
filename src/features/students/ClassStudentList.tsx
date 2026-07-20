"use client";

import { ArrowLeft, FileText } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClassInfo = {
  id: number;
  name: string;
  code: string;
  majorName: string | null;
  capacity: number | null;
};

type Student = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  semesterId: number | null;
};

type Semester = {
  id: number;
  name: string;
  academicYear: string;
};

export function ClassStudentList({
  classInfo,
  students,
  semesters,
}: {
  classInfo: ClassInfo;
  students: Student[];
  semesters: Semester[];
}) {
  const [selectedSemester, setSelectedSemester] = useState(
    semesters.find((s) => s.id === 1)?.id.toString() ?? ""
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {classInfo.code}
          </h1>
          <p className="text-muted-foreground">
            {classInfo.majorName ?? "Umum"} · Kelas {classInfo.name}
            {classInfo.capacity
              ? ` (${students.length}/${classInfo.capacity})`
              : ""}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>
                {students.length} siswa terdaftar
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Semester:</span>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {students.map((s, i) => (
              <div
                key={s.enrollmentId}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{s.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.studentEmail}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/students/class/${classInfo.id}/${s.studentId}/rapor?semesterId=${selectedSemester}`}
                >
                  <Button size="sm">
                    <FileText className="size-4 mr-1" />
                    Rapor
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
