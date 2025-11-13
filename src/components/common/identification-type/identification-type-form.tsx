'use client';

import { useTransition, type FC } from 'react';
import { useRouter } from '@/i18n/routing';
import { useUpsertIdentificationType } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormActions, FormContent, FormItem, FormRoot, FormSection, FormValidationStatus } from '@/components/shared/form-root';
import { useIdentificationTypeSchema, type TIdentificationTypeSchema } from '@/services/schemas/identification-type';

const getDefaultValues = (): TIdentificationTypeSchema => ({
  id: generateUuid(),
  name: '',
  description: '',
  regex: '',
  testInput: '',
});

interface IdentificationTypeFormProps {
  tenantId: string;
  defaultValues?: TIdentificationTypeSchema;
}

export const IdentificationTypeForm: FC<IdentificationTypeFormProps> = ({ tenantId, defaultValues }) => {
  const router = useRouter();
  const t = useTranslations('admin.identificationType.form');
  const identificationTypeFormSchema = useIdentificationTypeSchema();

  const form = useForm({
    resolver: zodResolver(identificationTypeFormSchema),
    defaultValues: defaultValues ?? getDefaultValues(),
    mode: 'onBlur',
  });

  const [pending, startTransition] = useTransition();
  const { mutateAsync: upsert, error } = useUpsertIdentificationType();

  const validateRegex = (regex: string | undefined, testInput: string | undefined) => {
    if (!regex || !testInput) return false;

    try {
      const regexObj = new RegExp(regex);
      return regexObj.test(testInput);
    } catch {
      return false;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = ({ testInput, ...data }: TIdentificationTypeSchema) => {
    startTransition(async () => {
      const promise = upsert({
        create: { ...data, tenantId },
        update: { ...data, tenantId },
        where: { id: data.id },
      });

      toast.promise(promise, {
        loading: t('saving'),
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } });
          return t('successSave');
        },
        error: (err) => {
          return t('errorSave', { message: err.message });
        },
      });
    });
  };

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent error={error}>
          <FormSection>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem label={t('name')} description={t('nameDescription')}>
                  <Input placeholder={t('name')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('descriptionDescription')}>
                  <Textarea placeholder={t('descriptionDescription')} className="resize-none" {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regex"
              render={({ field }) => (
                <FormItem label={t('regexValidation')} description={t('regexValidationDescription')}>
                  <Input placeholder={t('regexValidationDescription')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testInput"
              render={({ field }) => (
                <FormItem label={t('testInput')} description={t('testInputDescription')}>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder={t('testInputDescription')} {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() => {
                        const regex = form.getValues('regex');
                        const testInput = form.getValues('testInput');
                        if (!regex || !testInput) return;

                        const isValid = validateRegex(regex, testInput);
                        toast(isValid ? t('regexValid') : t('regexInvalid'), {
                          description: isValid ? t('regexValid') : t('regexInvalid'),
                        });
                      }}
                      disabled={!form.getValues('regex') || !form.getValues('testInput')}>
                      {t('testInput')}
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            {form.getValues('regex') && form.getValues('testInput') && (
              <FormValidationStatus isValid={validateRegex(form.getValues('regex'), form.getValues('testInput'))} validText={t('regexValid')} invalidText={t('regexInvalid')} />
            )}
          </FormSection>
        </FormContent>

        <FormActions isPending={pending} title={pending ? t('saving') : t('save')} className="w-full" />
      </FormRoot>
    </Form>
  );
};
