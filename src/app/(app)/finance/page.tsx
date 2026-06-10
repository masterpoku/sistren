import { and, eq, isNull } from "drizzle-orm";
import { getPayments, recordPayment } from "@/actions/payments";
import { FinanceClient } from "@/features/finance/FinanceClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { paymentItems, roles, users } from "@/lib/db/schema";

export default async function FinancePage() {
  await verifyRoleLevel(80);

  const [paymentList, studentRows, catalogItems] = await Promise.all([
    getPayments(),
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
    />
  );
}
