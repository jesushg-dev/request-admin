'use client';

import { useState } from 'react';
import { useFindManyRequestChangeLog } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import ErrorRetryFallback from '../../error-retry-fallback';

export const FormSubmissionDefaultArgs = Prisma.validator<Prisma.RequestChangeLogFindManyArgs>()({
  select: {
    id: true,
    changedAt: true,
    fieldName: true,
    requestId: true,
    changedBy: true,
    tenantId: true,
    oldValue: true,
    newValue: true,
    createdAt: true,
  },
});

type TimelineItem = Prisma.RequestChangeLogGetPayload<typeof FormSubmissionDefaultArgs>;

interface TimelineProps {
  requestId: string;
  tenantId: string;
}

function RequestActivities({ requestId, tenantId }: TimelineProps) {
  const { data, isLoading, isError, error, refetch } = useFindManyRequestChangeLog({
    select: { id: true, changedAt: true, fieldName: true, requestId: true, changedBy: true, tenantId: true, oldValue: true, newValue: true, createdAt: true },
    where: { requestId, tenantId },
    orderBy: { changedAt: 'desc' },
  });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const getDisplayData = (item: TimelineItem) => {
    const date = new Date(item.changedAt);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', item.changedAt);
      return {
        dayOfWeek: 'N/A',
        dayNumber: '00',
        title: item.fieldName,
        time: '00:00',
        fullDate: 'Invalid date',
        userId: item.changedBy?.substring(0, 8) || 'Usuario desconocido',
      };
    }

    const titleMap: Record<string, string> = {
      request_created: 'Solicitud creada',
      request_updated: 'Solicitud actualizada',
      request_approved: 'Solicitud aprobada',
      request_rejected: 'Solicitud rechazada',
    };

    return {
      dayOfWeek: format(date, 'EEE', { locale: es }),
      dayNumber: format(date, 'dd'),
      title: titleMap[item.fieldName] || item.fieldName,
      time: format(date, 'HH:mm'),
      fullDate: format(date, 'PPP', { locale: es }),
      userId: item.changedBy || 'Usuario desconocido',
    };
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (isLoading) return <Placeholder />;

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <div className="flex-1 w-full gap-4 flex flex-col">
      {data ? (
        <>
          {data.map((item) => {
            const { dayOfWeek, dayNumber, title, time, fullDate, userId } = getDisplayData(item);
            const isExpanded = item.id === expandedItem;

            return (
              <div key={item.id} className={cn('rounded-lg border transition-colors overflow-hidden', isExpanded ? 'bg-muted/70 border-muted-foreground/20' : 'bg-background hover:bg-muted/50')}>
                <div className="flex items-center cursor-pointer" onClick={() => toggleExpand(item.id)}>
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center p-4 min-w-[80px] text-center border-r relative',
                      isExpanded && 'after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-primary'
                    )}>
                    <div className={cn('text-sm font-medium', isExpanded ? 'text-foreground' : 'text-muted-foreground')}>{dayOfWeek}</div>
                    <div className="text-3xl font-bold">{dayNumber}</div>
                  </div>

                  <div className="flex-1 p-4">
                    <div className="font-medium">{title}</div>
                    <div className="flex items-center text-sm">
                      <div className={cn('flex items-center gap-1', isExpanded ? 'text-foreground/80' : 'text-muted-foreground')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {time}
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
                          <span className="font-medium">ID Solicitud:</span>
                          <span>{item.requestId}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                          <span className="font-medium">Fecha completa:</span>
                          <span>{fullDate}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                          <span className="font-medium">Modificado por:</span>
                          <span>{userId}</span>
                        </div>
                        {item.tenantId && (
                          <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-medium">ID Tenant:</span>
                            <span>{item.tenantId}</span>
                          </div>
                        )}
                        {(item.oldValue !== undefined || item.newValue !== undefined) && (
                          <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-medium">Cambio:</span>
                            <span>
                              {item.oldValue !== null ? `"${item.oldValue}"` : '—'} → {item.newValue !== null ? `"${item.newValue}"` : '—'}
                            </span>
                          </div>
                        )}
                        {item.createdAt && (
                          <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-medium">Creado:</span>
                            <span>{format(parseISO(item.createdAt.toISOString()), 'Pp', { locale: es })}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

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
