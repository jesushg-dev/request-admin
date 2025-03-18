'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Eliminar la importación de toast
// import { toast } from "@/hooks/use-toast"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';

const displayFormSchema = z.object({
  sidebarItems: z.array(z.string()).default([]),
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

const sidebarItems = [
  {
    id: 'recents',
    label: 'Recents',
  },
  {
    id: 'home',
    label: 'Home',
  },
  {
    id: 'applications',
    label: 'Applications',
  },
  {
    id: 'desktop',
    label: 'Desktop',
  },
  {
    id: 'downloads',
    label: 'Downloads',
  },
  {
    id: 'documents',
    label: 'Documents',
  },
];

export default function DisplayForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Default values for the form
  const defaultValues: Partial<DisplayFormValues> = {
    sidebarItems: ['recents', 'home', 'documents'],
  };

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: DisplayFormValues) {
    setIsLoading(true);

    // Simplemente usar console.log
    console.log('Actualizando configuración de pantalla:', data);

    setTimeout(() => {
      console.log('Configuración de pantalla actualizada');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display</CardTitle>
        <CardDescription>Turn items on or off to control what's displayed in the app.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Sidebar</h3>
              <p className="text-sm text-muted-foreground mb-4">Select the items you want to display in the sidebar.</p>

              <FormField
                control={form.control}
                name="sidebarItems"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {sidebarItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sidebar-${item.id}`}
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              const updatedItems = checked ? [...field.value, item.id] : field.value?.filter((value) => value !== item.id);
                              field.onChange(updatedItems);
                            }}
                          />
                          <label htmlFor={`sidebar-${item.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update display'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
