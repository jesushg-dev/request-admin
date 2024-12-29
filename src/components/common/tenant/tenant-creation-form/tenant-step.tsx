import { useFormContext } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { TenantDetailsData } from './types';

export function TenantStep() {
  const { control } = useFormContext<TenantDetailsData>();

  return (
    <div className="m-1 flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="name"
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
          name="title"
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
          name="websiteUrl"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>Enter the tenant's official website URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input {...field} className="h-8 w-full rounded" />
              </FormControl>
              <FormDescription>Provide a URL to the tenant's logo image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="address"
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
          name="description"
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
          name="primaryColor"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input {...field} type="color" className="mr-2 h-12 w-12 p-1" />
                  <Input {...field} className="flex-grow" />
                </div>
              </FormControl>
              <FormDescription>Select the primary brand color.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="secondaryColor"
          render={({ field }) => (
            <FormItem className="mx-1">
              <FormLabel>Secondary Color</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input {...field} type="color" className="mr-2 h-12 w-12 p-1" />
                  <Input {...field} className="flex-grow" />
                </div>
              </FormControl>
              <FormDescription>Select the secondary brand color.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contactEmail"
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
          name="contactPhone"
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
