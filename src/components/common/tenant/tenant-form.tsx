import { useFormContext } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { TenantDetailsData } from './types';

export function TenantForm() {
  const { control } = useFormContext<TenantDetailsData>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tenant Name</FormLabel>
            <FormControl>
              <Input {...field} className="w-full" />
            </FormControl>
            <FormDescription>Enter the official name of the tenant organization.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="logoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo URL</FormLabel>
            <FormControl>
              <Input {...field} className="w-full" />
            </FormControl>
            <FormDescription>Provide a URL to the tenant's logo image.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="websiteUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website URL</FormLabel>
            <FormControl>
              <Input {...field} className="w-full" />
            </FormControl>
            <FormDescription>Enter the tenant's official website URL.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} className="w-full" />
            </FormControl>
            <FormDescription>A brief title or tagline for the tenant.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} className="min-h-[100px] w-full" />
            </FormControl>
            <FormDescription>Provide a short description of the tenant organization.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
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
      </div>
      <FormField
        control={control}
        name="contactEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email</FormLabel>
            <FormControl>
              <Input {...field} type="email" className="w-full" />
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
          <FormItem>
            <FormLabel>Contact Phone</FormLabel>
            <FormControl>
              <Input {...field} type="tel" className="w-full" />
            </FormControl>
            <FormDescription>The primary contact phone number for the tenant.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea {...field} className="min-h-[100px] w-full" />
            </FormControl>
            <FormDescription>The official address of the tenant organization.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
