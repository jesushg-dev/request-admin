'use client';

import { format } from 'date-fns';
import { es, enUS, type Locale } from 'date-fns/locale';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';

export const hours = Array.from({ length: 24 }, (_, i) => i);

const localeMap: Record<string, Locale> = {
  es,
  en: enUS,
};

export default function CalendarBodyMarginDayMargin({ className }: { className?: string }) {
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale] || enUS;

  return (
    <div className={cn('bg-background sticky left-0 z-10 flex w-12 flex-col', className)}>
      <div className="bg-background sticky top-0 left-0 z-20 h-[33px] border-b" />
      <div className="bg-background sticky left-0 z-10 flex w-12 flex-col">
        {hours.map((hour) => (
          <div key={hour} className="relative h-32 first:mt-0">
            {hour !== 0 && (
              <span className="text-muted-foreground absolute -top-2.5 left-2 text-xs">
                {format(new Date().setHours(hour, 0, 0, 0), 'h a', { locale: dateFnsLocale })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
