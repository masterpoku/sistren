'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface StatusChangeFormProps {
  enrollmentId: number
}

export function StatusChangeForm({ enrollmentId }: StatusChangeFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleValueChange(value: string) {
    startTransition(async () => {
      const { updateEnrollmentStatus } = await import('@/actions/enrollments')
      await updateEnrollmentStatus(String(enrollmentId), value as 'transferred' | 'dropped' | 'graduated')
      router.refresh()
    })
  }

  return (
    <Select onValueChange={handleValueChange} required>
      <SelectTrigger className="w-[130px]" disabled={isPending}>
        <SelectValue placeholder="Ubah status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="transferred">Pindah</SelectItem>
        <SelectItem value="dropped">Dropout</SelectItem>
        <SelectItem value="graduated">Lulus</SelectItem>
      </SelectContent>
    </Select>
  )
}