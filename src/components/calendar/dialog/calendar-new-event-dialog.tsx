'use client';

import { useNewEventSchema, type TNewEventSchema } from '@/services/schemas/calendar';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/form/color-picker';
import { DateTimePicker } from '@/components/form/date-time-picker';

import { useCalendarContext } from '../calendar-context';

export default function CalendarNewEventDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, date, events, setEvents } = useCalendarContext();
  const t = useTranslations('component.calendar.newEventDialog');
  const formSchema = useNewEventSchema();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      start: format(date, "yyyy-MM-dd'T'HH:mm"),
      end: format(date, "yyyy-MM-dd'T'HH:mm"),
      color: 'blue',
    },
  });

  function onSubmit(values: TNewEventSchema) {
    const newEvent = {
      id: generateUuid(),
      title: values.title,
      start: new Date(values.start),
      end: new Date(values.end),
      color: values.color,
    };

    setEvents([...events, newEvent]);
    setNewEventDialogOpen(false);
    form.reset();
  }

  return (
    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{t('eventTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('eventTitlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{t('start')}</FormLabel>
                  <FormControl>
                    <DateTimePicker field={{ value: field.value ?? '', onChange: field.onChange }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{t('end')}</FormLabel>
                  <FormControl>
                    <DateTimePicker field={{ value: field.value ?? '', onChange: field.onChange }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">{t('color')}</FormLabel>
                  <FormControl>
                    <ColorPicker field={{ value: field.value ?? '', onChange: field.onChange }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">{t('createButton')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
