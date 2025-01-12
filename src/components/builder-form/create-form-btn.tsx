'use client';

import { FC } from 'react';
import { CreateForm } from '@/actions/form';
import { useRouter } from '@/i18n/routing';
import { formSchema, formSchemaType } from '@/services/schemas/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { BsFileEarmarkPlus } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';

import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const CreateFormBtn: FC = () => {
  const t = useTranslations('component.formBuilder');
  const router = useRouter();
  const tenantId = useTenantId();

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = async (values: formSchemaType) => {
    try {
      const slug = await CreateForm(values, tenantId);
      toast({ title: t('successTitle'), description: t('successDescription') });
      router.push({ pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId, slug } });
    } catch {
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="group flex h-[190px] flex-col items-center justify-center gap-4 border border-dashed border-primary/20 hover:cursor-pointer hover:border-primary">
          <BsFileEarmarkPlus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
          <p className="text-xl font-bold text-muted-foreground group-hover:text-primary">{t('createNewForm')}</p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>{t('dialogDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('formNameLabel')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('formDescriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting} className="mt-4 w-full">
                {form.formState.isSubmitting ? <ImSpinner2 className="animate-spin" /> : t('saveButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFormBtn;
