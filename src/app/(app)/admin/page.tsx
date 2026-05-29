import { verifyRoleLevel } from '@/lib/auth/verify-session';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  await verifyRoleLevel(80);
  redirect('/admin/users');
}
