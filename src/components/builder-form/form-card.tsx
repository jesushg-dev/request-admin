'use client';

import { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { useDraggable } from '@dnd-kit/core';
import { formatDistance } from 'date-fns';
import { ArrowRightIcon, BookOpenCheckIcon, FilePenLineIcon, GripVertical, ViewIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FormWithRelations } from '@/types/zenstackhq/form';
import { cn } from '@/lib/utils';

import ClientOnly from '../client-only';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface FormCardProps {
  form: FormWithRelations;
  children?: ReactNode;
  className?: string;
}

export function FormCard({ form, className, children }: FormCardProps) {
  const t = useTranslations('admin.form.main');

  return (
    <Card className={cn(className, 'w-full')} key={form.id}>
      <CardHeader>
        <div className="flex justify-between gap-2">
          <div className="flex flex-col gap-2 items-start">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="truncate font-bold">{form.name}</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground flex items-center justify-between text-sm gap-4">
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
          </div>
          <div className="flex flex-col gap-2 items-end">
            {children || (
              <div className="cursor-move rounded-sm p-2 hover:bg-accent">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground h-[20px] truncate text-sm ">
        <div className="flex flex-1 justify-between">
          <span> {form.description ?? t('noDescription')}</span>
          {form.published ? <Badge>{t('published')}</Badge> : <Badge variant="destructive">{t('draft')}</Badge>}
        </div>
      </CardContent>
      <CardFooter>
        {form.published ? (
          <Button asChild className="text-md z-50 mt-2 w-full gap-4" size="sm">
            <Link href={{ pathname: '/admin/[tenantId]/form-designer/[slug]', params: { tenantId: form.tenantId, slug: form.id } }}>
              {t('viewSubmissions')} <ArrowRightIcon />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="sm" className="text-md mt-2 w-full gap-4">
            <Link href={{ pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId: form.tenantId, slug: form.id } }}>
              {t('editForm')} <FilePenLineIcon />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

interface DraggableProps {
  data: FormWithRelations;
}

export function DraggableFormCard({ data }: DraggableProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: data.id,
    data: data,
  });

  return (
    <ClientOnly>
      <div ref={setNodeRef} className="flex w-full flex-1">
        <FormCard form={data}>
          <div {...listeners} {...attributes} className="cursor-move rounded-sm p-2 hover:bg-accent">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </FormCard>
      </div>
    </ClientOnly>
  );
}
