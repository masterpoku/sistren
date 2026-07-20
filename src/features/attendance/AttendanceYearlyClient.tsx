"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ColumnDef } from "@tanstack/react-table";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const STATUS_CFG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  present: { label: "Hadir", variant: "default" },
  sick: { label: "Sakit", variant: "secondary" },
  permit: { label: "Izin", variant: "outline" },
  absent: { label: "Alpha", variant: "destructive" },
  late: { label: "Terlambat", variant: "outline" },
};

type RosterItem = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
};
type AggRow = { enrollmentId: number; status: string; count: number };
type AggMonthRow = {
  enrollmentId: number;
  month: number;
  status: string;
  count: number;
};

type HistItem = {
  sessionDate: Date;
  status: string;
  subjectId: number;
  subjectName: string;
  notes: string | null;
};

interface AttendanceYearlyClientProps {
  classId: number;
}

export function AttendanceYearlyClient({
  classId,
}: AttendanceYearlyClientProps) {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<{
    roster: RosterItem[];
    perStudent: AggRow[];
    perStudentMonth: AggMonthRow[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [viewStudent, setViewStudent] = useState<{ studentId: string; name: string } | null>(null);
  const [history, setHistory] = useState<HistItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  async function loadSummary() {
    setLoading(true);
    const mod = await import("@/actions/attendance");
    const res = await mod.getAttendanceYearlySummary({
      classId,
      startDate,
      endDate,
    });
    setLoading(false);
    if ("roster" in res && res.roster) {
      setResult({
        roster: res.roster,
        perStudent: res.perStudent,
        perStudentMonth: res.perStudentMonth,
      });
    }
  }

  async function openHistory(studentId: string, name: string) {
    setViewStudent({ studentId, name });
    setFilterStatus("all");
    setHistoryLoading(true);
    const mod = await import("@/actions/attendance");
    const res = await mod.getStudentAttendance({
      studentId,
      startDate,
      endDate,
    });
    setHistoryLoading(false);
    if ("items" in res) {
      setHistory(res.items as HistItem[]);
    }
  }

  // Compute per-student summary
  const studentSummary =
    result?.roster.map((s) => {
      const rows = result.perStudent.filter(
        (r) => r.enrollmentId === s.enrollmentId
      );
      const get = (st: string) =>
        Number(rows.find((r) => r.status === st)?.count ?? 0);
      const hadir = get("present");
      const sakit = get("sick");
      const izin = get("permit");
      const alpha = get("absent");
      const telat = get("late");
      const total = hadir + sakit + izin + alpha + telat;
      const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
      return {
        studentId: s.studentId,
        siswa: s.studentName,
        hadir,
        sakit,
        izin,
        alpha,
        telat,
        total,
        pct: `${pct}%`,
      };
    }) ?? [];

  const studentColumns: ColumnDef<(typeof studentSummary)[number]>[] = [
    { accessorKey: "siswa", header: "Siswa" },
    { accessorKey: "hadir", header: "Hadir" },
    { accessorKey: "sakit", header: "Sakit" },
    { accessorKey: "izin", header: "Izin" },
    { accessorKey: "alpha", header: "Alpha" },
    { accessorKey: "telat", header: "Terlambat" },
    { accessorKey: "total", header: "Total" },
    { accessorKey: "pct", header: "%Hadir" },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openHistory(row.original.studentId, row.original.siswa)}
        >
          Lihat
        </Button>
      ),
    },
  ];

  // Compute per-student per-month (hadir/alpha per month)
  const monthData =
    result?.roster.map((s) => {
      const row: Record<string, string | number> = { siswa: s.studentName };
      for (let m = 1; m <= 12; m++) {
        const hadir = Number(
          result.perStudentMonth.find(
            (r) =>
              r.enrollmentId === s.enrollmentId &&
              r.month === m &&
              r.status === "present"
          )?.count ?? 0
        );
        const alpha = Number(
          result.perStudentMonth.find(
            (r) =>
              r.enrollmentId === s.enrollmentId &&
              r.month === m &&
              r.status === "absent"
          )?.count ?? 0
        );
        row[`m${m}`] = `${hadir}/${hadir + alpha}`;
      }
      return row;
    }) ?? [];

  const monthColumns: ColumnDef<Record<string, string | number>>[] = [
    { accessorKey: "siswa", header: "Siswa" },
    ...MONTHS.map((label, i) => ({
      accessorKey: `m${i + 1}`,
      header: label,
    })),
  ];

  // Filter history by status
  const filteredHistory =
    filterStatus === "all"
      ? history
      : history.filter((item) => item.status === filterStatus);

  // Group history by day
  const historyEntries = (() => {
    const map = new Map<string, HistItem[]>();
    for (const item of filteredHistory) {
      const key = new Date(item.sessionDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  })();

  const historyCounts: Record<string, number> = {};
  for (const item of filteredHistory) {
    historyCounts[item.status] = (historyCounts[item.status] ?? 0) + 1;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi per Rentang Tanggal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-2">
              <Label>Dari</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Sampai</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              type="button"
              disabled={loading}
              onClick={loadSummary}
            >
              {loading ? "Memuat..." : "Tampilkan Rekap"}
            </Button>
          </div>

          {result && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  Rekap per Siswa ({startDate} s.d. {endDate})
                </h3>
                <DataTable
                  columns={studentColumns}
                  data={studentSummary}
                  exportFilename={`rekap-absensi-${startDate}_${endDate}`}
                  emptyMessage="Belum ada data absensi."
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  Kehadiran per Bulan (Hadir/Alpha)
                </h3>
                <DataTable
                  columns={monthColumns}
                  data={monthData}
                  exportFilename={`rekap-absensi-bulanan-${startDate}_${endDate}`}
                  emptyMessage="Belum ada data absensi."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!viewStudent}
        onOpenChange={(open) => { if (!open) setViewStudent(null); }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Riwayat Absensi — {viewStudent?.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({startDate} s.d. {endDate})
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {historyLoading ? (
              <p className="py-4 text-sm text-muted-foreground">Memuat...</p>
            ) : history.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Belum ada catatan absensi.
              </p>
            ) : (
              <>
                {/* Ringkasan modal */}
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                    <div key={key} className="rounded-lg border p-2 text-center">
                      <p className="text-lg font-bold">{historyCounts[key] ?? 0}</p>
                      <p className="text-xs text-muted-foreground">{cfg.label}</p>
                    </div>
                  ))}
                </div>

                {/* Filter status */}
                <div className="flex flex-wrap gap-1.5">
                  {(["all", ...Object.keys(STATUS_CFG)] as const).map((key) => {
                    const label = key === "all" ? "Semua" : STATUS_CFG[key].label;
                    const isActive = filterStatus === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilterStatus(key)}
                        className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Riwayat group per hari */}
                <div className="space-y-4">
                  {historyEntries.map(([dateLabel, entries]) => (
                    <div key={dateLabel}>
                      <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                        {dateLabel}
                      </h4>
                      <div className="space-y-1">
                        {entries.map((item, idx) => {
                          const cfg = STATUS_CFG[item.status] ?? {
                            label: item.status,
                            variant: "outline" as const,
                          };
                          return (
                            <div
                              key={`${item.subjectId}-${idx}`}
                              className="flex items-center justify-between rounded-lg border px-3 py-2"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">
                                  {item.subjectName}
                                </span>
                                {item.notes && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.notes}
                                  </span>
                                )}
                              </div>
                              <Badge variant={cfg.variant}>{cfg.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
