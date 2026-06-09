import { getAnnouncements } from "@/actions/announcements";
import { AnnouncementsClient } from "@/features/announcements/AnnouncementsClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

export default async function AnnouncementsPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  const roleLevel = ctx?.roleLevel ?? 0;
  const announcementList = await getAnnouncements();
  return <AnnouncementsClient data={announcementList} roleLevel={roleLevel} />;
}
