'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { useFindManyRequestChangeLog } from '@/services/api/hooks';
import { Prisma } from '@zenstackhq/runtime/models';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import ErrorRetryFallback from '../../error-retry-fallback';

export const FormSubmissionDefaultArgs = Prisma.validator<Prisma.RequestChangeLogFindManyArgs>()({
  select: {
    id: true,
    updatedAt: true,
    fieldName: true,
    requestId: true,
    updatedBy: true,
    tenantId: true,
    oldValue: true,
    newValue: true,
    createdAt: true,
    metadata: true,
  },
});

type TimelineItem = Prisma.RequestChangeLogGetPayload<typeof FormSubmissionDefaultArgs>;

interface TimelineProps {
  requestId: string;
  tenantId: string;
}

const tryParseJSON = (str: string | null | undefined): Record<string, unknown> | null => {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

function RequestActivities({ requestId, tenantId }: TimelineProps) {
  const t = useTranslations('admin.request.view.history');
  const { data, isLoading, isError, error, refetch } = useFindManyRequestChangeLog({
    ...FormSubmissionDefaultArgs,
    where: { requestId, tenantId },
    orderBy: { updatedAt: 'desc' },
  });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItem((current) => (current === id ? null : id));
  }, []);

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <Placeholder key={i} />
        ))}
      </div>
    );

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <div className="flex-1 w-full gap-4 flex flex-col overflow-auto">
      {data ? (
        <div className="flex flex-col gap-2 w-full">
          {data.map((item) => (
            <TimelineItemComponent key={item.id} item={item} isExpanded={expandedItem === item.id} onToggle={() => toggleExpand(item.id)} t={t} />
          ))}
        </div>
      ) : (
        <p>{t('loading')}</p>
      )}
    </div>
  );
}

interface TimelineItemComponentProps {
  item: TimelineItem;
  isExpanded: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslations<'admin.request.view.history'>>;
}

const TimelineItemComponent = memo(({ item, isExpanded, onToggle, t }: TimelineItemComponentProps) => {
  const displayData = useMemo(() => {
    if (!item.updatedAt) {
      console.error('Invalid date:', item.updatedAt);
      return {
        dayOfWeek: t('nA'),
        dayNumber: '00',
        title: item.fieldName,
        time: '00:00',
        fullDate: t('invalidDate'),
        userId: item.updatedBy?.substring(0, 8) || t('unknownUser'),
      };
    }

    const date = new Date(item.updatedAt);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', item.updatedAt);
      return {
        dayOfWeek: t('nA'),
        dayNumber: '00',
        title: item.fieldName,
        time: '00:00',
        fullDate: t('invalidDate'),
        userId: item.updatedBy?.substring(0, 8) || t('unknownUser'),
      };
    }

    const titleMap: Record<string, string> = {
      request_created: t('requestCreated'),
      request_updated: t('requestUpdated'),
      request_approved: t('requestApproved'),
      request_rejected: t('requestRejected'),
    };

    return {
      dayOfWeek: format(date, 'EEE', { locale: es }),
      dayNumber: format(date, 'dd'),
      title: titleMap[item.fieldName] || item.fieldName,
      time: format(date, 'HH:mm'),
      fullDate: format(date, 'PPP', { locale: es }),
      userId: item.updatedBy || t('unknownUser'),
    };
  }, [item.updatedAt, item.fieldName, item.updatedBy, t]);

  const metadataContent = useMemo(() => {
    const metadataObj = tryParseJSON(item.metadata);
    if (metadataObj) {
      return (
        <div className="grid gap-2">
          <span className="font-medium">{t('metadata')}:</span>
          <div className="grid gap-2">
            {Object.entries(metadataObj).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 border rounded p-2 bg-muted/30">
                <span className="font-semibold">{key}:</span>
                <span className="text-xs text-muted-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <span className="font-medium">{t('metadata')}:</span>
        <span>{item.metadata}</span>
      </div>
    );
  }, [item.metadata, t]);

  const changesContent = useMemo(() => {
    const oldObj = tryParseJSON(item.oldValue);
    const newObj = tryParseJSON(item.newValue);

    if (oldObj && newObj) {
      const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
      return (
        <div className="grid gap-2">
          <span className="font-medium">{t('change')}:</span>
          <div className="grid gap-2">
            {allKeys.map((key) => (
              <div key={key} className="flex items-center gap-2 border rounded p-2 bg-muted/30">
                <span className="font-semibold">{key}:</span>
                <span className="text-xs text-muted-foreground">{oldObj[key] !== undefined ? `"${oldObj[key]}"` : '—'}</span>
                <span className="mx-1">→</span>
                <span className="text-xs text-muted-foreground">{newObj[key] !== undefined ? `"${newObj[key]}"` : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <span className="font-medium">{t('change')}:</span>
        <span>
          {item.oldValue !== null ? `"${item.oldValue}"` : '—'} → {item.newValue !== null ? `"${item.newValue}"` : '—'}
        </span>
      </div>
    );
  }, [item.oldValue, item.newValue, t]);

  return (
    <div className={cn('rounded-lg border transition-colors overflow-hidden', isExpanded ? 'bg-muted/70 border-muted-foreground/20' : 'bg-background hover:bg-muted/50')}>
      <div className="flex items-center cursor-pointer" onClick={onToggle}>
        <div
          className={cn(
            'flex flex-col items-center justify-center p-4 min-w-[80px] text-center border-r relative',
            isExpanded && 'after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-primary'
          )}>
          <div className={cn('text-sm font-medium', isExpanded ? 'text-foreground' : 'text-muted-foreground')}>{displayData.dayOfWeek}</div>
          <div className="text-3xl font-bold">{displayData.dayNumber}</div>
        </div>

        <div className="flex-1 p-4">
          <div className="font-medium">{displayData.title}</div>
          <div className="flex items-center text-sm">
            <div className={cn('flex items-center gap-1', isExpanded ? 'text-foreground/80' : 'text-muted-foreground')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {displayData.time}
            </div>
          </div>
        </div>

        <div className="p-4">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className={cn('h-5 w-5', isExpanded ? 'text-foreground' : 'text-muted-foreground')} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-muted-foreground/20 px-4 py-3 bg-background/80">
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-medium">{t('requestId')}:</span>
                <span>{item.requestId}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-medium">{t('fullDate')}:</span>
                <span>{displayData.fullDate}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <span className="font-medium">{t('modifiedBy')}:</span>
                <span>{displayData.userId}</span>
              </div>
              {item.tenantId && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">{t('tenantId')}:</span>
                  <span>{item.tenantId}</span>
                </div>
              )}
              {changesContent}
              {metadataContent}
              {item.createdAt && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium">{t('created')}:</span>
                  <span>{format(parseISO(item.createdAt.toISOString()), 'Pp', { locale: es })}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TimelineItemComponent.displayName = 'TimelineItemComponent';

function Placeholder() {
  return (
    <div className="rounded-lg border transition-colors overflow-hidden bg-muted/70 border-muted-foreground/20">
      <div className="flex items-center cursor-pointer">
        <div className="flex flex-col items-center justify-center p-4 min-w-[80px] text-center border-r relative after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-primary">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-6 w-10" />
        </div>

        <div className="flex-1 p-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex items-center text-sm">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="p-4">
          <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="border-t border-muted-foreground/20 px-4 py-3 bg-background/80">
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default RequestActivities;
