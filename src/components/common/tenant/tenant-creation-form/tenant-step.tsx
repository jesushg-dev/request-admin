import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export const tenantDetailsSchema = z.object({
  tenant: z.object({
    name: z.string().min(1, 'Name is required'),
    logoUrl: z.string().url().optional().or(z.literal('')),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    title: z.string().optional(),
    description: z.string().optional(),
    primaryColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
      .optional(),
    secondaryColor: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
      .optional(),
    contactEmail: z.string().email('Invalid email address'),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export type TenantDetailsValues = z.infer<typeof tenantDetailsSchema>;

export function TenantStep() {
  const { control } = useFormContext<TenantDetailsValues>();

  return (
    <div className="m-1 flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="tenant.name"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Tenant Name</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>Enter the official name of the tenant organization.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.title"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>A brief title or tagline for the tenant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.websiteUrl"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>Enter the tenant&apos;s official website URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.logoUrl"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>Provide a URL to the tenant&apos;s logo image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.address"
          render={({ field }) => (
            <FormItem className="mx-1 md:col-span-2">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>The official address of the tenant organization.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.description"
          render={({ field }) => (
            <FormItem className="mx-1 md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>Provide a short description of the tenant organization.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.primaryColor"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input {...field} type="color" className="mr-2 h-12 w-12 p-1" />
                  <Input {...field} className="grow" />
                </div>
              </FormControl>
              <FormDescription>Select the primary brand color.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.secondaryColor"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Secondary Color</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input {...field} type="color" className="mr-2 h-12 w-12 p-1" />
                  <Input {...field} className="grow" />
                </div>
              </FormControl>
              <FormDescription>Select the secondary brand color.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.contactEmail"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>The primary contact email for the tenant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenant.contactPhone"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Contact Phone</FormLabel>
              <FormControl>
                <Input {...field} type="tel" className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>The primary contact phone number for the tenant.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
