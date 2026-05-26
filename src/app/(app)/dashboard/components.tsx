'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  User,
  Wallet,
  Bell,
  GraduationCap,
  Student,
  Users,
} from '@phosphor-icons/react';

interface DashboardClientProps {
  name: string;
  role: string;
  roleLevel: number;
}

export function DashboardClient({
  name,
  role,
  roleLevel,
}: DashboardClientProps) {
  return (
    <div className="space-y-6">
      {/* Welcome + Role Badge */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Selamat datang, {name}</p>
        </div>
        <Badge variant="secondary" className="text-sm capitalize">
          {role}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profil Saya — all roles */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Profil Saya
            </CardTitle>
            <CardDescription>Kelola data pribadi</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="w-full">
                Buka
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pembayaran — siswa */}
        {(roleLevel === 40 || roleLevel >= 80) && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Pembayaran
              </CardTitle>
              <CardDescription>Riwayat & status SPP</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/finance">
                <Button variant="outline" size="sm" className="w-full">
                  Buka
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pengumuman — all roles */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Pengumuman
            </CardTitle>
            <CardDescription>Info & pengumuman</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/announcements">
              <Button variant="outline" size="sm" className="w-full">
                Buka
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Akademik — guru & admin */}
        {roleLevel >= 60 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Akademik
              </CardTitle>
              <CardDescription>Kelas, jurusan, mapel</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/academic">
                <Button variant="outline" size="sm" className="w-full">
                  Buka
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Siswa — admin/guru */}
        {roleLevel >= 60 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Student className="h-4 w-4" />
                Siswa
              </CardTitle>
              <CardDescription>Data siswa</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/students">
                <Button variant="outline" size="sm" className="w-full">
                  Buka
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Guru — admin only */}
        {roleLevel >= 80 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guru
              </CardTitle>
              <CardDescription>Data guru</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teachers">
                <Button variant="outline" size="sm" className="w-full">
                  Buka
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
