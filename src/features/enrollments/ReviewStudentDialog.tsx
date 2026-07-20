"use client";

import { Eye } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { getStudentReviewData } from "@/actions/verification";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type ReviewData = {
  profile: Record<string, unknown> | null;
  userName: string;
  userEmail: string;
  documents: { key: string; label: string; uploaded: boolean }[];
};

const GENDER_MAP: Record<string, string> = {
  male: "Laki-laki",
  female: "Perempuan",
};

const STATUS_MAP: Record<string, string> = {
  draft: "Draft",
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

function dateVal(v: unknown): string {
  if (!v) return "-";
  if (v instanceof Date) return v.toLocaleDateString("id-ID");
  if (typeof v === "string") return v;
  return "-";
}

function val(v: unknown): string {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

export function ReviewStudentDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getStudentReviewData(studentId)
      .then(setData)
      .catch(() => toast({ variant: "destructive", description: "Gagal memuat data" }))
      .finally(() => setLoading(false));
  }, [open, studentId, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-1" />
          Lihat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Data Siswa</DialogTitle>
          <DialogDescription>
            Data lengkap siswa yang diajukan untuk verifikasi
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Memuat...</p>}

        {data && (
          <div className="space-y-6">
            {/* Foto 3x4 + Identitas */}
            <section>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                Identitas
              </h3>
              <div className="flex gap-4">
                {(() => {
                  const doc = data.documents.find((d) => d.key === "passFoto");
                  if (!doc) return null;
                  return (
                    <a
                      href={`/api/documents/${studentId}/passFoto`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={`/api/documents/${studentId}/passFoto`}
                        alt={doc.label}
                        className="h-32 w-24 rounded border object-cover"
                      />
                    </a>
                  );
                })()}
                <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <Field label="Nama" value={data.userName} />
                  <Field label="Email" value={data.userEmail} />
                  <Field label="NISN" value={val(data.profile?.nisn)} />
                  <Field label="NIK" value={val(data.profile?.nik)} />
                  <Field label="Jurusan" value={val(data.profile?.majorName)} />
                  <Field label="Ukuran Seragam" value={val(data.profile?.uniformSize)} />
                  <Field label="Asal Sekolah" value={val(data.profile?.previousSchool)} />
                  <Field label="Tempat Lahir" value={val(data.profile?.birthPlace)} />
                  <Field label="Tanggal Lahir" value={dateVal(data.profile?.birthDate)} />
                  <Field label="Jenis Kelamin" value={GENDER_MAP[String(data.profile?.gender ?? "")] ?? val(data.profile?.gender)} />
                  <Field label="Anak Ke" value={val(data.profile?.birthOrder)} />
                  <Field label="Jumlah Saudara" value={val(data.profile?.siblingsCount)} />
                  <Field label="Berat Badan" value={data.profile?.weightKg ? `${data.profile.weightKg} Kg` : "-"} />
                  <Field label="Tinggi Badan" value={data.profile?.heightCm ? `${data.profile.heightCm} cm` : "-"} />
                  <Field label="Telepon" value={val(data.profile?.phone)} />
                  <Field label="Agama" value={val(data.profile?.religionName)} />
                  <Field label="Nomor Ijazah" value={val(data.profile?.diplomaNumber)} />
                  <Field label="Nomor SKHUN" value={val(data.profile?.skhuNumber)} />
                  <div className="col-span-2">
                    <Field label="Alamat" value={val(data.profile?.address)} />
                  </div>
                </div>
              </div>
            </section>

            {/* Verifikasi */}
            <section>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                Status Verifikasi
              </h3>
              <p className="text-sm">
                {STATUS_MAP[String(data.profile?.verificationStatus ?? "")] ??
                  val(data.profile?.verificationStatus)}
              </p>
            </section>

            {/* Ayah */}
            <section>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">Data Ayah</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Field label="Nama Ayah" value={val(data.profile?.fatherName)} />
                <Field label="Tempat Lahir" value={val(data.profile?.fatherBirthPlace)} />
                <Field label="Tanggal Lahir" value={dateVal(data.profile?.fatherBirthDate)} />
                <Field label="NIK" value={val(data.profile?.fatherNik)} />
                <Field label="Pekerjaan" value={val(data.profile?.fatherOccupation)} />
              </div>
            </section>

            {/* Ibu */}
            <section>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">Data Ibu</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Field label="Nama Ibu" value={val(data.profile?.motherName)} />
                <Field label="Tempat Lahir" value={val(data.profile?.motherBirthPlace)} />
                <Field label="Tanggal Lahir" value={dateVal(data.profile?.motherBirthDate)} />
                <Field label="NIK" value={val(data.profile?.motherNik)} />
                <Field label="Pekerjaan" value={val(data.profile?.motherOccupation)} />
              </div>
            </section>

            {/* Alamat Orang Tua */}
            <section>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                Alamat & Kontak Orang Tua
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="col-span-2">
                  <Field label="Alamat" value={val(data.profile?.parentsAddress)} />
                </div>
                <Field label="Telepon" value={val(data.profile?.parentsPhone)} />
              </div>
            </section>

            {/* Dokumen */}
            <section>
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">
                Dokumen Terupload
              </h3>
              {data.documents.filter((d) => d.key !== "passFoto").length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada dokumen lain.</p>
              ) : (
                <div className="space-y-2">
                  {data.documents
                    .filter((d) => d.key !== "passFoto")
                    .map((d) => (
                      <a
                        key={d.key}
                        href={`/api/documents/${studentId}/${d.key}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded border bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        {d.label}
                      </a>
                    ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
