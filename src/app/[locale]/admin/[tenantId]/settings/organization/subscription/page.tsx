'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, CreditCard, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
// Eliminar la importación de toast
// import { toast } from "@/hooks/use-toast"
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const subscriptionFormSchema = z.object({
  planId: z.string().min(1, {
    message: 'Please select a plan.',
  }),
  isLifetime: z.boolean().default(false),
  startDate: z.date(),
  endDate: z.date(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

// Mock data for plans
const plans = [
  { id: 'free', name: 'Free', price: '$0/month', features: ['Basic features', '1 user', '500MB storage'] },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9/month',
    features: ['All Free features', '3 users', '5GB storage', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$29/month',
    features: ['All Starter features', '10 users', '50GB storage', 'API access', 'Custom branding'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99/month',
    features: ['All Pro features', 'Unlimited users', '500GB storage', '24/7 support', 'SLA guarantee'],
  },
];

// Mock data for payment history
const payments = [
  {
    id: 'pay_1',
    date: new Date(2023, 11, 15),
    amount: '$29.00',
    method: 'Credit Card (**** 4242)',
    status: 'Completed',
  },
  {
    id: 'pay_2',
    date: new Date(2023, 10, 15),
    amount: '$29.00',
    method: 'Credit Card (**** 4242)',
    status: 'Completed',
  },
  {
    id: 'pay_3',
    date: new Date(2023, 9, 15),
    amount: '$29.00',
    method: 'Credit Card (**** 4242)',
    status: 'Completed',
  },
];

export default function SubscriptionForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Default values for the form
  const defaultValues: SubscriptionFormValues = {
    planId: 'pro',
    isLifetime: false,
    startDate: new Date(2023, 9, 15),
    endDate: new Date(2024, 9, 15),
  };

  const form = useForm({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: SubscriptionFormValues) {
    setIsLoading(true);

    // Simplemente usar console.log
    console.log('Actualizando suscripción:', data);

    setTimeout(() => {
      console.log('Suscripción actualizada');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Manage your subscription plan and payment details.</CardDescription>
            </div>
            <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Professional Plan</h3>
                  <p className="text-sm text-muted-foreground">$29/month, billed monthly</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Current Plan</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                <p>October 15, 2023</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Renewal Date</h3>
                <p>October 15, 2024</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Billing Cycle</h3>
                <p>Monthly</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Visa ending in 4242</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel Subscription</Button>
          <Button>Update Payment Method</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Plan</CardTitle>
          <CardDescription>Upgrade or downgrade your subscription plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - {plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the plan that best fits your needs.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isLifetime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Lifetime Access</FormLabel>
                      <FormDescription>One-time payment for lifetime access to the plan.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Subscription'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your recent payment transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(payment.date, 'MMM d, yyyy')}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Transactions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
