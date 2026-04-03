import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarInsetProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarInset({ className, children }: SidebarInsetProps) {
  return (
    <div className={cn('flex flex-col flex-1', className)}>{children}</div>
  );
}
