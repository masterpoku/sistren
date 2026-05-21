'use client'

import { useEffect, useState } from 'react'
import { fetchUserProfile } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  UserCircle,
} from 'phosphor-react'
import Link from 'next/link'

interface UserData {
  id: string
  email: string
  name: string | null
  role?: {
    name: string
  }
}

interface ProfileData {
  id: number
  userId: number
  name?: string | null
  nik: string | null
  nisn?: string | null
  phone: string | null
  address: string | null
  birthPlace: string | null
  birthDate: Date | null
  gender: 'male' | 'female' | null
  religion: string | null
  fatherName?: string | null
  motherName?: string | null
  parentsPhone?: string | null
  majorId: number | null
  major?: { id: number | null; name: string } | null
}

const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrator',
  administrator: 'Administrator',
  guru: 'Guru',
  siswa: 'Siswa',
  alumni: 'Alumni',
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchUserProfile()
        if (data?.user) {
          setUser(data.user as UserData)
        }
        if (data?.profile) {
          setProfile(data.profile as ProfileData)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Gagal memuat profil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
          <p className="text-muted-foreground text-destructive">
            {error || 'Profil tidak ditemukan'}
          </p>
        </div>
      </div>
    )
  }

  const displayName = profile?.name || user.name || user.email
  const displayRole = user.role?.name || 'Unknown'
  const initials = displayName.substring(0, 2).toUpperCase()

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
                <AvatarFallback className="text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge className="mt-2 bg-primary text-primary-foreground">
                  {roleLabels[displayRole.toLowerCase()] || displayRole}
                </Badge>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/profile/edit">Ubah Foto Profil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informasi Pribadi</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/edit">Edit Profil</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <EnvelopeSimple className="h-4 w-4 text-primary" />
                  <span className="text-sm">{user.email || '-'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  No. HP
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profile?.phone || '-'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Alamat
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{profile?.address || '-'}</span>
                </div>
              </div>
              {profile?.religion && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Agama
                  </p>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="text-sm">{profile.religion}</span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Tempat, Tanggal Lahir
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {profile?.birthPlace || '-'},{' '}
                    {profile?.birthDate
                      ? new Date(profile.birthDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Jenis Kelamin
                </p>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm capitalize">
                    {profile?.gender === 'male'
                      ? 'Laki-laki'
                      : profile?.gender === 'female'
                        ? 'Perempuan'
                        : '-'}
                  </span>
                </div>
              </div>
            </div>

            {(profile?.nik || profile?.nisn) && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">Identitas</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile?.nik && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        NIK
                      </p>
                      <span className="text-sm">{profile.nik}</span>
                    </div>
                  )}
                  {profile?.nisn && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        NISN
                      </p>
                      <span className="text-sm">{profile.nisn}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(profile?.fatherName || profile?.motherName) && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">Data Orang Tua</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile?.fatherName && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Nama Ayah
                      </p>
                      <span className="text-sm">{profile.fatherName}</span>
                    </div>
                  )}
                  {profile?.motherName && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Nama Ibu
                      </p>
                      <span className="text-sm">{profile.motherName}</span>
                    </div>
                  )}
                  {profile?.parentsPhone && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        No. HP Orang Tua
                      </p>
                      <span className="text-sm">{profile.parentsPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}