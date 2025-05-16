import * as React from 'react';
import { I18Link, Link } from '@/i18n/routing';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button, type ButtonVariants } from '@/components/ui/button';

type Action = {
  label: string;
  variant?: ButtonVariants;
  icon?: LucideIcon;
} & ({ href: I18Link; onClick?: () => void } | { onClick: () => void; href?: I18Link });

export type EmptyStateProps = {
  title: string;
  description: string;
  icons?: LucideIcon[];
  className?: string;
  actions?: Action[];
};

function EmptyState({ title, description, icons = [], actions, className }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className={cn(
          'flex-1 border-2 border-dashed rounded-xl p-14 w-full',
          'bg-background border-border hover:border-border/80 text-center',
          'group hover:bg-muted/50 transition duration-500 hover:duration-200',
          className
        )}>
        <div className="flex justify-center isolate">
          {icons.length === 3 ? (
            <>
              <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                {React.createElement(icons[0], {
                  className: 'w-6 h-6 text-muted-foreground',
                })}
              </div>
              <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                {React.createElement(icons[1], {
                  className: 'w-6 h-6 text-muted-foreground',
                })}
              </div>
              <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                {React.createElement(icons[2], {
                  className: 'w-6 h-6 text-muted-foreground',
                })}
              </div>
            </>
          ) : (
            <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {icons[0] &&
                React.createElement(icons[0], {
                  className: 'w-6 h-6 text-muted-foreground',
                })}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-foreground font-medium mt-6">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{description}</p>
          <div className="flex justify-center mt-6 gap-2">
            {actions?.map((action) => {
              if (action.href) {
                return (
                  <Button key={action.label} asChild variant={action.variant ?? 'outline'}>
                    <Link href={action.href}>
                      {action.icon && <action.icon className="ml-2 h-4 w-4" />}
                      {action.label}
                    </Link>
                  </Button>
                );
              }

              return (
                <Button key={action.label} type="button" onClick={action.onClick} variant={action.variant ?? 'outline'}>
                  {action.icon && <action.icon className="ml-2 h-4 w-4" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
