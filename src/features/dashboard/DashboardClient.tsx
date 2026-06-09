"use client";

import {
  Bell,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Student,
  TrendUp,
  User,
  Users,
  Wallet,
} from "@phosphor-icons/react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface DashboardClientProps {
  name: string;
  roleLevel: number;
  stats?: {
    totalStudents?: number;
    totalTeachers?: number;
    activeEnrollments?: number;
    pendingAnnouncements?: number;
    assignedClasses?: number;
    assignedSubjects?: number;
    ownEnrollmentStatus?: string;
  };
}

const mockAcademicRecords = [
  { semester: "Sem 1", gpa: 3.85 },
  { semester: "Sem 2", gpa: 3.92 },
  { semester: "Sem 3", gpa: 3.78 },
  { semester: "Sem 4", gpa: 3.95 },
  { semester: "Sem 5", gpa: 3.88 },
];

const mockRegistrationData = [
  { name: "Jan", total: 40 },
  { name: "Feb", total: 65 },
  { name: "Mar", total: 120 },
  { name: "Apr", total: 180 },
];

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-xs">{title}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function DashboardClient({
  name,
  roleLevel,
  stats,
}: DashboardClientProps) {
  const isAlumni = roleLevel === 20;
  const isSiswa = roleLevel === 40;
  const isGuru = roleLevel === 60;
  const isAdmin = roleLevel >= 80;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {isAlumni && (
        <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4 shadow-sm">
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
          {isAlumni ? "Dashboard Alumni" : `Selamat Datang, ${name}`}
        </h1>
        <p className="text-muted-foreground">
          {isAlumni
            ? "Berikut adalah ringkasan riwayat Anda selama di SMK TERPADU."
            : "Berikut adalah ringkasan aktivitas akademik Anda hari ini."}
        </p>
      </div>

      {(isSiswa || isAlumni) && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Nilai Rata-rata" value="88.5" icon={BookOpen} />
            <StatCard title="Mata Pelajaran" value="12" icon={GraduationCap} />
            <StatCard title="Tagihan SPP" value="Lunas" icon={Wallet} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Grafik Nilai Rata-rata</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      gpa: { label: "Nilai", color: "#0f172a" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockAcademicRecords}>
                        <defs>
                          <linearGradient
                            id="colorGpa"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#0f172a"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#0f172a"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltipContent />
                        <Area
                          type="monotone"
                          dataKey="gpa"
                          name="Nilai"
                          stroke="#0f172a"
                          fillOpacity={1}
                          fill="url(#colorGpa)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Jadwal Hari Ini</CardTitle>
                <CardDescription>Kamis, 2 April 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      time: "07:30 - 10:00",
                      subject: "Sistem Terdistribusi",
                      room: "Lab. Komputer 1",
                      type: "Teori",
                    },
                    {
                      time: "10:30 - 13:00",
                      subject: "Kecerdasan Buatan",
                      room: "Ruang Kelas X-TKJ",
                      type: "Teori",
                    },
                    {
                      time: "14:00 - 16:30",
                      subject: "Praktikum Jaringan Komputer",
                      room: "Lab. Jaringan",
                      type: "Praktikum",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex h-2 w-2 translate-y-2 rounded-full bg-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.subject}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.time}</span>
                          <span className="mx-1">•</span>
                          <span>{item.room}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="mt-1 text-[10px] py-0"
                        >
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isAdmin && stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.totalStudents !== undefined && (
              <StatCard
                title="Total Siswa"
                value={stats.totalStudents.toLocaleString()}
                icon={Users}
              />
            )}
            {stats.totalTeachers !== undefined && (
              <StatCard
                title="Total Guru"
                value={stats.totalTeachers.toLocaleString()}
                icon={Users}
              />
            )}
            {stats.activeEnrollments !== undefined && (
              <StatCard
                title="Enrollment Aktif"
                value={stats.activeEnrollments.toLocaleString()}
                icon={GraduationCap}
              />
            )}
            {stats.pendingAnnouncements !== undefined && (
              <StatCard
                title="Pengumuman"
                value={stats.pendingAnnouncements.toLocaleString()}
                icon={Bell}
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Statistik Pendaftaran Siswa</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      total: { label: "Pendaftaran", color: "#0f172a" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockRegistrationData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltipContent />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#0f172a"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-none">
                          Pendaftaran Siswa Baru #{i + 100}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 jam yang lalu
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Baru
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isGuru && stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.assignedClasses !== undefined && (
              <StatCard
                title="Kelas Diampu"
                value={stats.assignedClasses}
                icon={GraduationCap}
              />
            )}
            {stats.assignedSubjects !== undefined && (
              <StatCard
                title="Mapel Diampu"
                value={stats.assignedSubjects}
                icon={BookOpen}
              />
            )}
            <StatCard
              title="Jadwal Hari Ini"
              value="4 Sesi"
              icon={CalendarCheck}
            />
            <StatCard title="Tugas Belum Dinilai" value="18" icon={TrendUp} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Rata-rata Kelas</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={{
                      gpa: { label: "IP", color: "#0f172a" },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockAcademicRecords}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltipContent />
                        <Line
                          type="monotone"
                          dataKey="gpa"
                          name="IP"
                          stroke="#0f172a"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-none">
                          Tugas #{i} belum dinilai
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i} jam yang lalu
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Profil Saya
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

        {(roleLevel === 40 || roleLevel >= 80) && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Pembayaran
              </CardTitle>
              <CardDescription>Riwayat &amp; status SPP</CardDescription>
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" /> Pengumuman
            </CardTitle>
            <CardDescription>Info &amp; pengumuman</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/announcements">
              <Button variant="outline" size="sm" className="w-full">
                Buka
              </Button>
            </Link>
          </CardContent>
        </Card>

        {roleLevel >= 60 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Akademik
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

        {roleLevel >= 60 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Student className="h-4 w-4" /> Siswa
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

        {roleLevel >= 80 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Guru
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
