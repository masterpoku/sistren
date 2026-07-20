"use client";

import { ArrowLeft, Check, User } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

type ClassItem = {
  id: number;
  name: string;
  code: string;
  majorId: number | null;
  capacity: number | null;
};

type Major = { id: number; name: string };

type StudentItem = {
  id: string;
  name: string;
  email: string;
  nisn: string | null;
  majorId: number | null;
  majorName: string | null;
};

interface UnassignedClientProps {
  classes: ClassItem[];
  majors: Major[];
}

export function UnassignedClient({ classes, majors }: UnassignedClientProps) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMajorId, setFilterMajorId] = useState<string>("");
  const [targetClassId, setTargetClassId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function loadStudents() {
    setLoading(true);
    const { getUnassignedStudents } = await import("@/actions/enrollments");
    const result = await getUnassignedStudents(
      filterMajorId ? Number(filterMajorId) : undefined
    );
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error ?? "Gagal memuat data");
      setStudents([]);
    } else {
      setStudents(result.students);
    }
    setSelectedIds(new Set());
  }

  useEffect(() => {
    loadStudents();
  }, [filterMajorId]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  }

  async function handleAssign() {
    if (!targetClassId || selectedIds.size === 0) return;
    setBusy(true);
    const { batchAssignStudents } = await import("@/actions/enrollments");
    const result = await batchAssignStudents(
      Array.from(selectedIds),
      Number(targetClassId)
    );
    setBusy(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(
      `${result.inserted} siswa berhasil dimasukkan ke kelas.`
    );
    setSelectedIds(new Set());
    loadStudents();
  }

  const majorMap = new Map(majors.map((m) => [m.id, m.name]));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href="/students/manage-class">
          <Button type="button" variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Siswa Tanpa Kelas
          </h1>
          <p className="text-muted-foreground">
            Pilih siswa, tentukan kelas, lalu masukkan.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Jurusan</label>
            <Select
              value={filterMajorId}
              onValueChange={(v) => setFilterMajorId(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua Jurusan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jurusan</SelectItem>
                {majors.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-sm font-medium">Kelas Tujuan</label>
            <Select value={targetClassId} onValueChange={setTargetClassId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.code} — {c.capacity ? `${c.capacity} siswa` : "Tanpa batas"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={
              selectedIds.size === 0 || !targetClassId || busy
            }
          >
            {busy
              ? "Memproses..."
              : `Masukkan ke Kelas (${selectedIds.size})`}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Memuat data siswa...
        </p>
      ) : students.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {filterMajorId
            ? "Tidak ada siswa tanpa kelas di jurusan ini."
            : "Semua siswa terverifikasi sudah memiliki kelas."}
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {students.length} siswa ditemukan
              {filterMajorId &&
                ` — ${majorMap.get(Number(filterMajorId)) ?? ""}`}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={selectAll}
            >
              {selectedIds.size === students.length
                ? "Batal Pilih Semua"
                : "Pilih Semua"}
            </Button>
          </div>
          {students.map((s) => {
            const selected = selectedIds.has(s.id);
            const classMatch = classes.find(
              (c) =>
                Number(targetClassId) === c.id &&
                c.majorId &&
                c.majorId === s.majorId
            );
            return (
              <div
                key={s.id}
                onClick={() => toggleSelect(s.id)}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                  selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-6 items-center justify-center rounded border ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selected && <Check className="size-4" />}
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <User className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                       NISN: {s.nisn ?? "-"} · Jurusan:{" "}
                      {s.majorName ?? "-"}
                    </p>
                  </div>
                </div>
                {targetClassId && classMatch && (
                  <Badge variant="outline" className="text-xs">
                    Cocok
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
