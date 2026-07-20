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

type RegistrationStat = { name: string; total: number };
type GpaPoint = { semester: string; gpa: number };
type TodayEvent = {
  id: number;
  title: string;
  description: string | null;
  startAt: Date | string;
  endAt: Date | string | null;
  category: string | null;
};
type ActivityItem = {
  id: number;
  action: string;
  entityType: string | null;
  userName: string | null;
  createdAt: Date | string;
};
type AnnouncementItem = {
  id: number;
  title: string;
  createdAt: Date | string | null;
};

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
    ownClassName?: string | null;
    ownClassCode?: string | null;
  };
  registrationStats?: RegistrationStat[];
  gpaHistory?: GpaPoint[];
  todaySchedule?: TodayEvent[];
  teacherClassAverages?: GpaPoint[];
  recentActivities?: ActivityItem[];
  recentAnnouncements?: AnnouncementItem[];
  currentGpa?: number;
  subjectCount?: number;
  sppStatus?: "paid" | "unpaid" | "unknown";
  sessionsToday?: number;
  pendingGrading?: number;
}

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

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function relativeTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam yang lalu`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} hari yang lalu`;
  return DATE_FORMATTER.format(d);
}

function QuickMenu({ roleLevel }: { roleLevel: number }) {
  return (
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
            <Link href={roleLevel === 40 ? "/payments" : "/finance"}>
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
  );
}

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function DashboardClient({
  name,
  roleLevel,
  stats,
  registrationStats = [],
  gpaHistory = [],
  todaySchedule = [],
  teacherClassAverages = [],
  recentActivities = [],
  recentAnnouncements = [],
  currentGpa = 0,
  subjectCount = 0,
  sppStatus = "unknown",
  sessionsToday = 0,
  pendingGrading = 0,
}: DashboardClientProps) {
  const isAlumni = roleLevel === 20;
  const isSiswa = roleLevel === 40;
  const isGuru = roleLevel === 60;
  const isAdmin = roleLevel >= 80;

  const sppLabel =
    sppStatus === "paid"
      ? "Lunas"
      : sppStatus === "unpaid"
        ? "Belum Bayar"
        : "—";

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

      <QuickMenu roleLevel={roleLevel} />

      {(isSiswa || isAlumni) && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {isSiswa && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-xs">Kelas</CardDescription>
                  <Student className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.ownClassCode ?? "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.ownClassName ?? ""}
                  </p>
                </CardContent>
              </Card>
            )}
            <StatCard
              title="Nilai Rata-rata"
              value={currentGpa > 0 ? currentGpa.toFixed(2) : "—"}
              icon={BookOpen}
            />
            <StatCard
              title="Mata Pelajaran"
              value={subjectCount}
              icon={GraduationCap}
            />
            <StatCard title="Tagihan SPP" value={sppLabel} icon={Wallet} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Grafik Nilai Rata-rata</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {gpaHistory.length > 0 ? (
                    <ChartContainer
                      config={{
                        gpa: { label: "Nilai", color: "#0f172a" },
                      }}
                      className="h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gpaHistory}>
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
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Belum ada data nilai.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Jadwal Hari Ini</CardTitle>
                <CardDescription>
                  {DATE_FORMATTER.format(new Date())}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-6">
                    {todaySchedule.map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        <div className="flex h-2 w-2 translate-y-2 rounded-full bg-primary" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTime(item.startAt)}</span>
                            {item.endAt ? (
                              <>
                                <span className="mx-1">•</span>
                                <span>s/d {formatTime(item.endAt)}</span>
                              </>
                            ) : null}
                          </div>
                          {item.category ? (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-[10px] py-0"
                            >
                              {item.category}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    Tidak ada jadwal hari ini.
                  </div>
                )}
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
                  {registrationStats.some((s) => s.total > 0) ? (
                    <ChartContainer
                      config={{
                        total: { label: "Pendaftaran", color: "#0f172a" },
                      }}
                      className="h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={registrationStats}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Belum ada data pendaftaran.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.slice(0, 20).map((a) => (
                      <div key={a.id} className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {a.action}
                            {a.entityType ? ` (${a.entityType})` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.userName ? `${a.userName} • ` : ""}
                            {relativeTime(a.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    Belum ada aktivitas tercatat.
                  </div>
                )}
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
              value={`${sessionsToday} Sesi`}
              icon={CalendarCheck}
            />
            <StatCard
              title="Tugas Belum Dinilai"
              value={pendingGrading}
              icon={TrendUp}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Rata-rata Kelas</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  {teacherClassAverages.length > 0 ? (
                    <ChartContainer
                      config={{
                        gpa: { label: "IP", color: "#0f172a" },
                      }}
                      className="h-[300px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={teacherClassAverages}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
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
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Belum ada data kelas.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.slice(0, 20).map((a) => (
                      <div key={a.id} className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {a.action}
                            {a.entityType ? ` (${a.entityType})` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.userName ? `${a.userName} • ` : ""}
                            {relativeTime(a.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    Belum ada aktivitas tercatat.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {recentAnnouncements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pengumuman Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentAnnouncements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{a.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {relativeTime(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
