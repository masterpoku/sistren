'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MOCK_ACCOUNTS } from '@/util/mock/users';
import {
  GraduationCap,
  UserPlus,
  ShieldCheck,
  Student,
} from '@phosphor-icons/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (MOCK_ACCOUNTS[email]) {
      const user = MOCK_ACCOUNTS[email];
      localStorage.setItem('sistren_user', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      setError('Email atau password salah.');
    }
  };

  const quickLogin = (email: string) => {
    const user = MOCK_ACCOUNTS[email];
    localStorage.setItem('sistren_user', JSON.stringify(user));
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            SISTREN
          </h1>
          <p className="text-slate-500">
            Sistem Informasi Pesantren - SMK TERPADU
          </p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Masuk</CardTitle>
            <CardDescription>
              Masukkan email Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@sistren.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                Masuk
              </Button>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Atau
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full h-11"
                type="button"
                onClick={() => router.push('/register')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                PPDB - Pendaftaran Siswa Baru
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-3">
          <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
            Quick Login (Demo)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('superadmin@sistren.sch.id')}
            >
              <ShieldCheck className="mr-1 h-3 w-3" /> Superadmin
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('admin@sistren.sch.id')}
            >
              <ShieldCheck className="mr-1 h-3 w-3" /> Admin
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('guru@sistren.sch.id')}
            >
              <ShieldCheck className="mr-1 h-3 w-3" /> Guru
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('siswa@sistren.sch.id')}
            >
              <Student className="mr-1 h-3 w-3" /> Siswa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
