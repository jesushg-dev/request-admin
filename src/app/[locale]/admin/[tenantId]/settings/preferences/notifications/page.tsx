'use client';

import { useEffect, useState } from 'react';
import { useNotificationsSchema, type TNotificationsSchema } from '@/services/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import useLocalStorage from '@/hooks/use-local-storage';

type NotificationsFormValues = TNotificationsSchema;

export default function NotificationsForm() {
  const [isLoading, setIsLoading] = useState(false);

  const notificationsSchema = useNotificationsSchema();

  // Load saved preferences from localStorage
  const [savedPreferences, setSavedPreferences] = useLocalStorage<NotificationsFormValues>('notification-preferences', {
    notifyType: 'all',
    communicationEmails: true,
    marketingEmails: false,
    socialEmails: true,
    securityEmails: true,
    mobileDifferent: false,
  });

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: savedPreferences,
    mode: 'onChange',
  });

  // Update form values when savedPreferences change (e.g., on mount after localStorage loads)
  useEffect(() => {
    form.reset(savedPreferences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPreferences]);

  // Save preferences to localStorage and show success message
  function onSubmit(data: NotificationsFormValues) {
    setIsLoading(true);

    try {
      // Save to localStorage
      setSavedPreferences(data);

      // Show success message
      toast.success('Notification preferences updated successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Notify me about...</h3>
              </div>

              <FormField
                control={form.control}
                name="notifyType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="all" />
                          </FormControl>
                          <FormLabel className="font-normal">All new messages</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="mentions" />
                          </FormControl>
                          <FormLabel className="font-normal">Direct messages and mentions</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">Nothing</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Email Notifications</h3>
              </div>

              <FormField
                control={form.control}
                name="communicationEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Communication emails</FormLabel>
                      <FormDescription>Receive emails about your account activity.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Marketing emails</FormLabel>
                      <FormDescription>Receive emails about new products, features, and more.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Social emails</FormLabel>
                      <FormDescription>Receive emails for friend requests, follows, and more.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="securityEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Security emails</FormLabel>
                      <FormDescription>Receive emails about your account activity and security.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileDifferent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Use different settings for my mobile devices</FormLabel>
                      <FormDescription>You can manage your mobile notifications in the mobile settings page.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update notifications'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
