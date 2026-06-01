'use client';

import { useState, useEffect } from 'react';
import { bulkUpsertGrades, getGrades } from '@/actions/grades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type ClassItem = { id: number; name: string; code: string };
type SubjectItem = { id: number; name: string; code: string | null };
type SemesterItem = {
  id: number;
  name: string;
  academicYear: string;
  isActive: boolean | null;
};

type GradeRow = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
  score: string;
  grade: string;
  predicate: string;
  dailyTest1: string;
  dailyTest2: string;
  dailyTest3: string;
  dailyTest4: string;
  midterm: string;
  finalExam: string;
  practical: string;
  project: string;
  portfolio: string;
};

interface Props {
  classes: ClassItem[];
  subjects: SubjectItem[];
  semesters: SemesterItem[];
  roleLevel: number;
  assignedSubjectIds: number[];
}

const GRADE_TYPES = [
  { value: 'knowledge', label: 'Pengetahuan' },
  { value: 'skill', label: 'Keterampilan' },
  { value: 'attitude', label: 'Sikap' },
];

export function GradesPageClient({
  classes,
  subjects,
  semesters,
  roleLevel,
  assignedSubjectIds,
}: Props) {
  const [semesterId, setSemesterId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeType, setGradeType] = useState('knowledge');
  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Filter subjects for teachers
  const availableSubjects =
    roleLevel === 60
      ? subjects.filter((s) => assignedSubjectIds.includes(s.id))
      : subjects;

  // Load grades when selector changes
  useEffect(() => {
    if (!classId || !subjectId || !semesterId) return;

    setLoading(true);
    setMessage(null);

    getGrades(Number(classId), Number(subjectId), Number(semesterId), gradeType)
      .then((data) => {
        // Map to editable rows
        if (data.length > 0) {
          setRows(
            data.map((g) => ({
              enrollmentId: g.enrollmentId,
              studentId: g.studentId,
              studentName: g.studentName,
              score: g.score ?? '',
              grade: g.grade ?? '',
              predicate: g.predicate ?? '',
              dailyTest1: g.dailyTest1 ?? '',
              dailyTest2: g.dailyTest2 ?? '',
              dailyTest3: g.dailyTest3 ?? '',
              dailyTest4: g.dailyTest4 ?? '',
              midterm: g.midterm ?? '',
              finalExam: g.finalExam ?? '',
              practical: g.practical ?? '',
              project: g.project ?? '',
              portfolio: g.portfolio ?? '',
            }))
          );
        } else {
          setRows([]);
        }
      })
      .catch(() => setMessage({ text: 'Gagal memuat data.', type: 'error' }))
      .finally(() => setLoading(false));
  }, [classId, subjectId, semesterId, gradeType]);

  function updateRow(index: number, field: keyof GradeRow, value: string) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    if (rows.length === 0) return;

    setSaving(true);
    setMessage(null);

    const payload = rows
      .filter((r) => r.enrollmentId > 0)
      .map((r) => ({
        enrollmentId: r.enrollmentId,
        subjectId: Number(subjectId),
        type: gradeType,
        score: r.score,
        grade: r.grade,
        predicate: r.predicate,
        dailyTest1: r.dailyTest1,
        dailyTest2: r.dailyTest2,
        dailyTest3: r.dailyTest3,
        dailyTest4: r.dailyTest4,
        midterm: r.midterm,
        finalExam: r.finalExam,
        practical: r.practical,
        project: r.project,
        portfolio: r.portfolio,
      }));

    const formData = new FormData();
    formData.append('rows', JSON.stringify(payload));

    const result = await bulkUpsertGrades(formData);

    if ('error' in result) {
      setMessage({ text: result.error ?? 'Gagal menyimpan.', type: 'error' });
    } else {
      setMessage({
        text: `✅ ${result.count ?? rows.length} nilai berhasil disimpan.`,
        type: 'success',
      });
      // Reload data
      getGrades(
        Number(classId),
        Number(subjectId),
        Number(semesterId),
        gradeType
      )
        .then((data) => {
          setRows(
            data.map((g) => ({
              enrollmentId: g.enrollmentId,
              studentId: g.studentId,
              studentName: g.studentName,
              score: g.score ?? '',
              grade: g.grade ?? '',
              predicate: g.predicate ?? '',
              dailyTest1: g.dailyTest1 ?? '',
              dailyTest2: g.dailyTest2 ?? '',
              dailyTest3: g.dailyTest3 ?? '',
              dailyTest4: g.dailyTest4 ?? '',
              midterm: g.midterm ?? '',
              finalExam: g.finalExam ?? '',
              practical: g.practical ?? '',
              project: g.project ?? '',
              portfolio: g.portfolio ?? '',
            }))
          );
        })
        .catch(() => {});
    }

    setSaving(false);
  }

  // When semester + class is selected, fetch enrolled students
  useEffect(() => {
    if (!classId || !semesterId) {
      setRows([]);
      return;
    }

    // Fetch enrolled students to populate empty rows
    async function fetchEnrollments() {
      try {
        const { getEnrollments } = await import('@/actions/enrollments');
        const enrollments = await getEnrollments({
          semesterId,
          status: 'active',
        });
        // Filter by classId on client side
        const filtered = enrollments.filter(
          (e: any) => e.classId === Number(classId)
        );

        setRows(
          filtered.map((e: any) => ({
            enrollmentId: e.id,
            studentId: e.studentId,
            studentName: e.studentName,
            score: '',
            grade: '',
            predicate: '',
            dailyTest1: '',
            dailyTest2: '',
            dailyTest3: '',
            dailyTest4: '',
            midterm: '',
            finalExam: '',
            practical: '',
            project: '',
            portfolio: '',
          }))
        );
      } catch {
        setRows([]);
      }
    }

    // Only reset if we don't have a subject/type selected (no grades fetch yet)
    if (!subjectId || !gradeType) {
      fetchEnrollments();
    }
  }, [classId, semesterId]);

  const showSubScores = gradeType === 'knowledge' || gradeType === 'skill';

  return (
    <div className="flex flex-col gap-6">
      {/* Selectors */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kelas & Mapel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={semesterId} onValueChange={setSemesterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
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

            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mapel</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableSubjects.length === 0
                        ? 'Tidak ada mapel'
                        : 'Pilih mapel'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                      {s.code ? ` (${s.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipe Nilai</Label>
              <Select value={gradeType} onValueChange={setGradeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-muted-foreground py-8">
          Memuat data...
        </div>
      )}

      {/* Empty state */}
      {!loading && classId && subjectId && semesterId && rows.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Belum ada nilai untuk kelas ini. Isi nilai lalu klik Simpan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No selectors */}
      {!classId && !subjectId && !semesterId && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Pilih semester, kelas, mapel, dan tipe nilai untuk memulai.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grade table */}
      {!loading && rows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Nilai</CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Semua'}
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Siswa</TableHead>
                  {showSubScores && (
                    <>
                      {gradeType === 'knowledge' && (
                        <>
                          <TableHead className="w-20">PH1</TableHead>
                          <TableHead className="w-20">PH2</TableHead>
                          <TableHead className="w-20">PH3</TableHead>
                          <TableHead className="w-20">PH4</TableHead>
                          <TableHead className="w-20">UTS</TableHead>
                          <TableHead className="w-20">UAS</TableHead>
                        </>
                      )}
                      {gradeType === 'skill' && (
                        <>
                          <TableHead className="w-20">Praktik</TableHead>
                          <TableHead className="w-20">Projek</TableHead>
                          <TableHead className="w-20">Portofolio</TableHead>
                        </>
                      )}
                    </>
                  )}
                  <TableHead className="w-24">Nilai</TableHead>
                  <TableHead className="w-20">Huruf</TableHead>
                  <TableHead className="w-28">Predikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.enrollmentId}>
                    <TableCell className="font-medium">
                      {row.studentName}
                    </TableCell>
                    {showSubScores && (
                      <>
                        {gradeType === 'knowledge' && (
                          <>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.dailyTest1}
                                onChange={(e) =>
                                  updateRow(i, 'dailyTest1', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.dailyTest2}
                                onChange={(e) =>
                                  updateRow(i, 'dailyTest2', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.dailyTest3}
                                onChange={(e) =>
                                  updateRow(i, 'dailyTest3', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.dailyTest4}
                                onChange={(e) =>
                                  updateRow(i, 'dailyTest4', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.midterm}
                                onChange={(e) =>
                                  updateRow(i, 'midterm', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.finalExam}
                                onChange={(e) =>
                                  updateRow(i, 'finalExam', e.target.value)
                                }
                              />
                            </TableCell>
                          </>
                        )}
                        {gradeType === 'skill' && (
                          <>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.practical}
                                onChange={(e) =>
                                  updateRow(i, 'practical', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.project}
                                onChange={(e) =>
                                  updateRow(i, 'project', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 w-20 text-sm"
                                value={row.portfolio}
                                onChange={(e) =>
                                  updateRow(i, 'portfolio', e.target.value)
                                }
                              />
                            </TableCell>
                          </>
                        )}
                      </>
                    )}
                    <TableCell>
                      <Input
                        className="h-8 w-20 text-sm"
                        value={row.score}
                        onChange={(e) => updateRow(i, 'score', e.target.value)}
                        placeholder="0-100"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-16 text-sm uppercase"
                        value={row.grade}
                        onChange={(e) =>
                          updateRow(i, 'grade', e.target.value.toUpperCase())
                        }
                        maxLength={2}
                        placeholder="A"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-24 text-sm"
                        value={row.predicate}
                        onChange={(e) =>
                          updateRow(i, 'predicate', e.target.value)
                        }
                        placeholder="Sangat Baik"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
