"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
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
  notes: string | null;
}

interface AttendanceStudentClientProps {
  items: AttendanceItem[];
}

export function AttendanceStudentClient({
  items,
}: AttendanceStudentClientProps) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(STATUS_LABELS).map(([key, config]) => (
              <div key={key} className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Belum ada catatan absensi.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => {
                const config = STATUS_LABELS[item.status] ?? {
                  label: item.status,
                  variant: "outline" as const,
                };
                const key = `${item.sessionDate instanceof Date ? item.sessionDate.toISOString() : String(item.sessionDate)}-${idx}`;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(item.sessionDate).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
