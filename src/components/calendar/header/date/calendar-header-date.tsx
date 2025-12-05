'use client';

import { format } from 'date-fns';
import { enUS, es, type Locale } from 'date-fns/locale';
import { useLocale } from 'next-intl';

import { useCalendarContext } from '../../calendar-context';
import CalendarHeaderDateBadge from './calendar-header-date-badge';
import CalendarHeaderDateChevrons from './calendar-header-date-chevrons';
import CalendarHeaderDateIcon from './calendar-header-date-icon';

const localeMap: Record<string, Locale> = {
  es,
  en: enUS,
};

export default function CalendarHeaderDate() {
  const { date } = useCalendarContext();
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale] || enUS;

  return (
    <div className="flex items-center gap-2">
      <CalendarHeaderDateIcon />
      <div>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold">{format(date, 'MMMM yyyy', { locale: dateFnsLocale })}</p>
          <CalendarHeaderDateBadge />
        </div>
        <CalendarHeaderDateChevrons />
      </div>
    </div>
  );
}
