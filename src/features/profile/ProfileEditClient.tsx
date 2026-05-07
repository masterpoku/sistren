'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ProfileData {
  id: number
  userId: number
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

interface UserData {
  id: number
  email: string
  name: string | null
  role?: {
    name: string
  } | null
}

interface ProfileEditClientProps {
  profile: ProfileData | null | undefined
  user: UserData
}

export function ProfileEditClient({ profile, user }: ProfileEditClientProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || user.name || '',
    phone: profile?.phone || '',
    nik: profile?.nik || '',
    birthPlace: profile?.birthPlace || '',
    birthDate: profile?.birthDate 
      ? new Date(profile.birthDate).toISOString().split('T')[0] 
      : '',
    address: profile?.address || '',
    fatherName: profile?.fatherName || '',
    motherName: profile?.motherName || '',
    parentsPhone: profile?.parentsPhone || '',
    religion: profile?.religion || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: call updateProfile server action
    try {
      console.log('Submitting profile update:', formData)
      // await updateProfile(formData)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
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
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => handleChange('nik', e.target.value)}
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => handleChange('birthPlace', e.target.value)}
                  placeholder="Kota/Kabupaten"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Alamat lengkap"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nama Ayah</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  placeholder="Nama ayah"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nama Ibu</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleChange('motherName', e.target.value)}
                  placeholder="Nama ibu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentsPhone">No. HP Orang Tua</Label>
                <Input
                  id="parentsPhone"
                  value={formData.parentsPhone}
                  onChange={(e) => handleChange('parentsPhone', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="religion">Agama</Label>
                <Input
                  id="religion"
                  value={formData.religion}
                  onChange={(e) => handleChange('religion', e.target.value)}
                  placeholder="Agama"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
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