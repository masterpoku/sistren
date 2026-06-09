import { and, eq, isNull } from "drizzle-orm";
import { ProfileClient } from "@/features/profile/ProfileClient";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { profiles, religions } from "@/lib/db/schema";

async function getProfile(userId: string) {
  const [result] = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      phone: profiles.phone,
      address: profiles.address,
      fatherName: profiles.fatherName,
      motherName: profiles.motherName,
      nisn: profiles.nisn,
      birthPlace: profiles.birthPlace,
      birthDate: profiles.birthDate,
      gender: profiles.gender,
      religionName: religions.name,
    })
    .from(profiles)
    .leftJoin(religions, eq(profiles.religionId, religions.id))
    .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
    .limit(1);
  return result;
}

export default async function ProfilePage() {
  const session = await verifySession();
  const profile = await getProfile(session.userId);
  return (
    <ProfileClient
      profile={profile ?? null}
      sessionName={session.name}
      sessionEmail={session.email}
    />
  );
}
