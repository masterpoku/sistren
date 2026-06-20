import { and, eq, isNull } from "drizzle-orm";
import { getPayments, getPaymentSlips, recordPayment } from "@/actions/payments";
import { FinanceClient } from "@/features/finance/FinanceClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { paymentItems, roles, users } from "@/lib/db/schema";

export default async function FinancePage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  const canManage = (ctx?.roleLevel ?? 0) >= 80;

  const [paymentList, slips, studentRows, catalogItems] = await Promise.all([
    getPayments(),
    getPaymentSlips(canManage ? {} : {}),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(roles.level, 40), isNull(users.deletedAt))),
    db
      .select({
        id: paymentItems.id,
        code: paymentItems.code,
        name: paymentItems.name,
        description: paymentItems.description,
        standardPrice: paymentItems.standardPrice,
      })
      .from(paymentItems)
      .where(isNull(paymentItems.deletedAt))
      .orderBy(paymentItems.code),
  ]);

  return (
    <FinanceClient
      paymentList={paymentList}
      studentRows={studentRows}
      catalogItems={catalogItems}
      recordPayment={recordPayment}
      canManage={canManage}
      slips={slips}
    />
  );
}
