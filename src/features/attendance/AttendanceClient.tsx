"use client";

import { useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { AttendanceStudentClient } from "@/features/attendance/AttendanceStudentClient";
import { AttendanceTeacherClient } from "@/features/attendance/AttendanceTeacherClient";
import { AttendanceYearlyClient } from "@/features/attendance/AttendanceYearlyClient";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AttendanceClientProps {
  roleLevel: number;
  classes: { id: number; name: string; code: string }[];
  studentSubjects: { id: number; name: string; code: string | null }[];
  studentId?: string;
}

type Tab = "input" | "yearly";

export function AttendanceClient({
  roleLevel,
  classes,
  studentSubjects,
  studentId,
}: AttendanceClientProps) {
  const isStudent = roleLevel < 60;
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tab, setTab] = useState<Tab>("input");

  if (isStudent) {
    return (
      <PageShell
        title="Absensi"
        description="Lihat catatan kehadiran Anda."
      >
        <AttendanceStudentClient studentId={studentId!} subjects={studentSubjects} />
      </PageShell>
    );
  }

  const isAdmin = roleLevel >= 80;

  return (
    <PageShell
      title="Absensi"
      description="Catat dan kelola absensi siswa."
    >
      <div className="space-y-6">
        {/* Shared class filter */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label>Kelas</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[180px]">
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
          <div className="grid gap-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={sessionDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          <button
            type="button"
            onClick={() => setTab("input")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "input"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Input Absensi
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setTab("yearly")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === "yearly"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Rekap Absensi
            </button>
          )}
        </div>

        {tab === "input" && selectedClassId && (
          <AttendanceTeacherClient
            classes={classes}
            classId={Number(selectedClassId)}
            sessionDate={sessionDate}
          />
        )}
        {tab === "yearly" && selectedClassId && (
          <AttendanceYearlyClient classId={Number(selectedClassId)} />
        )}

        {!selectedClassId && (
          <p className="text-sm text-muted-foreground">
            Pilih kelas terlebih dahulu.
          </p>
        )}
      </div>
    </PageShell>
  );
}
