import { verifyRoleLevel } from '@/lib/auth/verify-session';

export default async function AttendancePage() {
  await verifyRoleLevel(60);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kehadiran</h1>
        <p className="text-muted-foreground">
          Kelola absensi siswa per semester.
        </p>
      </div>
      <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6">
        Modul Absensi - dalam pengembangan.
      </p>
    </div>
  );
}