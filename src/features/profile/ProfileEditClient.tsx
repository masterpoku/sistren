'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateUserProfile } from '@/actions/profile'
import { useToast } from '@/hooks/use-toast'

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
  createdAt: Date | null
  updatedAt: Date | null
}

interface UserData {
  id: string
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
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: profile?.phone || '',
    nik: profile?.nik || '',
    birthPlace: profile?.birthPlace || '',
    birthDate: profile?.birthDate 
      ? new Date(profile.birthDate).toISOString().split('T')[0] 
      : '',
    address: profile?.address || '',
    religion: profile?.religion || '',
    gender: profile?.gender || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        nik: formData.nik,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        address: formData.address,
        religion: formData.religion,
        gender: formData.gender as 'male' | 'female' | undefined,
      })
      toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({ title: 'Error', description: 'Gagal memperbarui profil', variant: 'destructive' })
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
                <Label htmlFor="religion">Agama</Label>
                <Input
                  id="religion"
                  value={formData.religion}
                  onChange={(e) => handleChange('religion', e.target.value)}
                  placeholder="Agama"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Pilih</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
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