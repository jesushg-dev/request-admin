'use client';

import { Poppins } from 'next/font/google';
import { I18Link, Link } from '@/i18n/routing';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

import { Button } from '../ui/button';

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
});

interface CardWrapperProps {
  children: React.ReactNode;
  headerTitle: string;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: I18Link;
}

export const CardWrapper = ({ children, headerTitle, headerLabel, backButtonLabel, backButtonHref }: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-md rounded-xl z-50">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={cn('text-3xl font-semibold text-center', font.className)}>{headerTitle}</h1>
          <p className="text-muted-foreground text-sm">{headerLabel}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <Button variant="link" className="w-full font-normal" size="sm" asChild>
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
