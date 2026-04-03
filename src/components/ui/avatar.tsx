import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg';
}

function Avatar({
  className,
  size = 'default',
  children,
  ...props
}: AvatarProps) {
  return (
    <div
      data-size={size}
      className={cn(
        'relative flex shrink-0 rounded-full select-none overflow-hidden',
        size === 'default' && 'size-8',
        size === 'sm' && 'size-6',
        size === 'lg' && 'size-10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={cn(
        'aspect-square size-full object-cover rounded-full',
        className
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const avatar = ref.current?.closest('[data-size]');
    const img = avatar?.querySelector('img');
    if (img && img.getAttribute('src')) {
      setHidden(true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground',
        hidden && 'hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
