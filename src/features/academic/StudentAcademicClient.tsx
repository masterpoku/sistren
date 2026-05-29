'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BookOpen,
  CalendarCheck,
  Clock,
  MapPin,
  DownloadSimple,
  MagnifyingGlass,
} from '@phosphor-icons/react';

const MOCK_COURSES = [
  { code: 'TKJ-301', name: 'Sistem Terdistribusi', sks: 3, grade: 'A', ip: 4.0 },
  { code: 'TKJ-302', name: 'Kecerdasan Buatan', sks: 3, grade: 'A-', ip: 3.67 },
  { code: 'TKJ-303', name: 'Jaringan Komputer', sks: 4, grade: 'B+', ip: 3.33 },
  { code: 'TKJ-304', name: 'Praktikum Jaringan', sks: 2, grade: 'A', ip: 4.0 },
  { code: 'TKJ-305', name: 'Basis Data', sks: 3, grade: 'B', ip: 3.0 },
  { code: 'TKJ-306', name: 'Pemrograman Web', sks: 3, grade: 'A-', ip: 3.67 },
];

const MOCK_SCHEDULE = [
  { day: 'Senin', time: '07:30-10:00', subject: 'Sistem Terdistribusi', room: 'Lab. Komputer 1' },
  { day: 'Senin', time: '10:30-13:00', subject: 'Kecerdasan Buatan', room: 'Ruang XII-TKJ' },
  { day: 'Selasa', time: '07:30-10:00', subject: 'Jaringan Komputer', room: 'Lab. Jaringan' },
  { day: 'Selasa', time: '10:30-13:00', subject: 'Basis Data', room: 'Ruang XII-TKJ' },
  { day: 'Rabu', time: '07:30-10:00', subject: 'Praktikum Jaringan', room: 'Lab. Komputer 2' },
  { day: 'Rabu', time: '10:30-13:00', subject: 'Pemrograman Web', room: 'Lab. Komputer 1' },
  { day: 'Kamis', time: '07:30-10:00', subject: 'Sistem Terdistribusi', room: 'Ruang XII-TKJ' },
  { day: "Jum'at", time: '07:30-09:00', subject: 'Bimbingan Karir', room: 'Aula' },
];

const totalSks = MOCK_COURSES.reduce((sum, c) => sum + c.sks, 0);
const totalIp = MOCK_COURSES.reduce((sum, c) => sum + c.ip, 0);
const ipSemester = (totalIp / MOCK_COURSES.length).toFixed(2);

export function StudentAcademicClient() {
  const [search, setSearch] = useState('');

  const filteredCourses = MOCK_COURSES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Akademik</h1>
        <p className="text-muted-foreground">
          KRS, KHS, dan jadwal pembelajaran Anda.
        </p>
      </div>

      <Tabs defaultValue="khs" className="w-full">
        <TabsList>
          <TabsTrigger value="khs">KHS</TabsTrigger>
          <TabsTrigger value="krs">KRS</TabsTrigger>
          <TabsTrigger value="jadwal">Jadwal</TabsTrigger>
        </TabsList>

        <TabsContent value="khs" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari mata kuliah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <DownloadSimple className="h-4 w-4" />
              Unduh KHS
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Nilai — Semester 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Kode</th>
                      <th className="text-left px-4 py-3 font-medium">Mata Pelajaran</th>
                      <th className="text-center px-4 py-3 font-medium">SKS</th>
                      <th className="text-center px-4 py-3 font-medium">Nilai</th>
                      <th className="text-center px-4 py-3 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{course.code}</td>
                        <td className="px-4 py-3">{course.name}</td>
                        <td className="px-4 py-3 text-center">{course.sks}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={course.grade.startsWith('A') ? 'default' : course.grade.startsWith('B') ? 'secondary' : 'outline'}>
                            {course.grade}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{course.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total SKS:</span>
                  <span className="font-bold text-xl">{totalSks}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">IP Semester:</span>
                  <span className="font-bold text-xl">{ipSemester}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="krs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rencana Studi — Semester 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Kode</th>
                      <th className="text-left px-4 py-3 font-medium">Mata Pelajaran</th>
                      <th className="text-center px-4 py-3 font-medium">SKS</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_COURSES.map((course, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{course.code}</td>
                        <td className="px-4 py-3">{course.name}</td>
                        <td className="px-4 py-3 text-center">{course.sks}</td>
                        <td className="px-4 py-3 text-center"><Badge variant="default">Aktif</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                      <th className="text-left px-4 py-3 font-medium">Hari</th>
                      <th className="text-left px-4 py-3 font-medium">Waktu</th>
                      <th className="text-left px-4 py-3 font-medium">Mata Pelajaran</th>
                      <th className="text-left px-4 py-3 font-medium">Ruang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at"].map((day) => {
                      const daySchedules = MOCK_SCHEDULE.filter((s) => s.day === day);
                      return daySchedules.map((s, i) => (
                        <tr key={`${day}-${i}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          {i === 0 && <td rowSpan={daySchedules.length} className="px-4 py-3 font-medium">{day}</td>}
                          <td className="px-4 py-3"><Clock className="h-3.5 w-3.5 inline text-muted-foreground mr-1" />{s.time}</td>
                          <td className="px-4 py-3">{s.subject}</td>
                          <td className="px-4 py-3"><MapPin className="h-3.5 w-3.5 inline text-muted-foreground mr-1" />{s.room}</td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
