import { verifyRoleLevel } from '@/lib/auth/verify-session';

export default async function BoardingPage() {
  await verifyRoleLevel(80);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asrama</h1>
        <p className="text-muted-foreground">
          Kelola data siswa boarding school.
        </p>
      </div>
      <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6">
        Modul Asrama - dalam pengembangan.
      </p>
    </div>
  );
}