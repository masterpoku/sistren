"use client";

import { useState, useTransition } from "react";
import { uploadDocument } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DOCUMENT_TYPES = [
  { value: "ijasah", label: "Ijazah (SMP)" },
  { value: "skhun", label: "SKHUN" },
  { value: "skl", label: "Surat Keterangan Lulus" },
  { value: "aktaKelahiran", label: "Akta Kelahiran" },
  { value: "kk", label: "Kartu Keluarga" },
  { value: "ktpAyah", label: "KTP Ayah" },
  { value: "ktpIbu", label: "KTP Ibu" },
  { value: "kip", label: "KIP" },
  { value: "passFoto", label: "Pas Foto 3x4" },
  { value: "rapor", label: "Rapor" },
];

interface DocumentUploadFormProps {
  studentId: string;
}

export function DocumentUploadForm({ studentId }: DocumentUploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(formData: FormData) {
    setErrorMessage("");
    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (result && "error" in result && result.error) {
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <input type="hidden" name="studentId" value={studentId} />

      <div className="space-y-2">
        <Label htmlFor="documentType">Jenis Dokumen</Label>
        <Select name="documentType" required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih dokumen" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((dt) => (
              <SelectItem key={dt.value} value={dt.value}>
                {dt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File (PDF/Gambar, maks 16MB)</Label>
        <input
          type="file"
          id="file"
          name="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium"
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Mengunggah..." : "Unggah"}
        </Button>
      </div>

      {errorMessage && (
        <p className="col-span-full text-sm text-destructive">{errorMessage}</p>
      )}
    </form>
  );
}
