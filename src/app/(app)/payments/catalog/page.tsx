import { getSemesters } from "@/actions/academic";
import { getActivePaymentItems, getPaymentItems } from "@/actions/paymentItems";
import { PageShell } from "@/components/ui/page-shell";
import { PaymentCatalogClient } from "@/features/payments/PaymentCatalogClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

export default async function PaymentCatalogPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  const canManage = (ctx?.roleLevel ?? 0) >= 80;

  const [items, semesters] = await Promise.all([
    canManage ? getPaymentItems() : getActivePaymentItems(),
    getSemesters(),
  ]);

  return (
    <PageShell
      title="Katalog Pembayaran"
      description="Daftar item pembayaran yang tersedia di sekolah."
    >
      <PaymentCatalogClient
        items={items}
        semesters={semesters}
        canManage={canManage}
      />
    </PageShell>
  );
}
