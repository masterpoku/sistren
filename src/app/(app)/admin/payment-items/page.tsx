import { getSemesters } from "@/actions/academic";
import {
  createPaymentItem,
  getPaymentItems,
  updatePaymentItem,
} from "@/actions/paymentItems";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { PaymentItemDialog } from "@/features/payments/PaymentItemDialog";
import { PaymentItemForm } from "@/features/payments/PaymentItemForm";
import { PaymentItemsClient } from "@/features/payments/PaymentItemsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function AdminPaymentItemsPage() {
  await verifyRoleLevel(80);

  const [items, semesters] = await Promise.all([
    getPaymentItems(),
    getSemesters(),
  ]);

  return (
    <PageShell
      title="Item Pembayaran"
      description="Katalog item tagihan — SPP, uang gedung, dll."
      actions={
        <PaymentItemDialog
          mode="create"
          semesters={semesters}
          createAction={createPaymentItem}
          updateAction={updatePaymentItem}
          trigger={<Button>+ Tambah Item</Button>}
        >
          <PaymentItemForm semesters={semesters} />
        </PaymentItemDialog>
      }
    >
      <PaymentItemsClient items={items} semesters={semesters} />
    </PageShell>
  );
}
