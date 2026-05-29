import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MagnifyingGlass, Tray, FolderOpen, Bell, FileText } from '@phosphor-icons/react';

type EmptyIcon = 'search' | 'inbox' | 'folder' | 'bell' | 'file';

const ICONS: Record<EmptyIcon, React.ElementType> = {
  search: MagnifyingGlass,
  inbox: Tray,
  folder: FolderOpen,
  bell: Bell,
  file: FileText,
};

interface EmptyStateProps {
  icon?: EmptyIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}