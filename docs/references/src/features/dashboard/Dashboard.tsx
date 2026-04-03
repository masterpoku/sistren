import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ACADEMIC_RECORDS, User } from "@/src/constants";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { GraduationCap, BookOpen, Calendar, Clock, MapPin, Users, TrendingUp, CreditCard, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const isAlumni = user.role === "alumni";
  const isSiswa = user.role === "siswa";
  const isGuru = user.role === "guru";
  const isAdmin = user.role === "administrator" || user.role === "superadmin";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {isAlumni && (
        <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-yellow-900">Selamat Datang di Portal Alumni!</h2>
            <p className="text-xs text-yellow-800/80">Ini adalah dashboard khusus alumni SMK TERPADU. Anda dapat melihat riwayat akademik dan status administrasi terakhir Anda.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAlumni ? "Dashboard Alumni" : `Selamat Datang, ${user.name}`}
        </h1>
        <p className="text-muted-foreground">
          {isAlumni 
            ? "Berikut adalah ringkasan riwayat Anda selama di SMK TERPADU."
            : "Berikut adalah ringkasan aktivitas akademik Anda hari ini."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isSiswa || isAlumni ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nilai Rata-rata</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88.5</div>
                <p className="text-xs text-muted-foreground">+2.5 dari semester lalu</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Semester Genap 2023/2024</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presensi Siswa</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">Sangat Disiplin</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tagihan SPP</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Lunas</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 0</div>
                <p className="text-xs text-muted-foreground">Bulan April 2026</p>
              </CardContent>
            </Card>
          </>
        ) : isAdmin ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,240</div>
                <p className="text-xs text-muted-foreground">+12 pendaftar baru hari ini</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86</div>
                <p className="text-xs text-muted-foreground">Aktif mengajar</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendapatan SPP</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 450jt</div>
                <p className="text-xs text-muted-foreground">Bulan berjalan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Surat Keluar/Masuk</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Perlu diproses</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4 Sesi</div>
                <p className="text-xs text-muted-foreground">Kelas X-TKJ, XI-RPL</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tugas Belum Dinilai</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">Dari 3 mata pelajaran</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Kelas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84.5</div>
                <p className="text-xs text-muted-foreground">Meningkat 2%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Input Raport</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">60%</div>
                <p className="text-xs text-muted-foreground">Selesai diinput</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {isAdmin ? "Statistik Pendaftaran Siswa" : "Grafik Nilai Rata-rata"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {isAdmin ? (
                  <LineChart data={[
                    { name: "Jan", total: 40 },
                    { name: "Feb", total: 65 },
                    { name: "Mar", total: 120 },
                    { name: "Apr", total: 180 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <AreaChart data={MOCK_ACADEMIC_RECORDS.map(r => ({ ...r, gpa: r.gpa * 20 + 10 }))}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#004a99" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#004a99" stopOpacity={0}/>
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
              {isAdmin ? "Aktivitas Terbaru" : "Jadwal Hari Ini"}
            </CardTitle>
            {!isAdmin && <CardDescription>Kamis, 2 April 2026</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isAdmin ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">
                        Pendaftaran Siswa Baru #{i + 100}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 jam yang lalu
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">Baru</Badge>
                  </div>
                ))
              ) : (
                [
                  { time: "07:30 - 10:00", subject: "Sistem Terdistribusi", room: "Lab. Komputer 1", type: "Teori" },
                  { time: "10:30 - 13:00", subject: "Kecerdasan Buatan", room: "Ruang Kelas X-TKJ", type: "Teori" },
                  { time: "14:00 - 16:30", subject: "Praktikum Jaringan Komputer", room: "Lab. Jaringan", type: "Praktikum" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-2 w-2 translate-y-2 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.subject}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{item.time}</span>
                        <span className="mx-1">•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{item.room}</span>
                      </div>
                      <Badge variant="secondary" className="mt-1 text-[10px] py-0">{item.type}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
