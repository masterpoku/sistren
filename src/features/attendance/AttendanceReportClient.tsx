"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

const STATUS_CODES: Record<string, string> = {
  present: "H",
  sick: "S",
  permit: "I",
  absent: "A",
  late: "T",
};

interface AttendanceReportClientProps {
  classes: { id: number; name: string; code: string }[];
  classId: number;
  sessionDate: string;
}

type ReportRow = {
  status: string;
  subjectId: number;
  count: number;
};
type RosterItem = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
};
type AttendanceRecord = {
  enrollmentId: number;
  sessionDate: Date;
  status: string;
  subjectId: number;
};
type SubjectItem = { id: number; name: string; code: string | null };

interface ReportResult {
  totals: ReportRow[];
  roster: RosterItem[];
  records: AttendanceRecord[];
  subjects: SubjectItem[];
}

export function AttendanceReportClient({
  classes,
  classId,
  sessionDate,
}: AttendanceReportClientProps) {
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    setLoading(true);
    const mod = await import("@/actions/attendance");
    const res = await mod.getAttendanceReport({
      classId,
      startDate: sessionDate,
      endDate: sessionDate,
    });
    setLoading(false);
    if ("totals" in res) {
      setResult(res as ReportResult);
    }
  }

  const classCode =
    classes.find((c) => c.id === classId)?.code ?? "kelas";
  const filenameBase = `absensi-${classCode}-${sessionDate}`;

  // Build summary-per-subject data
  const summaryData =
    result?.subjects.map((s) => {
      const rows = result.totals.filter((t) => t.subjectId === s.id);
      const get = (st: string) =>
        Number(rows.find((r) => r.status === st)?.count ?? 0);
      const hadir = get("present");
      const sakit = get("sick");
      const izin = get("permit");
      const alpha = get("absent");
      const telat = get("late");
      const total = hadir + sakit + izin + alpha + telat;
      return {
        mapel: s.name,
        hadir,
        sakit,
        izin,
        alpha,
        telat,
        total,
      };
    }) ?? [];

  const summaryColumns: ColumnDef<(typeof summaryData)[number]>[] = [
    { accessorKey: "mapel", header: "Mata Pelajaran" },
    { accessorKey: "hadir", header: "Hadir" },
    { accessorKey: "sakit", header: "Sakit" },
    { accessorKey: "izin", header: "Izin" },
    { accessorKey: "alpha", header: "Alpha" },
    { accessorKey: "telat", header: "Terlambat" },
    { accessorKey: "total", header: "Total" },
  ];

  // Build pivot: student x date
  const dates = Array.from(
    new Set((result?.records ?? []).map((r) => r.sessionDate.toISOString().slice(0, 10)))
  ).sort();

  const pivotData =
    result?.roster.map((student) => {
      const row: Record<string, string> = { siswa: student.studentName };
      for (const d of dates) {
        const rec = (result.records ?? []).find(
          (r) =>
            r.enrollmentId === student.enrollmentId &&
            r.sessionDate.toISOString().slice(0, 10) === d
        );
        row[d] = rec ? STATUS_CODES[rec.status] ?? rec.status : "";
      }
      return row;
    }) ?? [];

  const pivotColumns: ColumnDef<Record<string, string>>[] = [
    { accessorKey: "siswa", header: "Siswa" },
    ...dates.map((d) => ({
      accessorKey: d,
      header: d.slice(5), // MM-DD
    })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Absensi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Kelas <strong>{classCode}</strong> · {sessionDate}
          </p>
          <Button type="button" disabled={loading} onClick={loadReport}>
            {loading ? "Memuat..." : "Muat Laporan"}
          </Button>
        </div>

        {result && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Ringkasan per Mata Pelajaran
              </h3>
              <DataTable
                columns={summaryColumns}
                data={summaryData}
                exportFilename={`${filenameBase}-ringkasan`}
                emptyMessage="Belum ada data absensi."
              />
            </div>

            {dates.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  Detail Siswa × Tanggal (H=Hadir, S=Sakit, I=Izin, A=Alpha,
                  T=Terlambat)
                </h3>
                <DataTable
                  columns={pivotColumns}
                  data={pivotData}
                  exportFilename={`${filenameBase}-detail`}
                  emptyMessage="Belum ada data absensi."
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
