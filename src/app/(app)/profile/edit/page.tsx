import { redirect } from 'next/navigation'
import { fetchUserProfile } from '@/actions/profile'
import { ProfileEditClient } from '@/features/profile/ProfileEditClient'

export default async function ProfileEditPage() {
  const { user, profile } = await fetchUserProfile()
  
  if (!user) {
    redirect('/login')
  }
  
  return <ProfileEditClient profile={profile} user={user} />
}