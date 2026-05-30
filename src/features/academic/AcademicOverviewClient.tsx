'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
} from '@phosphor-icons/react';

interface AcademicStats {
  classCount: number;
  majorCount: number;
  subjectCount: number;
  semesterCount: number;
  activeSemesterName?: string;
  activeSemesterYear?: string;
}

export function AcademicOverviewClient({
  classCount,
  majorCount,
  subjectCount,
  semesterCount,
  activeSemesterName,
  activeSemesterYear,
}: AcademicStats) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {activeSemesterName ? (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
          <p className="text-sm font-medium text-primary">Semester Aktif</p>
          <p className="text-lg font-bold">
            {activeSemesterName} ({activeSemesterYear})
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-4">
          <p className="text-muted-foreground">Belum ada semester aktif.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kelas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{classCount}</p>
            <p className="text-xs text-muted-foreground">Tingkat pendidikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jurusan</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{majorCount}</p>
            <p className="text-xs text-muted-foreground">Program keahlian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mapel</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{subjectCount}</p>
            <p className="text-xs text-muted-foreground">Mata pelajaran</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Semester</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{semesterCount}</p>
            <p className="text-xs text-muted-foreground">Tahun ajaran</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/academic/classes">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <GraduationCap className="h-6 w-6" />
            <span>Kelola Kelas</span>
          </Button>
        </Link>
        <Link href="/academic/majors">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <BookOpen className="h-6 w-6" />
            <span>Kelola Jurusan</span>
          </Button>
        </Link>
        <Link href="/academic/subjects">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>Kelola Mapel</span>
          </Button>
        </Link>
        <Link href="/academic/semesters">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span>Kelola Semester</span>
          </Button>
        </Link>
        <Link href="/academic/grades">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <GraduationCap className="h-6 w-6" />
            <span>Input Nilai</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
