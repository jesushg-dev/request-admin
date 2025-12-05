'use client';

import { type FC } from 'react';
import { type TUserSchema } from '@/services/schemas/user';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/custom-ui/phone-input';
import Select, { OptionType } from '@/components/custom-ui/select';

// Base schema for defineStepper (without internationalization)
// This is used only for the stepper definition
export const userFormSchema = z.object({
  user: z
    .object({
      id: z.string(),
      email: z.string().email(),
      isActive: z.boolean().default(true),
      isTwoFactorRequired: z.boolean().default(false),
      isAdmin: z.boolean().default(false),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string(),
      identificationNumber: z.string(),
      identificationTypeId: z.object({
        label: z.string(),
        value: z.string(),
      }),
      isEditing: z.boolean().default(false),
    })
    .superRefine((user, ctx) => {
      if (user.isEditing) {
        if (!user.phone || user.phone.trim().length === 0) {
          ctx.addIssue({
            path: ['phone'],
            code: z.ZodIssueCode.custom,
            message: 'error.phoneRequired',
          });
        }
        if (!user.identificationNumber || user.identificationNumber.trim().length === 0) {
          ctx.addIssue({
            path: ['identificationNumber'],
            code: z.ZodIssueCode.custom,
            message: 'error.identificationNumberRequired',
          });
        }
        if (!user.identificationTypeId.value || user.identificationTypeId.value.trim().length === 0) {
          ctx.addIssue({
            path: ['identificationTypeId', 'value'],
            code: z.ZodIssueCode.custom,
            message: 'error.identificationTypeRequired',
          });
        }
      }
    }),
});

export const getDefaultUser = (): UserFormValues => ({
  user: {
    isEditing: false,
    id: generateUuid(),
    email: '',
    isActive: true,
    isAdmin: false,
    isTwoFactorRequired: false,
    firstName: '',
    lastName: '',
    phone: '',
    identificationNumber: '',
    identificationTypeId: { label: '', value: '' },
  },
});

export type UserFormValues = TUserSchema;

interface UserFormProps {
  identificationTypes: OptionType[];
  isEditing?: boolean;
}

const UserForm: FC<UserFormProps> = ({ identificationTypes, isEditing = false }) => {
  const t = useTranslations('admin.user.form');
  const { control } = useFormContext<UserFormValues>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        {!isEditing && <p className="mb-2 text-xs text-red-500">{t('gdprNotice')}</p>}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Email Field */}
          <FormField
            control={control}
            name="user.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input id="user.email" type="email" placeholder={t('emailPlaceholder')} {...field} disabled={isEditing} />
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
                  <PhoneInput placeholder={t('phonePlaceholder')} {...field} disabled={!isEditing} />
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
                  <Select menuPortalTarget={null} isSearchable isClearable options={identificationTypes} onChange={field.onChange} value={field.value} isDisabled={!isEditing} />
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
                  <Input placeholder={t('identificationNumberPlaceholder')} {...field} disabled={!isEditing} />
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('active')}</FormLabel>
                  <FormDescription>{t('activeDesc')}</FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Admin Checkbox */}
          <FormField
            control={control}
            name="user.isAdmin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t('admin')}</FormLabel>
                  <FormDescription>{t('adminDesc')}</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserForm;
