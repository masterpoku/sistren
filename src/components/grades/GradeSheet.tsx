'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface GradeSheetData {
  enrollmentId: number;
  subjectId: number;
  semesterId: number;
  score: string;
  grade: string;
  predicate?: string;
}

interface EnrollmentOption {
  id: number;
  studentName?: string | null;
  className?: string | null;
  semesterName?: string | null;
}
interface SubjectOption {
  id: number;
  name: string;
  code?: string | null;
}
interface SemesterOption {
  id: number;
  name: string;
  academicYear: string;
  isActive: boolean | null;
}

interface GradeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GradeSheetData) => Promise<void>;
  enrollments: EnrollmentOption[];
  subjects: SubjectOption[];
  semesters: SemesterOption[];
  initialData?: {
    id: number;
    enrollmentId: number;
    subjectId: number;
    semesterId: number;
    score?: string | null;
    grade?: string | null;
    predicate?: string | null;
  };
}

export function GradeSheet({
  open,
  onOpenChange,
  onSubmit,
  enrollments,
  subjects,
  semesters,
  initialData,
}: GradeSheetProps) {
  const [loading, setLoading] = React.useState(false);
  const [enrollmentId, setEnrollmentId] = React.useState<string>(
    initialData ? String(initialData.enrollmentId) : ''
  );
  const [subjectId, setSubjectId] = React.useState<string>(
    initialData ? String(initialData.subjectId) : ''
  );
  const [semesterId, setSemesterId] = React.useState<string>(
    initialData ? String(initialData.semesterId) : ''
  );
  const [score, setScore] = React.useState(initialData?.score || '');
  const [grade, setGrade] = React.useState(initialData?.grade || '');
  const [predicate, setPredicate] = React.useState(
    initialData?.predicate || ''
  );

  React.useEffect(() => {
    if (open) {
      setEnrollmentId(initialData ? String(initialData.enrollmentId) : '');
      setSubjectId(initialData ? String(initialData.subjectId) : '');
      setSemesterId(initialData ? String(initialData.semesterId) : '');
      setScore(initialData?.score || '');
      setGrade(initialData?.grade || '');
      setPredicate(initialData?.predicate || '');
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !enrollmentId ||
      !subjectId ||
      !semesterId ||
      !score.trim() ||
      !grade.trim()
    )
      return;
    setLoading(true);
    try {
      await onSubmit({
        enrollmentId: Number(enrollmentId),
        subjectId: Number(subjectId),
        semesterId: Number(semesterId),
        score: score.trim(),
        grade: grade.trim().toUpperCase(),
        predicate: predicate.trim() || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <SheetTitle>
              {initialData ? 'Edit Nilai' : 'Input Nilai'}
            </SheetTitle>
            <SheetDescription>
              {initialData
                ? 'Perbarui nilai siswa.'
                : 'Input nilai hasil belajar siswa.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gr-enrollment">Pendaftaran Siswa *</Label>
              <Select value={enrollmentId} onValueChange={setEnrollmentId}>
                <SelectTrigger id="gr-enrollment">
                  <SelectValue placeholder="Pilih pendaftaran..." />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.studentName || `ID ${e.id}`} — {e.className || ''} (
                      {e.semesterName || ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gr-subject">Mata Pelajaran *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="gr-subject">
                  <SelectValue placeholder="Pilih mapel..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gr-semester">Semester *</Label>
              <Select value={semesterId} onValueChange={setSemesterId}>
                <SelectTrigger id="gr-semester">
                  <SelectValue placeholder="Pilih semester..." />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.academicYear}){s.isActive ? ' — Aktif' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gr-score">Nilai *</Label>
                <Input
                  id="gr-score"
                  type="text"
                  placeholder="0-100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gr-grade">Huruf *</Label>
                <Input
                  id="gr-grade"
                  type="text"
                  placeholder="A/B/C/D/E"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  maxLength={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gr-predicate">Predikat</Label>
                <Input
                  id="gr-predicate"
                  type="text"
                  placeholder="Sangat Baik"
                  value={predicate}
                  onChange={(e) => setPredicate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !enrollmentId ||
                !subjectId ||
                !semesterId ||
                !score.trim() ||
                !grade.trim()
              }
            >
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
