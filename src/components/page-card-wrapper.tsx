import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type FooterAction = React.ReactNode;

interface PageCardWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footerActions?: FooterAction[];
  className?: string;
}

export const PageCardWrapper = ({ title, description, children, footerActions = [], className }: PageCardWrapperProps) => {
  return (
    <div className="flex flex-col gap-4 flex-1 p-4">
      <Card className={cn('w-full flex flex-col flex-1', className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>

        <CardContent>
          <div className="space-y-4">{children}</div>
        </CardContent>

        {footerActions.length > 0 && (
          <CardFooter className="flex justify-end gap-2">
            {footerActions.map((action, index) => (
              <React.Fragment key={index}>{action}</React.Fragment>
            ))}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
