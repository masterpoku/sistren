import { getRppDocuments } from "@/actions/rpp";
import { RppAdminClient } from "@/features/rpp/RppAdminClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function RppAdminPage() {
  await verifyRoleLevel(80);
  const result = await getRppDocuments({ status: "submitted" });
  const documents = !("error" in result) ? result.documents : [];

  return <RppAdminClient documents={documents} />;
}
