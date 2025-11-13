'use client';

import { useEffect, useState } from 'react';
import { usePersonSchema, type TPersonSchema } from '@/services/schemas/settings/organization';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { useFindFirstPerson, useUpsertPerson } from '@/services/api/hooks';
import { useFindManyIdentificationType } from '@/services/api/hooks/identification-type';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonForm() {
  const t = useTranslations('admin.setting.organizationPerson');
  const { tenantId, userTenant } = useTenantContext();
  const [isLoading, setIsLoading] = useState(false);

  // Get current person data
  const { data: personData, isLoading: isLoadingPerson } = useFindFirstPerson(
    {
      where: {
        userTenantId: userTenant.userTenantId,
        tenantId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        identificationNumber: true,
        identificationTypeId: true,
        image: true,
      },
    },
    {
      enabled: !!userTenant.userTenantId && !!tenantId,
    }
  );

  // Get identification types
  const { data: identificationTypes = [], isLoading: isLoadingTypes } = useFindManyIdentificationType(
    {
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    },
    {
      enabled: !!tenantId,
    }
  );

  const personSchema = usePersonSchema();
  type PersonFormValues = TPersonSchema;

  // Default values for the form
  const defaultValues: PersonFormValues = {
    firstName: personData?.firstName || '',
    lastName: personData?.lastName || '',
    phone: personData?.phone || '',
    identificationNumber: personData?.identificationNumber || '',
    identificationTypeId: personData?.identificationTypeId || '',
    image: personData?.image || '',
  };

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    mode: 'onChange',
    defaultValues,
  });

  // Update form when person data loads
  useEffect(() => {
    if (personData) {
      form.reset({
        firstName: personData.firstName || '',
        lastName: personData.lastName || '',
        phone: personData.phone || '',
        identificationNumber: personData.identificationNumber || '',
        identificationTypeId: personData.identificationTypeId || '',
        image: personData.image || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personData]);

  // Mutation for updating/creating person
  const updatePerson = useUpsertPerson();

  async function onSubmit(data: PersonFormValues) {
    setIsLoading(true);

    try {
      await updatePerson.mutateAsync({
        where: {
          userTenantId: userTenant.userTenantId,
        },
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          identificationNumber: data.identificationNumber,
          identificationTypeId: data.identificationTypeId || null,
          image: data.image || null,
          userTenantId: userTenant.userTenantId,
          tenantId,
        },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          identificationNumber: data.identificationNumber,
          identificationTypeId: data.identificationTypeId || null,
          image: data.image || null,
        },
      });

      toast.success(t('toast.success'));
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving person information:', error);
      toast.error(t('toast.error'));
      setIsLoading(false);
    }
  }

  if (isLoadingPerson || isLoadingTypes) {
    return (
     <Skeleton className="h-full w-full" />
    );
  }

  const initials = `${personData?.firstName?.[0] || ''}${personData?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>{t('alert.title')}</AlertTitle>
          <AlertDescription>{t('alert.description')}</AlertDescription>
        </Alert>

        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={personData?.image || undefined} alt="Person" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              {t('form.image.changePhoto')}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.firstName.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.firstName.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.lastName.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.lastName.placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.phone.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.phone.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.phone.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identificationTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.identificationType.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.identificationType.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {identificationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.identificationNumber.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('form.identificationNumber.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('form.identificationNumber.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('form.button.saving') : t('form.button.save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
