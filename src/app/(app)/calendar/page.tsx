import { getEvents } from "@/actions/calendar";
import { CalendarClient } from "@/features/calendar/CalendarClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";

export default async function CalendarPage() {
	await verifyRoleLevel(40);
	const session = await verifySession();
	const ctx = await getAuthContext(session.userId);
	const canManage = (ctx?.roleLevel ?? 0) >= 80;
	const events = await getEvents({});

	return <CalendarClient initialEvents={events} canManage={canManage} />;
}
