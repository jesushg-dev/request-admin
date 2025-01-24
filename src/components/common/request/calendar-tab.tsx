'use client';

import { useState } from 'react';

import Calendar from '@/components/calendar/calendar';
import { CalendarEvent, Mode } from '@/components/calendar/calendar-types';
import { generateMockEvents } from '@/components/calendar/mock-calendar-events';

export default function CalendarTab() {
  const [events, setEvents] = useState<CalendarEvent[]>(generateMockEvents());
  const [mode, setMode] = useState<Mode>('month');
  const [date, setDate] = useState<Date>(new Date());

  return <Calendar events={events} setEvents={setEvents} mode={mode} setMode={setMode} date={date} setDate={setDate} />;
}
