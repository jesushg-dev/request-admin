'use client';

import { type FC } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/phone-input';
import Select, { OptionType } from '@/components/select/select';

// Define Schema
export const userFormSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email({ message: 'error.invalidEmail' }),
    isActive: z.boolean().default(true),
    isTwoFactorRequired: z.boolean().default(false),
    firstName: z.string().min(1, { message: 'error.firstNameRequired' }),
    lastName: z.string().min(1, { message: 'error.lastNameRequired' }),
    phone: z.string().min(1, { message: 'error.phoneRequired' }),
    identificationNumber: z.string().min(1, { message: 'error.identificationNumberRequired' }),
    identificationTypeId: z.object({
      label: z.string(),
      value: z.string().nonempty('This field is required.'),
    }),
  }),
});

export const getDefaultUser = (): UserFormValues => ({
  user: {
    id: generateUuid(),
    email: '',
    isActive: true,
    isTwoFactorRequired: false,
    firstName: '',
    lastName: '',
    phone: '',
    identificationNumber: '',
    identificationTypeId: { label: '', value: '' },
  },
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  identificationTypes: OptionType[];
}

const UserForm: FC<UserFormProps> = ({ identificationTypes }) => {
  const t = useTranslations('admin.user.form');
  const { control } = useFormContext<UserFormValues>();

  return (
    <div className="m-1 flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Email Field */}
        <FormField
          control={control}
          name="user.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input id="user.email" type="email" placeholder={t('emailPlaceholder')} {...field} />
              </FormControl>
              <FormDescription>{t('emailDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={control}
          name="user.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl>
                <PhoneInput placeholder={t('phonePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* First Name */}
        <FormField
          control={control}
          name="user.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('firstName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('firstNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={control}
          name="user.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('lastName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('lastNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Identification Type */}
        <FormField
          control={control}
          name="user.identificationTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('identificationType')}</FormLabel>
              <FormControl>
                <Select menuPortalTarget={null} isSearchable isClearable options={identificationTypes} onChange={field.onChange} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Identification Number */}
        <FormField
          control={control}
          name="user.identificationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('identificationNumber')}</FormLabel>
              <FormControl>
                <Input placeholder={t('identificationNumberPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Two-Factor Authentication Checkbox */}
        <FormField
          control={control}
          name="user.isTwoFactorRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('enableTwoFactor')}</FormLabel>
                <FormDescription>{t('enableTwoFactorDesc')}</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Active Checkbox */}
        <FormField
          control={control}
          name="user.isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('active')}</FormLabel>
                <FormDescription>{t('activeDesc')}</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default UserForm;
