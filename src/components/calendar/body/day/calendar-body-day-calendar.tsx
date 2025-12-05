'use client';

import { enUS, es, type Locale } from 'date-fns/locale';
import { useLocale } from 'next-intl';

import { Calendar } from '@/components/ui/calendar';

import { useCalendarContext } from '../../calendar-context';

const localeMap: Record<string, Locale> = {
  es,
  en: enUS,
};

export default function CalendarBodyDayCalendar() {
  const { date, setDate } = useCalendarContext();
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale] || enUS;

  return <Calendar selected={date} onSelect={(date: Date | undefined) => date && setDate(date)} mode="single" locale={dateFnsLocale} />;
}
