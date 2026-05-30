import { db } from '@/lib/db';
import { profiles, religions } from '@/lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { verifySession } from '@/lib/auth/verify-session';
import { updateProfile } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function getProfile(userId: string) {
  const [result] = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      type: profiles.type,
      previousSchool: profiles.previousSchool,
      nik: profiles.nik,
      nisn: profiles.nisn,
      birthPlace: profiles.birthPlace,
      birthDate: profiles.birthDate,
      gender: profiles.gender,
      address: profiles.address,
      birthOrder: profiles.birthOrder,
      siblingsCount: profiles.siblingsCount,
      weightKg: profiles.weightKg,
      heightCm: profiles.heightCm,
      phone: profiles.phone,
      religionId: profiles.religionId,
      religionName: religions.name,
      diplomaNumber: profiles.diplomaNumber,
      skhuNumber: profiles.skhuNumber,
      majorId: profiles.majorId,
      uniformSize: profiles.uniformSize,
      section: profiles.section,
      enrolledAt: profiles.enrolledAt,
      fatherName: profiles.fatherName,
      motherName: profiles.motherName,
    })
    .from(profiles)
    .leftJoin(religions, eq(profiles.religionId, religions.id))
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
    .limit(1);
  return result;
}

export default async function ProfilePage() {
  const session = await verifySession();
  const profile = await getProfile(session.userId);

  return (
    <div className="max-w-2xl flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola data diri dan informasi orang tua.
        </p>
      </div>

      {/* Avatar Section */}
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
                {session.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">{session.name}</p>
              <p className="text-xs text-muted-foreground">{session.email}</p>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                Ubah Foto Profil
              </Button>
              <p className="text-[10px] text-muted-foreground">Fitur upload belum tersedia.</p>
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
          <form
            action={async (formData: FormData) => {
              'use server';
              const result = await updateProfile(formData);
              if (result && 'error' in result) {
                throw new Error(result.error);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  defaultValue={profile?.phone ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Jl. Raya No. 1, Kota"
                  defaultValue={profile?.address ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nama Ayah</Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="Nama ayah"
                  defaultValue={profile?.fatherName ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nama Ibu</Label>
                <Input
                  id="motherName"
                  name="motherName"
                  placeholder="Nama ibu"
                  defaultValue={profile?.motherName ?? ''}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Immutable fields — read only */}
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
              <p className="font-medium">{profile?.nisn ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tempat Lahir</p>
              <p className="font-medium">{profile?.birthPlace ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Lahir</p>
              <p className="font-medium">
                {profile?.birthDate?.toLocaleDateString('id-ID') ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Jenis Kelamin</p>
              <p className="font-medium capitalize">{profile?.gender ?? '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Agama</p>
              <p className="font-medium">{profile?.religionName ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
