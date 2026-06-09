import { getPaymentMethods } from "@/actions/payments";
import { PaymentMethodsClient } from "@/features/payments/PaymentMethodsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function PaymentMethodsPage() {
  await verifyRoleLevel(80);
  const methodList = await getPaymentMethods();
  return <PaymentMethodsClient data={methodList} />;
}
