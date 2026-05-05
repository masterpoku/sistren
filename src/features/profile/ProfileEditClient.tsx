'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface SessionUser {
  id: string
  name: string
  email: string
  roleName: string
  roleId: number
}

interface ProfileData {
  id: number
  userId: number
  type: string | null
  name: string | null
  nik: string | null
  nisn: string | null
  birthPlace: string | null
  birthDate: Date | null
  gender: string | null
  address: string | null
  phone: string | null
  religion: string | null
  fatherName: string | null
  motherName: string | null
  parentsPhone: string | null
}

interface ProfileEditClientProps {
  profile: ProfileData | null | undefined
  user: SessionUser
}

export function ProfileEditClient({ profile, user }: ProfileEditClientProps) {
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: call updateProfile server action
    setLoading(false)
  }
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profil</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>
            Perbarui informasi profil Anda di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  defaultValue={profile?.name || user.name}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  defaultValue={profile?.phone || ''}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  defaultValue={profile?.nik || ''}
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir</Label>
                <Input
                  id="birthPlace"
                  defaultValue={profile?.birthPlace || ''}
                  placeholder="Kota/Kabupaten"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  defaultValue={profile?.birthDate 
                    ? new Date(profile.birthDate).toISOString().split('T')[0] 
                    : ''}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                defaultValue={profile?.address || ''}
                placeholder="Alamat lengkap"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nama Ayah</Label>
                <Input
                  id="fatherName"
                  defaultValue={profile?.fatherName || ''}
                  placeholder="Nama ayah"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nama Ibu</Label>
                <Input
                  id="motherName"
                  defaultValue={profile?.motherName || ''}
                  placeholder="Nama ibu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentsPhone">No. HP Orang Tua</Label>
                <Input
                  id="parentsPhone"
                  defaultValue={profile?.parentsPhone || ''}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Agama</Label>
                <Input
                  id="religion"
                  defaultValue={profile?.religion || ''}
                  placeholder="Agama"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}