'use client'

import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG = {
  active: { label: 'Aktif', className: 'bg-green-100 text-green-800 border-green-300' },
  transferred: { label: 'Pindah', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  dropped: { label: 'Dropout', className: 'bg-red-100 text-red-800 border-red-300' },
  graduated: { label: 'Lulus', className: 'bg-purple-100 text-purple-800 border-purple-300' },
} as const

type EnrollmentStatus = keyof typeof STATUS_CONFIG

interface EnrollmentStatusBadgeProps {
  status: string
}

export function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status as EnrollmentStatus] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}