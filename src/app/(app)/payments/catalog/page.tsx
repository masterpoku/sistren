import { getActivePaymentItems } from "@/actions/paymentItems";
import { PaymentCatalogClient } from "@/features/payments/PaymentCatalogClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function PaymentCatalogPage() {
  await verifyRoleLevel(40);
  const items = await getActivePaymentItems();
  return <PaymentCatalogClient items={items} />;
}
