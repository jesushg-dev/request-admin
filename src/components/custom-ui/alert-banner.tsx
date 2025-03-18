'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const alertBannerVariants = cva('relative w-full flex items-center justify-between border transition-colors duration-200', {
  variants: {
    variant: {
      default: 'bg-background text-foreground border-border',
      success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800/30',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800/30',
      error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800/30',
      info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800/30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertBannerVariants> {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  visible?: boolean;
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(({ className, variant, title, description, icon, onClose, visible, children, ...props }, ref) => {
  const [isVisibleInternal, setIsVisibleInternal] = React.useState(true);
  const isVisible = visible !== undefined ? visible : isVisibleInternal;

  const handleClose = () => {
    if (visible === undefined) {
      setIsVisibleInternal(false);
    }
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert ref={ref} className={cn(alertBannerVariants({ variant }), 'z-50', className)} {...props}>
      <div className="flex items-start gap-4">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          {title && <AlertTitle className="text-base font-semibold">{title}</AlertTitle>}
          {description && <AlertDescription className="mt-1 text-sm opacity-90">{description}</AlertDescription>}
          {children}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={handleClose}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </Alert>
  );
});
AlertBanner.displayName = 'AlertBanner';

export { AlertBanner, alertBannerVariants };
