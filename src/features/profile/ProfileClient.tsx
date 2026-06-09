"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateProfile } from "@/actions/profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type Profile = {
  id: number;
  userId: string;
  phone: string | null;
  address: string | null;
  fatherName: string | null;
  motherName: string | null;
  nisn: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  gender: string | null;
  religionName: string | null;
};

interface ProfileClientProps {
  profile: Profile | null;
  sessionName: string;
  sessionEmail: string;
}

export function ProfileClient({
  profile,
  sessionName,
  sessionEmail,
}: ProfileClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result && "error" in result) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola data diri dan informasi orang tua.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>
            Foto profil Anda akan muncul di pojok kanan atas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarFallback className="text-lg font-semibold">
                {sessionName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">{sessionName}</p>
              <p className="text-xs text-muted-foreground">{sessionEmail}</p>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                Ubah Foto Profil
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Fitur upload belum tersedia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Diri</CardTitle>
          <CardDescription>
            Nomor HP, alamat, dan informasi orang tua.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  defaultValue={profile?.phone ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Jl. Raya No. 1, Kota"
                  defaultValue={profile?.address ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nama Ayah</Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="Nama ayah"
                  defaultValue={profile?.fatherName ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nama Ibu</Label>
                <Input
                  id="motherName"
                  name="motherName"
                  placeholder="Nama ibu"
                  defaultValue={profile?.motherName ?? ""}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Pendaftaran</CardTitle>
          <CardDescription>
            Data ini tidak dapat diubah setelah pendaftaran.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">NISN</p>
              <p className="font-medium">{profile?.nisn ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tempat Lahir</p>
              <p className="font-medium">{profile?.birthPlace ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Lahir</p>
              <p className="font-medium">
                {profile?.birthDate?.toLocaleDateString("id-ID") ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Jenis Kelamin</p>
              <p className="font-medium capitalize">{profile?.gender ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Agama</p>
              <p className="font-medium">{profile?.religionName ?? "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
