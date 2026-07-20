"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStudentAttendance } from "@/actions/attendance";
import { Badge } from "@/components/ui/badge";
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

interface AttendanceItem {
  sessionDate: Date;
  status: string;
  subjectId: number;
  subjectName: string;
  notes: string | null;
}

interface AttendanceStudentClientProps {
  studentId: string;
  subjects: { id: number; name: string; code: string | null }[];
}

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AttendanceStudentClient({
  studentId,
  subjects,
}: AttendanceStudentClientProps) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateInput(d);
  });
  const [endDate, setEndDate] = useState(() => toDateInput(new Date()));
  const [subjectId, setSubjectId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const res = await getStudentAttendance({
      studentId,
      startDate,
      endDate,
      subjectId: subjectId === "all" ? undefined : Number(subjectId),
    });
    if ("items" in res) {
      setItems(res.items as unknown as AttendanceItem[]);
    }
    setLoading(false);
  }, [studentId, startDate, endDate, subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems = useMemo(
    () => (filterStatus === "all" ? items : items.filter((i) => i.status === filterStatus)),
    [items, filterStatus]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const item of filteredItems) {
      c[item.status] = (c[item.status] ?? 0) + 1;
    }
    return c;
  }, [filteredItems]);

  const grouped = useMemo(() => {
    const map = new Map<string, AttendanceItem[]>();
    for (const item of filteredItems) {
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
  }, [filteredItems]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="grid gap-2">
            <Label>Dari</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>Sampai</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>Mata Pelajaran</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Semua Mapel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mapel</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={load} disabled={loading}>
            {loading ? "Memuat..." : "Tampilkan"}
          </Button>
        </CardContent>
      </Card>

      {/* Ringkasan */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <div key={key} className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-4 text-sm text-muted-foreground">Memuat...</p>
          ) : grouped.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Belum ada catatan absensi.
            </p>
          ) : (
            <div className="space-y-6">
              {grouped.map(([dateLabel, entries]) => (
                <div key={dateLabel}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {dateLabel}
                  </h3>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
