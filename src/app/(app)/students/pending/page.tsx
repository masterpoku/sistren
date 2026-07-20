import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { PendingClient } from "./pending-client";

export default async function PendingVerificationPage() {
  const session = await verifySession();

  const [profile] = await db
    .select({ verificationStatus: profiles.verificationStatus })
    .from(profiles)
    .where(and(eq(profiles.userId, session.userId), isNull(profiles.deletedAt)))
    .limit(1);

  if (!profile || profile.verificationStatus === "verified") {
    redirect("/dashboard");
  }

  if (profile.verificationStatus === "draft" || profile.verificationStatus === "rejected") {
    redirect("/students/profile/complete");
  }

  return <PendingClient />;
}
