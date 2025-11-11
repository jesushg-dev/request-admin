'use client';

import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isWithinInterval, startOfMonth, startOfWeek } from 'date-fns';
import { es, enUS, type Locale } from 'date-fns/locale';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { useCalendarContext } from '../../calendar-context';
import CalendarEvent from '../../calendar-event';

const localeMap: Record<string, Locale> = {
  es,
  en: enUS,
};

export default function CalendarBodyMonth() {
  const { date, events, setDate, setMode } = useCalendarContext();
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale] || enUS;
  const t = useTranslations('component.calendar.body');

  const weekDays = [
    { key: 'mon', short: t('weekDays.mon') },
    { key: 'tue', short: t('weekDays.tue') },
    { key: 'wed', short: t('weekDays.wed') },
    { key: 'thu', short: t('weekDays.thu') },
    { key: 'fri', short: t('weekDays.fri') },
    { key: 'sat', short: t('weekDays.sat') },
    { key: 'sun', short: t('weekDays.sun') },
  ];

  // Get the first day of the month
  const monthStart = startOfMonth(date);
  // Get the last day of the month
  const monthEnd = endOfMonth(date);

  // Get the first Monday of the first week (may be in previous month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Get the last Sunday of the last week (may be in next month)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Get all days between start and end
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const today = new Date();

  // Filter events to only show those within the current month view
  const visibleEvents = events.filter(
    (event) =>
      isWithinInterval(event.start, {
        start: calendarStart,
        end: calendarEnd,
      }) || isWithinInterval(event.end, { start: calendarStart, end: calendarEnd })
  );

  return (
    <div className="flex flex-grow flex-col overflow-hidden">
      <div className="border-border divide-border hidden grid-cols-7 divide-x md:grid">
        {weekDays.map((day) => (
          <div key={day.key} className="text-muted-foreground border-border border-b py-2 text-center text-sm font-medium">
            {day.short}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthStart.toISOString()}
          className="relative grid flex-grow overflow-y-auto md:grid-cols-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}>
          {calendarDays.map((day) => {
            const dayEvents = visibleEvents.filter((event) => isSameDay(event.start, day));
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, date);

            return (
              <div
                key={day.toISOString()}
                className={cn('relative flex aspect-square cursor-pointer flex-col border-r border-b p-2', !isCurrentMonth && 'bg-muted/50 hidden md:flex')}
                onClick={(e) => {
                  e.stopPropagation();
                  setDate(day);
                  setMode('day');
                }}>
                <div className={cn('flex aspect-square w-fit flex-col items-center justify-center rounded-full p-1 text-sm font-medium', isToday && 'bg-primary text-background')}>
                  {format(day, 'd')}
                </div>
                <AnimatePresence mode="wait">
                  <div className="mt-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <CalendarEvent key={event.id} event={event} className="relative h-auto" month />
                    ))}
                    {dayEvents.length > 3 && (
                      <motion.div
                        key={`more-${day.toISOString()}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="text-muted-foreground text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDate(day);
                          setMode('day');
                        }}>
                        {t('more', { count: dayEvents.length - 3 })}
                      </motion.div>
                    )}
                  </div>
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
