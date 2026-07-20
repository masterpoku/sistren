import { getAdminVerificationLists } from "@/actions/verification";
import { EnrollmentsClient } from "@/features/enrollments/EnrollmentsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function EnrollmentsPage() {
  await verifyRoleLevel(60);

  const { pending, verified, rejected } = await getAdminVerificationLists();

  return (
    <EnrollmentsClient
      pending={pending}
      verified={verified}
      rejected={rejected}
    />
  );
}
