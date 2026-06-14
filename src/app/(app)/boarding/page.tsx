import { BoardingClient } from "@/features/boarding/BoardingClient";
import { verifySession } from "@/lib/auth/verify-session";

export default async function BoardingPage() {
  const { email, name } = await verifySession();
  return <BoardingClient email={email} name={name} />;
}
