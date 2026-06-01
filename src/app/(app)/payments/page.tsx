import { getPayments } from '@/actions/payments';
import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentFinanceClient } from '@/features/payments/StudentFinanceClient';

const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending: { label: 'Menunggu', variant: 'outline' },
  paid: { label: 'Lunas', variant: 'default' },
  cancelled: { label: 'Batal', variant: 'destructive' },
};

export default async function PaymentsPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  const roleLevel = ctx?.roleLevel ?? 0;

  const paymentList = await getPayments();

  // Siswa (level 40) — student finance view
  if (roleLevel === 40) {
    return <StudentFinanceClient payments={paymentList} />;
  }

  // Admin/Guru (level >= 60) — existing admin view
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pembayaran</h1>
        <p className="text-muted-foreground">
          Riwayat pembayaran SPP dan biaya sekolah.
        </p>
      </div>

      {paymentList.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Belum ada data pembayaran.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Kode</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Deskripsi
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Jumlah</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentList.map((p) => {
                    const statusInfo =
                      STATUS_LABELS[p.status ?? 'draft'] ?? STATUS_LABELS.draft;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {p.code}
                        </td>
                        <td className="px-4 py-3">{p.description}</td>
                        <td className="px-4 py-3 font-medium">
                          Rp {Number(p.total).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString(
                                'id-ID',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
