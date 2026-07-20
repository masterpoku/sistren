"use client";

import {
  BookOpen,
  Calendar,
  CalendarCheck,
  DownloadSimple,
  GraduationCap,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { getStudentGrades } from "@/actions/grades";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarEventItem {
  id: number;
  title: string;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean | null;
  category: string | null;
}

interface GradeItem {
  subjectName: string;
  subjectCredits: number | null;
  type: string;
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
  semesterId: number;
  semesterName: string;
  semesterYear: string;
  classCode: string;
}

interface Props {
  userId: string;
  calendarEvents?: CalendarEventItem[];
}

function subScoreCell(key: string) {
  return ({ row }: { row: { getValue: (k: string) => string | null } }) => (
    <span className="block text-center text-xs font-mono">
      {row.getValue(key) ?? "-"}
    </span>
  );
}

const knowledgeColumns: ColumnDef<GradeItem>[] = [
  { accessorKey: "subjectName", header: "Mata Pelajaran" },
  {
    accessorKey: "subjectCredits",
    header: "SKS",
    cell: ({ row }) => (
      <span className="block text-center">
        {row.getValue("subjectCredits") ?? "-"}
      </span>
    ),
  },
  { accessorKey: "dailyTest1", header: "TP1", cell: subScoreCell("dailyTest1") },
  { accessorKey: "dailyTest2", header: "TP2", cell: subScoreCell("dailyTest2") },
  { accessorKey: "dailyTest3", header: "TP3", cell: subScoreCell("dailyTest3") },
  { accessorKey: "dailyTest4", header: "TP4", cell: subScoreCell("dailyTest4") },
  { accessorKey: "dailyTest5", header: "TP5", cell: subScoreCell("dailyTest5") },
  { accessorKey: "dailyTest6", header: "TP6", cell: subScoreCell("dailyTest6") },
  { accessorKey: "dailyTest7", header: "TP7", cell: subScoreCell("dailyTest7") },
  { accessorKey: "dailyTest8", header: "TP8", cell: subScoreCell("dailyTest8") },
  { accessorKey: "dailyTest9", header: "TP9", cell: subScoreCell("dailyTest9") },
  { accessorKey: "dailyTest10", header: "TP10", cell: subScoreCell("dailyTest10") },
  { accessorKey: "midterm", header: "Sumatif Tes", cell: subScoreCell("midterm") },
  { accessorKey: "finalExam", header: "Sumatif Non Tes", cell: subScoreCell("finalExam") },
  {
    accessorKey: "score",
    header: "Akhir",
    cell: ({ row }) => (
      <span className="block text-center font-medium">
        {row.getValue("score") ?? "-"}
      </span>
    ),
  },
];

type KrsItem = GradeItem & { status: string };

const krsColumns: ColumnDef<KrsItem>[] = [
  { accessorKey: "subjectName", header: "Mata Pelajaran" },
  {
    accessorKey: "subjectCredits",
    header: "SKS",
    cell: ({ row }) => (
      <span className="block text-center">
        {row.getValue("subjectCredits") ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="block text-center">
        <Badge variant="default">{row.getValue("status")}</Badge>
      </span>
    ),
  },
];

export function StudentAcademicClient({ userId, calendarEvents = [] }: Props) {
  const [search, setSearch] = useState("");
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesterOptions, setSemesterOptions] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [classOptions, setClassOptions] = useState<
    { code: string; name: string }[]
  >([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    getStudentGrades(userId).then((data) => {
      setGrades(data);

      // Extract unique semesters for the picker
      const semesters = Array.from(
        new Map(
          data.map((g: GradeItem) => [
            g.semesterId,
            {
              id: g.semesterId,
              label: `${g.semesterName} ${g.semesterYear}`,
            },
          ])
        ).values()
      );
      setSemesterOptions(semesters);

      // Extract unique classes for the picker
      const classes = Array.from(
        new Map(
          data.map((g: GradeItem) => [
            g.classCode,
            { code: g.classCode, name: g.classCode },
          ])
        ).values()
      );
      setClassOptions(classes);

      if (semesters.length > 0) {
        setSelectedSemester(semesters[semesters.length - 1].id);
      }

      if (classes.length > 0) {
        const last = data
          .filter((g) => g.semesterId === semesters[semesters.length - 1]?.id)
          .at(-1);
        setSelectedClass(last?.classCode ?? classes[0].code);
      }

      setLoading(false);
    });
  }, [userId]);

  // Filter grades by selected class, semester, and search
  const filteredGrades = grades
    .filter((g) => !selectedSemester || g.semesterId === selectedSemester)
    .filter((g) => !selectedClass || g.classCode === selectedClass)
  .filter(
    (g) =>
      g.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  // Group by type for display
  const knowledgeGrades = filteredGrades.filter((g) => g.type === "knowledge");
  const attitudeGrades = filteredGrades.filter((g) => g.type === "attitude");

  // Calculate IP from knowledge grades
  const totalCredits = knowledgeGrades.reduce(
    (sum, g) => sum + (g.subjectCredits ?? 0),
    0
  );
  const totalWeighted = knowledgeGrades.reduce((sum, g) => {
    const score = parseFloat(g.score ?? "0");
    const credits = g.subjectCredits ?? 0;
    // Convert score to IP scale (0-4)
    const ip =
      score >= 86 ? 4 : score >= 76 ? 3 : score >= 66 ? 2 : score >= 56 ? 1 : 0;
    return sum + ip * credits;
  }, 0);
  const ipSemester =
    totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : "0.00";

  // Current semester label
  const selectedSemesterLabel =
    semesterOptions.find((s) => s.id === selectedSemester)?.label ?? "Semester";
  const selectedClassLabel = selectedClass ?? "";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Akademik</h1>
        <p className="text-muted-foreground">
          KHS, KRS, dan jadwal pembelajaran Anda.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Memuat data akademik...
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="khs" className="w-full">
          <TabsList>
            <TabsTrigger value="khs">KHS</TabsTrigger>
            <TabsTrigger value="krs">KRS</TabsTrigger>
            <TabsTrigger value="jadwal">Jadwal</TabsTrigger>
          </TabsList>

          <TabsContent value="khs" className="space-y-4 mt-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Class picker */}
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedClass ?? undefined}
                  onValueChange={setSelectedClass}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.length > 0 ? classOptions.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    )) : (
                      <SelectItem value="_none" disabled>
                        Tidak ada data kelas
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester picker */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={
                    selectedSemester ? String(selectedSemester) : undefined
                  }
                  onValueChange={(v) => setSelectedSemester(Number(v))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.length > 0 ? semesterOptions.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.label}
                      </SelectItem>
                    )) : (
                      <SelectItem value="_none" disabled>
                        Tidak ada data semester
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 max-w-sm">
                <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled
                title="Fitur unduh KHS belum tersedia"
              >
                <DownloadSimple className="h-4 w-4" />
                Unduh KHS
              </Button>
            </div>

            {filteredGrades.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    Belum ada data nilai untuk semester ini.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Knowledge grades */}
                {knowledgeGrades.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Nilai Pengetahuan — {selectedClassLabel} {selectedSemesterLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DataTable
                        columns={knowledgeColumns}
                        data={knowledgeGrades}
                        exportFilename={`khs-pengetahuan-${selectedSemesterLabel}`}
                        emptyMessage="Belum ada nilai pengetahuan."
                      />
                      <div className="flex items-center gap-6 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Total SKS:
                          </span>
                          <span className="font-bold text-xl">
                            {totalCredits}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            IP Semester:
                          </span>
                          <span className="font-bold text-xl">
                            {ipSemester}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Attitude grades */}
                {attitudeGrades.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Nilai Sikap — {selectedSemesterLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                              <th className="text-left px-4 py-3 font-medium">
                                Mata Pelajaran
                              </th>
                              <th className="text-center px-4 py-3 font-medium">
                                Nilai
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {attitudeGrades.map((g) => (
                              <tr
                                key={`attitude-${g.subjectName}`}
                                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3">{g.subjectName}</td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {g.score ?? "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="krs" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rencana Studi — {selectedSemesterLabel}</CardTitle>
              </CardHeader>
              <CardContent>
                {knowledgeGrades.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada data KRS.
                  </p>
                ) : (
                  <DataTable
                    columns={krsColumns}
                    data={knowledgeGrades.map((g) => ({
                      ...g,
                      status: "Aktif",
                    }))}
                    exportFilename={`krs-${selectedSemesterLabel}`}
                    emptyMessage="Belum ada data KRS."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jadwal" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Acara Mendatang</CardTitle>
              </CardHeader>
              <CardContent>
                {calendarEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada acara mendatang.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {calendarEvents.slice(0, 10).map((event) => {
                      const startDate = new Date(event.startAt);
                      const endDate = event.endAt
                        ? new Date(event.endAt)
                        : null;
                      const formatTime = (d: Date) =>
                        d.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex flex-col items-center min-w-[50px]">
                            <span className="text-xs font-medium text-muted-foreground">
                              {startDate.toLocaleDateString("id-ID", {
                                month: "short",
                              })}
                            </span>
                            <span className="text-xl font-bold">
                              {startDate.getDate()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {event.allDay === true
                                ? "Seharian"
                                : `${formatTime(startDate)}${
                                    endDate ? ` - ${formatTime(endDate)}` : ""
                                  }`}
                            </p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {event.category === "academic"
                                ? "Akademik"
                                : event.category === "holiday"
                                  ? "Hari Libur"
                                  : event.category === "event"
                                    ? "Acara"
                                    : event.category === "meeting"
                                      ? "Rapat"
                                      : event.category === "exam"
                                        ? "Ujian"
                                        : "Lainnya"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
