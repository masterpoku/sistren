'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/client';
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
import {
  GraduationCap,
  ShieldCheck,
  Student,
  Warning,
} from '@phosphor-icons/react';
import { loginAction } from '@/actions/auth';

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);
      if (result && 'error' in result) {
        setError(result.error);
      }
      // redirect happens via loginAction for success case
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', 'Password123!');
    setLoading(true);
    loginAction(formData)
      .then((result) => {
        if (result && 'error' in result) {
          setError(result.error);
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Terjadi kesalahan.');
        setLoading(false);
      });
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
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <Warning className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@sistren.sch.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? 'Memuat...' : 'Masuk'}
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
              onClick={() => quickLogin('superadmin@sister.com')}
            >
              <ShieldCheck className="mr-1 h-3 w-3" /> Superadmin
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('admin@sister.com')}
            >
              <ShieldCheck className="mr-1 h-3 w-3" /> Admin
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('guru@sister.com')}
            >
              <ShieldCheck className="mr-1 h-3 w-3" /> Guru
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-[10px] h-8"
              onClick={() => quickLogin('siswa@sister.com')}
            >
              <Student className="mr-1 h-3 w-3" /> Siswa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
