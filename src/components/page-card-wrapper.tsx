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
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <Card className={cn('w-full flex flex-col flex-1  overflow-hidden', className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>

        <CardContent className="overflow-hidden flex-1 flex">{children}</CardContent>

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
