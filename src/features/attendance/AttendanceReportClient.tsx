"use client";

import { useState } from "react";
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

const STATUS_LABELS: Record<string, string> = {
  present: "Hadir",
  sick: "Sakit",
  permit: "Izin",
  absent: "Alpha",
  late: "Terlambat",
};

interface AttendanceReportClientProps {
  classes: { id: number; name: string }[];
}

export function AttendanceReportClient({
  classes,
}: AttendanceReportClientProps) {
  const [classId, setClassId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [totals, setTotals] = useState<Array<{
    status: string;
    count: number;
  }> | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    if (!classId) return;
    setLoading(true);
    const mod = await import("@/actions/attendance");
    const result = await mod.getAttendanceReport({
      classId: Number(classId),
      startDate,
      endDate,
    });
    setLoading(false);
    if ("totals" in result && result.totals) {
      setTotals(result.totals);
    }
  }

  const total = totals?.reduce((acc, t) => acc + Number(t.count), 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Absensi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
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
          <div className="flex items-end">
            <Button
              type="button"
              disabled={loading || !classId}
              onClick={loadReport}
            >
              {loading ? "Memuat..." : "Muat"}
            </Button>
          </div>
        </div>
        {totals && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Total {total} catatan absensi.
            </p>
            <div className="space-y-1">
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const found = totals.find((t) => t.status === key);
                const count = Number(found?.count ?? 0);
                const percent =
                  total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="w-20 text-sm">{label}</span>
                    <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
