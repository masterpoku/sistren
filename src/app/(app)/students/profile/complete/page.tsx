import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/verify-session";
import { getMajors, getMyProfile, getReligions } from "@/actions/verification";
import { CompleteProfileForm } from "@/features/students/CompleteProfileForm";

export default async function CompleteProfilePage() {
  const session = await verifySession();
  const { profile, userName } = await getMyProfile();
  const religions = await getReligions();
  const majors = await getMajors();

  if (profile?.verificationStatus === "verified") {
    redirect("/dashboard");
  }

  const rejected = profile?.verificationStatus === "rejected";

  return (
    <div className="min-h-screen bg-slate-50">
      <CompleteProfileForm
        userId={session.userId}
        profile={profile}
        userName={userName}
        religions={religions}
        majors={majors}
        rejected={rejected}
      />
    </div>
  );
}
