import { redirect } from 'next/navigation'
import { getSessionWithRole } from '@/lib/auth/get-session'
import { getProfile } from '@/lib/db/queries'
import { ProfileEditClient } from '@/features/profile/ProfileEditClient'

export default async function ProfileEditPage() {
  const { user: sessionUser } = await getSessionWithRole() || {}
  
  if (!sessionUser) {
    redirect('/login')
  }
  
  // For now, show own profile only
  const profileId = sessionUser.id
  const profile = await getProfile(parseInt(profileId))
  
  return <ProfileEditClient profile={profile} user={sessionUser} />
}