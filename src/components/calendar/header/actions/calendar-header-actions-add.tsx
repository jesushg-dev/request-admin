'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { useCalendarContext } from '../../calendar-context';

export default function CalendarHeaderActionsAdd() {
  const { setNewEventDialogOpen } = useCalendarContext();
  const t = useTranslations('component.calendar');
  return (
    <Button className="bg-primary text-background flex items-center gap-1" onClick={() => setNewEventDialogOpen(true)}>
      <Plus />
      {t('addEvent')}
    </Button>
  );
}
