"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  getClassSubjectAttendance,
  getAttendanceByClass,
  getAttendanceSubjects,
  getTeacherSubjects,
  markAttendance,
} from "@/actions/attendance";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

const STATUS_LABELS: Record<string, string> = {
  present: "Hadir",
  sick: "Sakit",
  permit: "Izin",
  absent: "Alpha",
  late: "Terlambat",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

type AttendanceStatus = "present" | "sick" | "permit" | "absent" | "late";

interface ClassItem {
  id: number;
  name: string;
  code: string;
}

interface SubjectItem {
  id: number;
  name: string;
  code: string | null;
}

interface RosterItem {
  enrollmentId: number;
  studentId: string;
  studentName: string;
}

interface AttendanceTeacherClientProps {
  classes: ClassItem[];
  classId: number;
  sessionDate: string;
}

export function AttendanceTeacherClient({
  classes,
  classId,
  sessionDate,
}: AttendanceTeacherClientProps) {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [summary, setSummary] = useState<
    Record<number, Record<string, number>>
  >({});
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [dialogSubject, setDialogSubject] = useState<SubjectItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [dialogLoading, setDialogLoading] = useState(false);

  const [handleSubmit, isPending] = useActionWithToast(
    async () => {
      const records = roster.map((r) => ({
        enrollmentId: r.enrollmentId,
        status: (statuses[r.enrollmentId] ?? "absent") as AttendanceStatus,
        notes: notes[r.enrollmentId] || undefined,
      }));
      const res = await markAttendance({
        classId: Number(classId),
        subjectId: dialogSubject!.id,
        sessionDate,
        records,
      });
      if (!("error" in res)) {
        setDialogOpen(false);
        void loadSubjects();
      }
      return res;
    },
    { successMessage: "Absensi tersimpan." }
  );

  async function loadSubjects() {
    if (!classId) return;
    setLoading(true);
    let subs = await getTeacherSubjects(Number(classId));
    if (subs.length === 0) {
      subs = await getAttendanceSubjects(Number(classId));
    }
    setSubjects(subs);

    // Hitung ringkasan per mapel untuk tanggal terpilih
    const sum: Record<number, Record<string, number>> = {};
    const result = await getAttendanceByClass({
      classId: Number(classId),
      startDate: sessionDate,
      endDate: sessionDate,
    });
    if ("map" in result && result.map) {
      for (const s of subs) {
        const counts: Record<string, number> = {
          present: 0,
          sick: 0,
          permit: 0,
          absent: 0,
          late: 0,
        };
        for (const [, recs] of result.map) {
          const rec = (recs as Array<{ status: string; subjectId: number }>).find(
            (x) => x.subjectId === s.id
          );
          if (rec) counts[rec.status] = (counts[rec.status] ?? 0) + 1;
        }
        sum[s.id] = counts;
      }
    }
    setSummary(sum);
    setLoading(false);
  }

  async function openDialog(s: SubjectItem) {
    setDialogSubject(s);
    setDialogLoading(true);
    setDialogOpen(true);
    const res = await getClassSubjectAttendance({
      classId: Number(classId),
      subjectId: s.id,
      sessionDate,
    });
    setDialogLoading(false);
    if ("roster" in res && res.roster) {
      setRoster(res.roster);
      const init: Record<number, string> = {};
      const initNotes: Record<number, string> = {};
      for (const r of res.roster) {
        const rec = res.statusMap[r.enrollmentId];
        init[r.enrollmentId] = rec?.status ?? "absent";
        initNotes[r.enrollmentId] = rec?.notes ?? "";
      }
      setStatuses(init);
      setNotes(initNotes);
    }
  }

  function exportDialogToExcel() {
    if (!dialogSubject) return;
    const data = roster.map((r) => ({
      Siswa: r.studentName,
      Status: STATUS_LABELS[statuses[r.enrollmentId] ?? "absent"] ?? "-",
      Catatan: notes[r.enrollmentId] ?? "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");
    XLSX.writeFile(
      workbook,
      `absensi-${dialogSubject.name}-${sessionDate}.xlsx`
    );
  }

  const classCode = classes.find((c) => c.id === classId)?.code ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Absensi per Mata Pelajaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Kelas <strong>{classCode}</strong> · {sessionDate}
          </p>
          <Button
            type="button"
            disabled={loading}
            onClick={loadSubjects}
          >
            {loading ? "Memuat..." : "Muat Mapel"}
          </Button>
        </div>

        {subjects.length > 0 && (
          <DataTable
            columns={[
              { accessorKey: "name", header: "Mata Pelajaran" },
              {
                accessorKey: "present",
                header: "Hadir",
                cell: ({ row }) =>
                  summary[row.original.id]?.present ?? 0,
              },
              {
                accessorKey: "sick",
                header: "Sakit",
                cell: ({ row }) => summary[row.original.id]?.sick ?? 0,
              },
              {
                accessorKey: "permit",
                header: "Izin",
                cell: ({ row }) => summary[row.original.id]?.permit ?? 0,
              },
              {
                accessorKey: "absent",
                header: "Alpha",
                cell: ({ row }) => summary[row.original.id]?.absent ?? 0,
              },
              {
                accessorKey: "late",
                header: "Terlambat",
                cell: ({ row }) => summary[row.original.id]?.late ?? 0,
              },
              {
                id: "total",
                header: "Total",
                cell: ({ row }) => {
                  const c = summary[row.original.id];
                  const total = c
                    ? c.present + c.sick + c.permit + c.absent + c.late
                    : 0;
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(row.original)}
                    >
                      {total} siswa
                    </Button>
                  );
                },
              },
            ]}
            data={subjects}
            exportFilename={`absensi-${classCode}-${sessionDate}`}
            emptyMessage="Pilih kelas dan tanggal untuk memuat mapel."
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {dialogSubject?.name} · {sessionDate}
              </DialogTitle>
              <DialogDescription>
                {classCode} — centang status kehadiran tiap siswa, lalu simpan.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto">
              {dialogLoading ? (
                <p className="text-sm text-muted-foreground">Memuat...</p>
              ) : (
                roster.map((r) => (
                  <div
                    key={r.enrollmentId}
                    className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-[1fr_180px_1fr] md:items-center"
                  >
                    <span className="font-medium">{r.studentName}</span>
                    <select
                      value={statuses[r.enrollmentId] ?? "absent"}
                      onChange={(e) =>
                        setStatuses((prev) => ({
                          ...prev,
                          [r.enrollmentId]: e.target.value,
                        }))
                      }
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Catatan (opsional)"
                      value={notes[r.enrollmentId] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [r.enrollmentId]: e.target.value,
                        }))
                      }
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                ))
              )}
            </div>
            <DialogFooter className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={exportDialogToExcel}
                disabled={roster.length === 0}
              >
                Export Excel
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={isPending || dialogLoading || roster.length === 0}
                  onClick={handleSubmit}
                >
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
