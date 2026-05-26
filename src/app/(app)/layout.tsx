import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAuthContext } from '@/lib/auth/permissions';
import { auth } from '@/lib/auth';
import { AppLayoutClient } from '@/features/layout/AppLayoutClient';
import { ToastProvider } from '@/hooks/use-toast';

async function handleLogout() {
  'use server';
  const { headers } = await import('next/headers');
  await auth.api.signOut({ headers: await headers() });
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const ctx = await getAuthContext(session.user.id);

  if (!ctx) {
    redirect('/login');
  }

  return (
    <ToastProvider>
      <AppLayoutClient
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: ctx.roleName,
          roleId: ctx.roleId,
          roleLevel: ctx.roleLevel,
        }}
        onLogout={handleLogout}
      >
        {children}
      </AppLayoutClient>
    </ToastProvider>
  );
}
