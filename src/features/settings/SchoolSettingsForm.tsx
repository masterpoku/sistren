"use client";

import { useState, useTransition } from "react";
import { batchUpdateSchoolSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SYSTEM_CONFIG_KEYS } from "@/lib/db/system-config-keys";

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
    const schoolNameVal = formData.get(
      SYSTEM_CONFIG_KEYS.SCHOOL_NAME
    ) as string;
    const schoolAddressVal = formData.get(
      SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS
    ) as string;
    const headmasterVal = formData.get(SYSTEM_CONFIG_KEYS.HEADMASTER) as string;
    const npsnVal = formData.get(SYSTEM_CONFIG_KEYS.NPSN) as string;
    const nssVal = formData.get(SYSTEM_CONFIG_KEYS.NSS) as string;

    if (schoolNameVal) data[SYSTEM_CONFIG_KEYS.SCHOOL_NAME] = schoolNameVal;
    if (schoolAddressVal)
      data[SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS] = schoolAddressVal;
    if (headmasterVal) data[SYSTEM_CONFIG_KEYS.HEADMASTER] = headmasterVal;
    if (npsnVal) data[SYSTEM_CONFIG_KEYS.NPSN] = npsnVal;
    if (nssVal) data[SYSTEM_CONFIG_KEYS.NSS] = nssVal;

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
              <Label htmlFor={SYSTEM_CONFIG_KEYS.SCHOOL_NAME}>
                Nama Sekolah
              </Label>
              <Input
                id={SYSTEM_CONFIG_KEYS.SCHOOL_NAME}
                name={SYSTEM_CONFIG_KEYS.SCHOOL_NAME}
                defaultValue={schoolName}
                placeholder="SMK Terpadu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={SYSTEM_CONFIG_KEYS.HEADMASTER}>
                Nama Kepala Sekolah
              </Label>
              <Input
                id={SYSTEM_CONFIG_KEYS.HEADMASTER}
                name={SYSTEM_CONFIG_KEYS.HEADMASTER}
                defaultValue={headmaster}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={SYSTEM_CONFIG_KEYS.NPSN}>NPSN</Label>
              <Input
                id={SYSTEM_CONFIG_KEYS.NPSN}
                name={SYSTEM_CONFIG_KEYS.NPSN}
                defaultValue={npsn}
                placeholder="8 digit angka"
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={SYSTEM_CONFIG_KEYS.NSS}>NSS</Label>
              <Input
                id={SYSTEM_CONFIG_KEYS.NSS}
                name={SYSTEM_CONFIG_KEYS.NSS}
                defaultValue={nss}
                placeholder="12 digit angka (opsional)"
                maxLength={12}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS}>
              Alamat Sekolah
            </Label>
            <Input
              id={SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS}
              name={SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS}
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
