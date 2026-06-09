import { BoardingClient } from "@/features/boarding/BoardingClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function BoardingPage() {
  await verifyRoleLevel(80);
  return <BoardingClient />;
}
