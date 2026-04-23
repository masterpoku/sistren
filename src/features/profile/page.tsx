'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  Buildings,
  GraduationCap,
  Calendar,
} from 'phosphor-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('sistren_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    administrator: 'Administrator',
    guru: 'Guru',
    siswa: 'Siswa',
    alumni: 'Alumni',
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi pribadi dan data akademik Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-32 w-32 border-4 border-primary/10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {user.studentId || user.employeeId}
                </p>
                <Badge className="mt-2 bg-primary text-primary-foreground">
                  {roleLabels[user.role]}
                </Badge>
              </div>
              <Button className="w-full mt-4">Ubah Foto Profil</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <EnvelopeSimple className="h-4 w-4 text-primary" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Telepon
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">+62 812 3456 7890</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Alamat
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Jl. Kaliurang KM 5, Sleman, DIY
                  </span>
                </div>
              </div>
              {user.faculty && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Kompetensi Keahlian
                  </p>
                  <div className="flex items-center gap-2">
                    <Buildings className="h-4 w-4 text-primary" />
                    <span className="text-sm">{user.faculty}</span>
                  </div>
                </div>
              )}
              {user.major && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Instansi
                  </p>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="text-sm">{user.major}</span>
                  </div>
                </div>
              )}
              {user.graduationYear && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Tahun Lulus
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{user.graduationYear}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline">Edit Profil</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
