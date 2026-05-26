import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Redirect already logged-in users to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
