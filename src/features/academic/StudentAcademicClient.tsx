'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  DownloadSimple,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { getStudentGrades } from '@/actions/grades';

const MOCK_SCHEDULE = [
  {
    day: 'Senin',
    time: '07:30-10:00',
    subject: 'Sistem Terdistribusi',
    room: 'Lab. Komputer 1',
  },
  {
    day: 'Senin',
    time: '10:30-13:00',
    subject: 'Kecerdasan Buatan',
    room: 'Ruang XII-TKJ',
  },
  {
    day: 'Selasa',
    time: '07:30-10:00',
    subject: 'Jaringan Komputer',
    room: 'Lab. Jaringan',
  },
  {
    day: 'Selasa',
    time: '10:30-13:00',
    subject: 'Basis Data',
    room: 'Ruang XII-TKJ',
  },
  {
    day: 'Rabu',
    time: '07:30-10:00',
    subject: 'Praktikum Jaringan',
    room: 'Lab. Komputer 2',
  },
  {
    day: 'Rabu',
    time: '10:30-13:00',
    subject: 'Pemrograman Web',
    room: 'Lab. Komputer 1',
  },
  {
    day: 'Kamis',
    time: '07:30-10:00',
    subject: 'Sistem Terdistribusi',
    room: 'Ruang XII-TKJ',
  },
  {
    day: "Jum'at",
    time: '07:30-09:00',
    subject: 'Bimbingan Karir',
    room: 'Aula',
  },
];

interface GradeItem {
  subjectName: string;
  subjectCode: string | null;
  subjectCredits: number | null;
  type: string;
  score: string | null;
  grade: string | null;
  predicate: string | null;
  semesterId: number;
  className: string;
}

interface Props {
  userId: string;
}

export function StudentAcademicClient({ userId }: Props) {
  const [search, setSearch] = useState('');
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesterOptions, setSemesterOptions] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  useEffect(() => {
    getStudentGrades(userId).then((data) => {
      setGrades(data);

      // Extract unique semesters for the picker
      const semesters = Array.from(
        new Map(
          data.map((g: GradeItem) => [
            g.semesterId,
            { id: g.semesterId, label: `Semester ${g.semesterId}` },
          ])
        ).values()
      );
      setSemesterOptions(semesters);

      if (semesters.length > 0) {
        setSelectedSemester(semesters[semesters.length - 1].id);
      }

      setLoading(false);
    });
  }, [userId]);

  // Filter grades by selected semester and search
  const filteredGrades = grades
    .filter((g) => !selectedSemester || g.semesterId === selectedSemester)
    .filter(
      (g) =>
        g.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        (g.subjectCode?.toLowerCase() ?? '').includes(search.toLowerCase())
    );

  // Group by type for display
  const knowledgeGrades = filteredGrades.filter((g) => g.type === 'knowledge');
  const skillGrades = filteredGrades.filter((g) => g.type === 'skill');
  const attitudeGrades = filteredGrades.filter((g) => g.type === 'attitude');

  // Calculate IP from knowledge grades
  const totalCredits = knowledgeGrades.reduce(
    (sum, g) => sum + (g.subjectCredits ?? 0),
    0
  );
  const totalWeighted = knowledgeGrades.reduce((sum, g) => {
    const score = parseFloat(g.score ?? '0');
    const credits = g.subjectCredits ?? 0;
    // Convert score to IP scale (0-4)
    const ip =
      score >= 86 ? 4 : score >= 76 ? 3 : score >= 66 ? 2 : score >= 56 ? 1 : 0;
    return sum + ip * credits;
  }, 0);
  const ipSemester =
    totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : '0.00';

  // Current semester label
  const selectedSemesterLabel =
    semesterOptions.find((s) => s.id === selectedSemester)?.label ?? 'Semester';

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
              {/* Semester picker */}
              {semesterOptions.length > 1 && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedSemester ?? ''}
                    onChange={(e) =>
                      setSelectedSemester(Number(e.target.value))
                    }
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  >
                    {semesterOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                        Nilai Pengetahuan — {selectedSemesterLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                              <th className="text-left px-4 py-3 font-medium">
                                Kode
                              </th>
                              <th className="text-left px-4 py-3 font-medium">
                                Mata Pelajaran
                              </th>
                              <th className="text-center px-4 py-3 font-medium">
                                SKS
                              </th>
                              <th className="text-center px-4 py-3 font-medium">
                                Nilai
                              </th>
                              <th className="text-center px-4 py-3 font-medium">
                                Huruf
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {knowledgeGrades.map((g, i) => (
                              <tr
                                key={`${g.subjectCode}-${i}`}
                                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3 font-mono text-xs">
                                  {g.subjectCode ?? '-'}
                                </td>
                                <td className="px-4 py-3">{g.subjectName}</td>
                                <td className="px-4 py-3 text-center">
                                  {g.subjectCredits ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {g.score ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {g.grade ? (
                                    <Badge
                                      variant={
                                        g.grade.startsWith('A')
                                          ? 'default'
                                          : g.grade.startsWith('B')
                                            ? 'secondary'
                                            : 'outline'
                                      }
                                    >
                                      {g.grade}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center gap-6 pt-4 border-t border-border mt-4">
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

                {/* Skill grades */}
                {skillGrades.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Nilai Keterampilan — {selectedSemesterLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                              <th className="text-left px-4 py-3 font-medium">
                                Kode
                              </th>
                              <th className="text-left px-4 py-3 font-medium">
                                Mata Pelajaran
                              </th>
                              <th className="text-center px-4 py-3 font-medium">
                                Nilai
                              </th>
                              <th className="text-center px-4 py-3 font-medium">
                                Huruf
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {skillGrades.map((g, i) => (
                              <tr
                                key={`skill-${g.subjectCode}-${i}`}
                                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3 font-mono text-xs">
                                  {g.subjectCode ?? '-'}
                                </td>
                                <td className="px-4 py-3">{g.subjectName}</td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {g.score ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {g.grade ? (
                                    <Badge
                                      variant={
                                        g.grade.startsWith('A')
                                          ? 'default'
                                          : g.grade.startsWith('B')
                                            ? 'secondary'
                                            : 'outline'
                                      }
                                    >
                                      {g.grade}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                            {attitudeGrades.map((g, i) => (
                              <tr
                                key={`attitude-${g.subjectCode}-${i}`}
                                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-4 py-3">{g.subjectName}</td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {g.predicate ?? g.score ?? '-'}
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="text-left px-4 py-3 font-medium">
                            Kode
                          </th>
                          <th className="text-left px-4 py-3 font-medium">
                            Mata Pelajaran
                          </th>
                          <th className="text-center px-4 py-3 font-medium">
                            SKS
                          </th>
                          <th className="text-center px-4 py-3 font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {knowledgeGrades.map((g, i) => (
                          <tr
                            key={`krs-${g.subjectCode}-${i}`}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs">
                              {g.subjectCode ?? '-'}
                            </td>
                            <td className="px-4 py-3">{g.subjectName}</td>
                            <td className="px-4 py-3 text-center">
                              {g.subjectCredits ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="default">Aktif</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jadwal" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Pembelajaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3 font-medium">
                          Hari
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Waktu
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Mata Pelajaran
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Ruang
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"].map(
                        (day) => {
                          const daySchedules = MOCK_SCHEDULE.filter(
                            (s) => s.day === day
                          );
                          return daySchedules.map((s, i) => (
                            <tr
                              key={`${day}-${i}`}
                              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                            >
                              {i === 0 && (
                                <td
                                  rowSpan={daySchedules.length}
                                  className="px-4 py-3 font-medium"
                                >
                                  {day}
                                </td>
                              )}
                              <td className="px-4 py-3">
                                <Clock className="h-3.5 w-3.5 inline text-muted-foreground mr-1" />
                                {s.time}
                              </td>
                              <td className="px-4 py-3">{s.subject}</td>
                              <td className="px-4 py-3">
                                <MapPin className="h-3.5 w-3.5 inline text-muted-foreground mr-1" />
                                {s.room}
                              </td>
                            </tr>
                          ));
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
