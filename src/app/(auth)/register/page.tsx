'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GraduationCap, Warning } from '@phosphor-icons/react'
import { registerAction } from '@/actions/register'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await registerAction(formData)
      if (result && 'error' in result) {
        setError(result.error)
      }
      // redirect happens via registerAction on success
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes('NEXT_REDIRECT')
      ) {
        return // redirect is happening, do nothing
      }
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            PPDB
          </h1>
          <p className="text-slate-500">Penerimaan Siswa Baru - SMK TERPADU</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Formulir Pendaftaran</CardTitle>
            <CardDescription>
              Isi data dengan lengkap untuk mendaftar
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
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nama lengkap sesuai KK"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@ortu.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Data Siswa
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nisn">NISN</Label>
                    <Input id="nisn" name="nisn" placeholder="1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Tempat Lahir</Label>
                    <Input id="birthPlace" name="birthPlace" placeholder="Bandung" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Tanggal Lahir</Label>
                    <Input id="birthDate" name="birthDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <select
                      id="gender"
                      name="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Agama</Label>
                    <Input id="religion" name="religion" placeholder="Islam" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input id="address" name="address" placeholder="Jl. Raya No. 1" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Data Orang Tua
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Nama Ayah</Label>
                    <Input id="fatherName" name="fatherName" placeholder="Nama ayah" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Nama Ibu</Label>
                    <Input id="motherName" name="motherName" placeholder="Nama ibu" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? 'Memuat...' : 'Daftar'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <a href="/login" className="text-primary hover:underline">
                  Login di sini
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}