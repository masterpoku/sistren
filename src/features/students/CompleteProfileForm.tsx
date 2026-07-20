"use client";

import { Upload, Warning } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadDocument } from "@/actions/documents";
import { submitProfile } from "@/actions/verification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Religion = { id: number; name: string };
type Major = { id: number; name: string };

type ProfileData = {
  previousSchool: string | null;
  nik: string | null;
  nisn: string | null;
  birthPlace: string | null;
  birthDate: Date | string | null;
  gender: string | null;
  birthOrder: number | null;
  siblingsCount: number | null;
  address: string | null;
  weightKg: number | null;
  heightCm: number | null;
  phone: string | null;
  religionId: number | null;
  diplomaNumber: string | null;
  skhuNumber: string | null;
  fatherName: string | null;
  fatherBirthPlace: string | null;
  fatherBirthDate: Date | string | null;
  fatherNik: string | null;
  fatherOccupation: string | null;
  motherName: string | null;
  motherBirthPlace: string | null;
  motherBirthDate: Date | string | null;
  motherNik: string | null;
  motherOccupation: string | null;
  parentsAddress: string | null;
  parentsPhone: string | null;
  majorId: number | null;
  uniformSize: string | null;
  rejectionReason: string | null;
};

interface CompleteProfileFormProps {
  userId: string;
  profile: ProfileData | null;
  userName: string;
  religions: Religion[];
  majors: Major[];
  rejected?: boolean;
}

const DOCUMENT_FIELDS: { key: string; label: string }[] = [
  { key: "kk", label: "Kartu Keluarga (KK)" },
  { key: "ktpAyah", label: "KTP Ayah" },
  { key: "ktpIbu", label: "KTP Ibu" },
  { key: "ijasah", label: "Ijazah Legalisir Asli" },
  { key: "aktaKelahiran", label: "Akta Kelahiran" },
  { key: "nisnDocument", label: "NISN" },
  { key: "kip", label: "KIP (Kartu Indonesia Pintar)" },
  { key: "passFoto", label: "Foto Siswa 3x4 Berwarna" },
];

function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return value;
}

export function CompleteProfileForm({
  userId,
  profile,
  userName,
  religions,
  majors,
  rejected,
}: CompleteProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const formRef = useRef<HTMLFormElement>(null);

  function handleFile(key: string, file: File | null) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setLoading(true);

    const uploads = DOCUMENT_FIELDS.filter((f) => files[f.key]);

    for (const doc of uploads) {
      const file = files[doc.key];
      if (!file) continue;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("studentId", userId);
      fd.append("documentType", doc.key);
      const result = await uploadDocument(fd);
      if (result && "error" in result) {
        setError(`Gagal unggah ${doc.label}: ${result.error}`);
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    const fields = [
      "previousSchool","nik","birthPlace","birthDate","gender",
      "birthOrder","siblingsCount","address","weightKg","heightCm",
      "phone","religionId","diplomaNumber","skhuNumber",
      "fatherName","fatherBirthPlace","fatherBirthDate","fatherNik","fatherOccupation",
      "motherName","motherBirthPlace","motherBirthDate","motherNik","motherOccupation",
      "parentsAddress","parentsPhone","majorId","uniformSize",
    ];
    for (const f of fields) {
      const v = form.querySelector<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(`[name="${f}"]`);
      if (v) formData.append(f, v.value);
    }
    const result = await submitProfile(formData);

    if (result && "error" in result) {
      setError(result.error ?? null);
      setLoading(false);
    } else {
      router.push("/students/pending");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 print:p-0"
    >
      {rejected && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <Warning className="h-4 w-4 shrink-0" />
            <span>Data Anda sebelumnya ditolak. Silakan perbaiki dan kirim ulang.</span>
          </div>
          {profile?.rejectionReason && (
            <div className="ml-6 border-l-2 border-destructive/30 pl-3 text-destructive/80">
              <span className="font-medium">Alasan: </span>
              {profile.rejectionReason}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <Warning className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Data Diri Siswa
        </h1>
        <p className="text-muted-foreground">
          Lengkapi data diri Anda untuk verifikasi akun
        </p>
      </div>

      {/* Data Pribadi */}
      <Card>
        <CardHeader>
          <CardTitle>Data Pribadi</CardTitle>
          <CardDescription>
            Informasi lengkap tentang diri siswa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input value={userName} disabled />
            </div>
            <div className="space-y-2">
              <Label>NISN</Label>
              <Input value={profile?.nisn ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nik">Nomor NIK</Label>
              <Input
                id="nik"
                name="nik"
                defaultValue={profile?.nik ?? ""}
                placeholder="Nomor Induk Kependudukan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previousSchool">Asal Sekolah</Label>
              <Input
                id="previousSchool"
                name="previousSchool"
                defaultValue={profile?.previousSchool ?? ""}
                placeholder="Nama sekolah sebelumnya"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Tempat Lahir</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                defaultValue={profile?.birthPlace ?? ""}
                placeholder="Kota kelahiran"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Tanggal Lahir</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={toDateInput(profile?.birthDate)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <select
                id="gender"
                name="gender"
                defaultValue={profile?.gender ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih...</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthOrder">Anak Ke</Label>
              <Input
                id="birthOrder"
                name="birthOrder"
                type="number"
                min="1"
                defaultValue={profile?.birthOrder ?? ""}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siblingsCount">Jumlah Saudara</Label>
              <Input
                id="siblingsCount"
                name="siblingsCount"
                type="number"
                min="0"
                defaultValue={profile?.siblingsCount ?? ""}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Berat Badan (Kg)</Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                min="0"
                defaultValue={profile?.weightKg ?? ""}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCm">Tinggi Badan (cm)</Label>
              <Input
                id="heightCm"
                name="heightCm"
                type="number"
                min="0"
                defaultValue={profile?.heightCm ?? ""}
                placeholder="160"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon / Nomor HP</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="religionId">Agama</Label>
              <select
                id="religionId"
                name="religionId"
                defaultValue={profile?.religionId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih agama...</option>
                {religions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diplomaNumber">Nomor Ijazah</Label>
              <Input
                id="diplomaNumber"
                name="diplomaNumber"
                defaultValue={profile?.diplomaNumber ?? ""}
                placeholder="Nomor ijazah SMP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skhuNumber">Nomor SKHUN</Label>
              <Input
                id="skhuNumber"
                name="skhuNumber"
                defaultValue={profile?.skhuNumber ?? ""}
                placeholder="Nomor SKHUN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="majorId">Jurusan</Label>
              <select
                id="majorId"
                name="majorId"
                defaultValue={profile?.majorId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih jurusan...</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniformSize">Ukuran Seragam</Label>
              <select
                id="uniformSize"
                name="uniformSize"
                defaultValue={profile?.uniformSize ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih ukuran...</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <textarea
              id="address"
              name="address"
              defaultValue={profile?.address ?? ""}
              placeholder="Jl. Raya No. 1, Kecamatan, Kota"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Ayah */}
      <Card>
        <CardHeader>
          <CardTitle>Data Ayah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Nama Ayah</Label>
              <Input
                id="fatherName"
                name="fatherName"
                defaultValue={profile?.fatherName ?? ""}
                placeholder="Nama lengkap ayah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherBirthPlace">Tempat Lahir Ayah</Label>
              <Input
                id="fatherBirthPlace"
                name="fatherBirthPlace"
                defaultValue={profile?.fatherBirthPlace ?? ""}
                placeholder="Kota kelahiran ayah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherBirthDate">Tanggal Lahir Ayah</Label>
              <Input
                id="fatherBirthDate"
                name="fatherBirthDate"
                type="date"
                defaultValue={toDateInput(profile?.fatherBirthDate)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherNik">NIK Ayah</Label>
              <Input
                id="fatherNik"
                name="fatherNik"
                defaultValue={profile?.fatherNik ?? ""}
                placeholder="Nomor Induk Kependudukan ayah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherOccupation">Pekerjaan Ayah</Label>
              <Input
                id="fatherOccupation"
                name="fatherOccupation"
                defaultValue={profile?.fatherOccupation ?? ""}
                placeholder="Pekerjaan ayah"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Ibu */}
      <Card>
        <CardHeader>
          <CardTitle>Data Ibu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motherName">Nama Ibu</Label>
              <Input
                id="motherName"
                name="motherName"
                defaultValue={profile?.motherName ?? ""}
                placeholder="Nama lengkap ibu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherBirthPlace">Tempat Lahir Ibu</Label>
              <Input
                id="motherBirthPlace"
                name="motherBirthPlace"
                defaultValue={profile?.motherBirthPlace ?? ""}
                placeholder="Kota kelahiran ibu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherBirthDate">Tanggal Lahir Ibu</Label>
              <Input
                id="motherBirthDate"
                name="motherBirthDate"
                type="date"
                defaultValue={toDateInput(profile?.motherBirthDate)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherNik">NIK Ibu</Label>
              <Input
                id="motherNik"
                name="motherNik"
                defaultValue={profile?.motherNik ?? ""}
                placeholder="Nomor Induk Kependudukan ibu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherOccupation">Pekerjaan Ibu</Label>
              <Input
                id="motherOccupation"
                name="motherOccupation"
                defaultValue={profile?.motherOccupation ?? ""}
                placeholder="Pekerjaan ibu"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alamat & Kontak Orang Tua */}
      <Card>
        <CardHeader>
          <CardTitle>Alamat & Kontak Orang Tua</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentsAddress">Alamat Orang Tua</Label>
              <textarea
                id="parentsAddress"
                name="parentsAddress"
                defaultValue={profile?.parentsAddress ?? ""}
                placeholder="Jl. Raya No. 1, Kecamatan, Kota"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentsPhone">Nomor Telepon Orang Tua</Label>
              <Input
                id="parentsPhone"
                name="parentsPhone"
                type="tel"
                defaultValue={profile?.parentsPhone ?? ""}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dokumen */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Dokumen</CardTitle>
          <CardDescription>
            Unggah dokumen pendukung (format: gambar atau PDF, maksimal 16MB per file)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_FIELDS.map((doc) => (
              <div key={doc.key} className="space-y-2">
                <Label htmlFor={doc.key}>{doc.label}</Label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor={doc.key}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {files[doc.key]
                      ? files[doc.key]!.name
                      : "Pilih file..."}
                  </label>
                  {files[doc.key] && (
                    <button
                      type="button"
                      onClick={() => handleFile(doc.key, null)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <input
                  id={doc.key}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFile(doc.key, e.target.files?.[0] ?? null)
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 print:hidden">
        <Button
          type="submit"
          className="w-full h-11"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan & Ajukan Verifikasi"}
        </Button>
      </div>
    </form>
  );
}
