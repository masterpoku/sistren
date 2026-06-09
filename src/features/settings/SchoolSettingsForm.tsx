"use client";

import { useState, useTransition } from "react";
import { batchUpdateSchoolSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SchoolSettingsFormProps {
  schoolName: string;
  schoolAddress: string;
  headmaster: string;
  npsn: string;
  nss: string;
}

export function SchoolSettingsForm({
  schoolName,
  schoolAddress,
  headmaster,
  npsn,
  nss,
}: SchoolSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(formData: FormData) {
    const data: Record<string, string> = {};
    const schoolNameVal = formData.get("schoolName") as string;
    const schoolAddressVal = formData.get("schoolAddress") as string;
    const headmasterVal = formData.get("headmaster") as string;
    const npsnVal = formData.get("npsn") as string;
    const nssVal = formData.get("nss") as string;

    if (schoolNameVal) data.schoolName = schoolNameVal;
    if (schoolAddressVal) data.schoolAddress = schoolAddressVal;
    if (headmasterVal) data.headmaster = headmasterVal;
    if (npsnVal) data.npsn = npsnVal;
    if (nssVal) data.nss = nssVal;

    startTransition(async () => {
      setStatus("idle");
      setErrorMessage("");

      const result = await batchUpdateSchoolSettings(data);

      if ("error" in result) {
        setStatus("error");
        setErrorMessage(result.error);
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Sekolah</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolName">Nama Sekolah</Label>
              <Input
                id="schoolName"
                name="schoolName"
                defaultValue={schoolName}
                placeholder="SMK Terpadu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headmaster">Nama Kepala Sekolah</Label>
              <Input
                id="headmaster"
                name="headmaster"
                defaultValue={headmaster}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npsn">NPSN</Label>
              <Input
                id="npsn"
                name="npsn"
                defaultValue={npsn}
                placeholder="8 digit angka"
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nss">NSS</Label>
              <Input
                id="nss"
                name="nss"
                defaultValue={nss}
                placeholder="12 digit angka (opsional)"
                maxLength={12}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolAddress">Alamat Sekolah</Label>
            <Input
              id="schoolAddress"
              name="schoolAddress"
              defaultValue={schoolAddress}
              placeholder="Alamat lengkap"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            {status === "saved" && (
              <span className="text-sm text-green-600">Tersimpan!</span>
            )}
            {status === "error" && (
              <span className="text-sm text-destructive">{errorMessage}</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
