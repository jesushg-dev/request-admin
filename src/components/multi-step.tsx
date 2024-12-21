'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// Validation schemas using Zod
const shippingSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Card number is required'),
  expirationDate: z.string().min(5, 'Expiration date is required'),
  cvv: z.string().min(3, 'CVV is required'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

// Stepper definition
const { useStepper, steps } = defineStepper(
  { id: 'shipping', label: 'Shipping', schema: shippingSchema },
  { id: 'payment', label: 'Payment', schema: paymentSchema },
  { id: 'complete', label: 'Complete', schema: z.object({}) }
);

// Main App component
export default function App() {
  const stepper = useStepper();

  // Initialize the form for the current step using react-hook-form
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  // Handle form submission
  const onSubmit = (values: any) => {
    console.log(`Step: ${stepper.current.id}, Values:`, values);
    if (stepper.isLast) {
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-lg border p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Checkout</h2>
          <span className="text-sm text-muted-foreground">
            Step {stepper.current.index + 1} of {steps.length}
          </span>
        </div>

        {/* Stepper Navigation */}
        <nav aria-label="Steps" className="my-4">
          <ol className="flex items-center gap-x-4">
            {stepper.all.map((step, index, array) => (
              <React.Fragment key={step.id}>
                <li className="flex items-center gap-x-2">
                  <Button type="button" variant={index <= stepper.current.index ? 'default' : 'outline'} className="size-8 rounded-full p-0" onClick={() => stepper.goTo(step.id)}>
                    {index + 1}
                  </Button>
                  <span className="text-xs font-medium">{step.label}</span>
                </li>
                {index < array.length - 1 && <Separator className={`flex-1 ${index < stepper.current.index ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </ol>
        </nav>

        {/* Dynamic Content based on the current step */}
        {stepper.switch({
          shipping: () => <ShippingForm />,
          payment: () => <PaymentForm />,
          complete: () => <CompleteStep />,
        })}

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={stepper.prev} disabled={stepper.isFirst} type="button">
            Back
          </Button>
          <Button type="submit">{stepper.isLast ? 'Complete' : 'Next'}</Button>
        </div>
      </form>
    </Form>
  );
}

// Shipping Form Component
function ShippingForm() {
  const { control } = useFormContext<ShippingFormValues>();

  return (
    <>
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input placeholder="City" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code</FormLabel>
            <FormControl>
              <Input placeholder="12345" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Payment Form Component
function PaymentForm() {
  const { control } = useFormContext<PaymentFormValues>();

  return (
    <>
      <FormField
        control={control}
        name="cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Number</FormLabel>
            <FormControl>
              <Input placeholder="1234 5678 9012 3456" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="expirationDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expiration Date</FormLabel>
            <FormControl>
              <Input placeholder="MM/YY" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="cvv"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CVV</FormLabel>
            <FormControl>
              <Input placeholder="123" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Completion Step
function CompleteStep() {
  return <p className="text-center">Thank you! Your order is complete.</p>;
}
