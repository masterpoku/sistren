import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { DashboardClient } from './components';

export default async function DashboardPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  return (
    <DashboardClient
      name={session.name}
      role={ctx?.roleName ?? 'unknown'}
      roleLevel={ctx?.roleLevel ?? 0}
    />
  );
}
