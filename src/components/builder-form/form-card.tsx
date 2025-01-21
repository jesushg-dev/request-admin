'use client';

import { Link } from '@/i18n/routing';
import { useDraggable } from '@dnd-kit/core';
import { Form } from '@prisma/client';
import { formatDistance } from 'date-fns';
import { ArrowRightIcon, BookOpenCheckIcon, FilePenLineIcon, ViewIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import ClientOnly from '../client-only';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface FormCardProps {
  form: Form;
  className?: string;
}

export function FormCard({ form, className }: FormCardProps) {
  const t = useTranslations('admin.formBuilder.main');

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{form.name}</span>
          {form.published && <Badge>{t('published')}</Badge>}
          {!form.published && <Badge variant="destructive">{t('draft')}</Badge>}
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-sm text-muted-foreground">
          {formatDistance(form.createdAt, new Date(), {
            addSuffix: true,
          })}
          {form.published && (
            <span className="flex items-center gap-2">
              <ViewIcon className="text-muted-foreground" size={14} />
              <span>{form.visits.toLocaleString()}</span>
              <BookOpenCheckIcon className="text-muted-foreground" size={14} />
              <span>{form.submissions.toLocaleString()}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[20px] truncate text-sm text-muted-foreground">{form.description ?? t('noDescription')}</CardContent>
      <CardFooter>
        {form.published && (
          <Button asChild className="text-md z-50 mt-2 w-full gap-4">
            <Link href={{ pathname: '/admin/[tenantId]/form-designer/[slug]', params: { tenantId: form.tenantId, slug: form.id } }}>
              {t('viewSubmissions')} <ArrowRightIcon />
            </Link>
          </Button>
        )}
        {!form.published && (
          <Button asChild variant="secondary" className="text-md mt-2 w-full gap-4">
            <Link href={{ pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId: form.tenantId, slug: form.id } }}>
              {t('editForm')} <FilePenLineIcon />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function Draggable<T extends { id: string }>({ data, children }: { data: T; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: data.id,
    data: data,
  });

  return (
    <ClientOnly>
      <div ref={setNodeRef} {...listeners} {...attributes}>
        {children}
      </div>
    </ClientOnly>
  );
}
