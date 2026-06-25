"use client";

import { useState } from "react";
import { markAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

const STATUS_LABELS: Record<string, string> = {
  present: "Hadir",
  sick: "Sakit",
  permit: "Izin",
  absent: "Alpha",
  late: "Terlambat",
};

type AttendanceStatus = "present" | "sick" | "permit" | "absent" | "late";

interface RosterItem {
  enrollmentId: number;
  studentId: string;
  studentName: string;
}

interface AttendanceTeacherClientProps {
  classes: { id: number; name: string }[];
  initialRoster: RosterItem[];
}

export function AttendanceTeacherClient({
  classes,
  initialRoster,
}: AttendanceTeacherClientProps) {
  const [classId, setClassId] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [roster] = useState(initialRoster);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const [handleSubmit, isPending] = useActionWithToast(
    async () => {
      const records = roster.map((r) => ({
        enrollmentId: r.enrollmentId,
        status: (statuses[r.enrollmentId] ?? "present") as AttendanceStatus,
        notes: notes[r.enrollmentId] || undefined,
      }));
      return markAttendance({
        classId: Number(classId),
        sessionDate,
        records,
      });
    },
    { successMessage: "Absensi tersimpan." }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Absensi Kelas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Kelas</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={sessionDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
        </div>
        {roster.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Pilih kelas untuk memuat daftar siswa.
          </p>
        ) : (
          <div className="space-y-2">
            {roster.map((r) => (
              <div
                key={r.enrollmentId}
                className="grid grid-cols-1 md:grid-cols-[1fr_180px_1fr] items-center gap-3 rounded-lg border p-3"
              >
                <span className="font-medium">{r.studentName}</span>
                <Select
                  value={statuses[r.enrollmentId] ?? "present"}
                  onValueChange={(v) =>
                    setStatuses((prev) => ({ ...prev, [r.enrollmentId]: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Catatan (opsional)"
                  value={notes[r.enrollmentId] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({
                      ...prev,
                      [r.enrollmentId]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={isPending || !classId || roster.length === 0}
            onClick={handleSubmit}
          >
            {isPending ? "Menyimpan..." : "Simpan Absensi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
