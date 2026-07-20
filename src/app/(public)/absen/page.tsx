import { getActiveClasses } from "@/actions/attendance";
import { PublicAttendanceClient } from "@/features/attendance/PublicAttendanceClient";

export const dynamic = "force-dynamic";

export default async function PublicAttendancePage() {
  const classes = await getActiveClasses();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Absensi Siswa</h1>
        <p className="mt-1 text-muted-foreground">
          Pilih kelas, mata pelajaran, lalu masukkan password harian.
        </p>
      </div>
      <PublicAttendanceClient classes={classes} />
    </main>
  );
}
