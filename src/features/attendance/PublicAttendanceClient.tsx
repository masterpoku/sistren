"use client";

import { useMemo, useState } from "react";
import {
  getAttendanceSubjects,
  getPublicRoster,
  markPublicAttendance,
  verifyAttendancePassword,
} from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, CaretLeft, GraduationCap } from "@phosphor-icons/react";
import { useActionWithToast } from "@/hooks/use-action-with-toast";

const STATUS_OPTIONS: { value: string; label: string; active: string }[] = [
  { value: "present", label: "Hadir", active: "border-green-500 bg-green-50" },
  { value: "sick", label: "Sakit", active: "border-amber-500 bg-amber-50" },
  { value: "permit", label: "Izin", active: "border-blue-500 bg-blue-50" },
  { value: "absent", label: "Alpha", active: "border-red-500 bg-red-50" },
  { value: "late", label: "Terlambat", active: "border-orange-500 bg-orange-50" },
];

type ClassItem = {
  id: number;
  name: string;
  code: string;
  majorName: string | null;
  studentCount: number;
};

type SubjectItem = { id: number; name: string; code: string | null };
type RosterItem = {
  enrollmentId: number;
  studentId: string;
  studentName: string;
};

export function PublicAttendanceClient({ classes }: { classes: ClassItem[] }) {
  const [step, setStep] = useState<"class" | "subject" | "password" | "student">(
    "class"
  );
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(
    null
  );
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [password, setPassword] = useState("");
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [verifyError, setVerifyError] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  const [saveAttendance, isSaving] = useActionWithToast(
    async () => {
      const records = roster.map((r) => ({
        enrollmentId: r.enrollmentId,
        status: (statuses[r.enrollmentId] ?? "absent") as
          | "present"
          | "sick"
          | "permit"
          | "absent"
          | "late",
      }));
      const res = await markPublicAttendance({
        classId: selectedClass!.id,
        subjectId: selectedSubject!.id,
        records,
      });
      if ("error" in res) return res;
      setDone(true);
      return res;
    },
    { successMessage: "Absensi tersimpan." }
  );

  async function pickClass(c: ClassItem) {
    setSelectedClass(c);
    setLoadingSubjects(true);
    setVerifyError("");
    const subs = await getAttendanceSubjects(c.id);
    setSubjects(subs);
    setLoadingSubjects(false);
    setStep("subject");
  }

  async function pickSubject(s: SubjectItem) {
    setSelectedSubject(s);
    setVerifying(false);
    setVerifyError("");
    setPassword("");
    setStep("password");
  }

  async function handleVerify() {
    if (!selectedClass) return;
    setVerifying(true);
    setVerifyError("");
    const res = await verifyAttendancePassword(selectedClass.id, password);
    if ("error" in res) {
      setVerifyError(res.error ?? "Terjadi kesalahan.");
      setVerifying(false);
      return;
    }
    const r = await getPublicRoster(selectedClass.id);
    setRoster(r);
    setStatuses({});
    setVerifying(false);
    setStep("student");
  }

  const presentCount = useMemo(
    () => Object.values(statuses).filter((s) => s === "present").length,
    [statuses]
  );

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle className="size-16 text-green-500" weight="fill" />
          <h2 className="text-xl font-semibold">Absensi Selesai</h2>
          <p className="text-muted-foreground">
            {selectedClass?.code} · {selectedSubject?.name}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Absen Kelas Lain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {["class", "subject", "password", "student"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            {i < 3 && <span className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Back button */}
      {step !== "class" && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => {
            if (step === "student") setStep("password");
            else if (step === "password") setStep("subject");
            else {
              setSelectedClass(null);
              setSelectedSubject(null);
              setStep("class");
            }
          }}
        >
          <CaretLeft className="size-4" /> Kembali
        </Button>
      )}

      {/* Step 1: Pilih Kelas */}
      {step === "class" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickClass(c)}
              className="text-left"
            >
              <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">{c.code}</CardTitle>
                  <CardDescription>
                    {c.majorName ?? "Umum"} · Kelas {c.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="size-4" />
                    <span>{c.studentCount} siswa</span>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Pilih Mapel */}
      {step === "subject" && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Kelas <strong>{selectedClass?.code}</strong> · Pilih mata pelajaran
          </p>
          {loadingSubjects ? (
            <p className="text-sm text-muted-foreground">Memuat mapel...</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickSubject(s)}
                  className="text-left"
                >
                  <Card className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{s.name}</CardTitle>
                      {s.code && (
                        <CardDescription className="font-mono text-xs">
                          {s.code}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Password */}
      {step === "password" && (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Verifikasi</CardTitle>
                <CardDescription>
                  {selectedClass?.code} · {selectedSubject?.name}
                </CardDescription>
              </div>
              <p className="text-right text-xs text-muted-foreground">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="attendance-password" className="text-sm font-medium">
                Password Harian
              </label>
              <input
                id="attendance-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="Password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-lg tracking-widest ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {verifyError && (
                <p className="text-sm text-destructive">{verifyError}</p>
              )}
            </div>
            <Button
              className="w-full"
              disabled={verifying || !password}
              onClick={handleVerify}
            >
              {verifying ? "Memverifikasi..." : "Lanjut"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Absen Siswa */}
      {step === "student" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedClass?.code} · {selectedSubject?.name} ·{" "}
              {roster.length} siswa
            </p>
            <span className="text-sm text-muted-foreground">
              Hadir: {presentCount}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {roster.map((r) => {
              const current = statuses[r.enrollmentId] ?? "";
              return (
                <Card
                  key={r.enrollmentId}
                  className={`transition-all ${
                    current
                      ? STATUS_OPTIONS.find((o) => o.value === current)?.active
                      : ""
                  }`}
                >
                  <CardContent className="space-y-3 py-4">
                    <p className="font-medium">{r.studentName}</p>
                    <div className="grid grid-cols-5 gap-1">
                      {STATUS_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() =>
                            setStatuses((prev) => ({
                              ...prev,
                              [r.enrollmentId]: o.value,
                            }))
                          }
                          className={`rounded-md border px-1 py-2 text-xs font-medium transition-colors ${
                            current === o.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input hover:bg-muted"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button
              disabled={isSaving || roster.length === 0}
              onClick={saveAttendance}
            >
              {isSaving ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
