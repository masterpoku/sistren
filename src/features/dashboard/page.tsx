'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Student,
  BookOpen,
  TrendUp,
  Bell,
  CreditCard,
  Note,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
} from 'phosphor-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fetchDashboardStats, getCurrentUserRole } from '@/actions/dashboard'

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalAnnouncements: number
  pendingPayments: number
  totalClasses: number
  totalMajors: number
}

interface SessionUser {
  id: string
  name: string
  email: string
  roleName: string
  roleId: number
  roleLevel: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboardStats, userRole] = await Promise.all([
          fetchDashboardStats(),
          getCurrentUserRole(),
        ])
        
        if (userRole) {
          setUser(userRole)
        }
        
        if (dashboardStats) {
          setStats(dashboardStats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const registrationData = [
    { name: 'Jan', total: 40 },
    { name: 'Feb', total: 65 },
    { name: 'Mar', total: 120 },
    { name: 'Apr', total: 180 },
  ]

  const chartData = [
    { semester: 'Sem 1', gpa: 85 },
    { semester: 'Sem 2', gpa: 88 },
    { semester: 'Sem 3', gpa: 82 },
    { semester: 'Sem 4', gpa: 90 },
  ]

  const isAlumni = user?.roleName === 'Alumni'
  const isSiswa = user?.roleName === 'Siswa'
  const isGuru = user?.roleName === 'Guru'
  const isAdmin = user?.roleName === 'Admin' || user?.roleName === 'Superadmin'

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {isAlumni && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-yellow-900">
              Selamat Datang di Portal Alumni!
            </h2>
            <p className="text-xs text-yellow-800/80">
              Ini adalah dashboard khusus alumni SMK TERPADU. Anda dapat melihat
              riwayat akademik dan status administrasi terakhir Anda.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAlumni
            ? 'Dashboard Alumni'
            : `Selamat Datang, ${user?.name || 'User'}`}
        </h1>
        <p className="text-muted-foreground">
          {isAlumni
            ? 'Berikut adalah ringkasan riwayat Anda selama di SMK TERPADU.'
            : 'Berikut adalah ringkasan aktivitas sekolah hari ini.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isSiswa || isAlumni ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nilai Rata-rata
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88.5</div>
                <p className="text-xs text-muted-foreground">
                  +2.5 dari semester lalu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mata Pelajaran
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Semester Genap 2023/2024
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presensi</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">Sangat Disiplin</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tagihan SPP
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Lunas
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 0</div>
                <p className="text-xs text-muted-foreground">
                  Bulan April 2026
                </p>
              </CardContent>
            </Card>
          </>
        ) : isAdmin ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Siswa
                </CardTitle>
                <Student className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStudents ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12 pendaftar baru hari ini
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Guru
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTeachers ?? 0}</div>
                <p className="text-xs text-muted-foreground">Aktif mengajar</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pendapatan SPP
                </CardTitle>
                <TrendUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatCurrency(stats.pendingPayments) : 'Rp 0'}
                </div>
                <p className="text-xs text-muted-foreground">Belum lunas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengumuman
                </CardTitle>
                <Note className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAnnouncements ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Pengumuman aktif
                </p>
              </CardContent>
            </Card>
          </>
        ) : isGuru ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Jadwal Hari Ini
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4 Sesi</div>
                <p className="text-xs text-muted-foreground">
                  Kelas X-TKJ, XI-RPL
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tugas Belum Dinilai
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  Dari 3 mata pelajaran
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rata-rata Kelas
                </CardTitle>
                <TrendUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84.5</div>
                <p className="text-xs text-muted-foreground">Meningkat 2%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Input Raport
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">60%</div>
                <p className="text-xs text-muted-foreground">Selesai diinput</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Siswa
                </CardTitle>
                <Student className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStudents ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Siswa aktif saat ini
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Guru
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTeachers ?? 0}</div>
                <p className="text-xs text-muted-foreground">Guru aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Belum Lunas
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingPayments ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Pembayaran bulan ini
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengumuman
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAnnouncements ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  Pengumuman aktif
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {isAdmin
                ? 'Statistik Pendaftaran Siswa'
                : 'Grafik Nilai Rata-rata'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {isAdmin ? (
                  <LineChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#004a99"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#004a99"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="gpa"
                      name="Nilai"
                      stroke="#004a99"
                      fillOpacity={1}
                      fill="url(#colorGpa)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>
              {isAdmin ? 'Aktivitas Terbaru' : 'Jadwal Hari Ini'}
            </CardTitle>
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                Kamis, 2 April 2026
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isAdmin ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">
                        Pendaftaran Siswa Baru Dibuka
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 jam yang lalu
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Umum
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">
                        Pembayaran SPP Bulan April
                      </p>
                      <p className="text-xs text-muted-foreground">
                        5 jam yang lalu
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Keuangan
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">
                        Jadwal Ujian Tengah Semester
                      </p>
                      <p className="text-xs text-muted-foreground">
                        1 hari yang lalu
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Akademik
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="mt-2 h-2 w-2 translate-y-2 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Sistem Terdistribusi
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>07:30 - 10:00</span>
                        <span className="mx-1">•</span>
                        <span>Lab. Komputer 1</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] py-0"
                      >
                        Teori
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-2 h-2 w-2 translate-y-2 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Kecerdasan Buatan
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>10:30 - 13:00</span>
                        <span className="mx-1">•</span>
                        <span>Ruang Kelas X-TKJ</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] py-0"
                      >
                        Teori
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-2 h-2 w-2 translate-y-2 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Praktikum Jaringan Komputer
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>14:00 - 16:30</span>
                        <span className="mx-1">•</span>
                        <span>Lab. Jaringan</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] py-0"
                      >
                        Praktikum
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}