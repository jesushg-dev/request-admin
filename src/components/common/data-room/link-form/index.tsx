'use client';

import { useState, useTransition, type FC } from 'react';
import { useRouter } from 'next/navigation';
import { useLinkSchema, type TLinkSchema } from '@/services/schemas/documents';
import { upsertLinkAction } from '@/actions/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Bell, Calendar, Copy, Download, FileText, LinkIcon, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { FormActions, FormContent, FormItem, FormRoot, FormSection, FormSwitchItem } from '@/components/shared/form-root';

import { AccordionSection } from '../../../shared/accordion-section';
import { CustomField } from './custom-field';
import { Security } from './security';

export type LinkFormValues = TLinkSchema;

const getDefaultLinkValues = (): LinkFormValues => {
  return {
    id: generateUuid(),
    name: '',
    expiresAt: undefined,
    enablePassword: false,
    password: '',
    emailProtected: false,
    emailAuthenticated: false,
    enableScreenshotProtection: false,
    enableWatermark: false,
    enableAgreement: false,
    agreementId: undefined,
    allowDownload: false,
    enableNotification: false,
    enableFeedback: false,
    enableQuestion: false,
    allowSpecificViewers: false,
    allowedViewers: [],
    blockSpecificViewers: false,
    denyViewers: [],
    customFields: [],
  };
};

interface LinkFormProps {
  tenantId: string;
  documentId: string;
  dataroomId: string;
  callbackUrl: string;
  linkType: 'DOCUMENT_LINK' | 'DATAROOM_LINK';
  initialValues?: LinkFormValues;
}

export const LinkForm: FC<LinkFormProps> = ({ tenantId, initialValues, linkType, documentId, dataroomId, callbackUrl }) => {
  const router = useRouter();
  const t = useTranslations('admin.link.form');

  const linkSchema = useLinkSchema();

  const form = useForm<LinkFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(linkSchema),
    defaultValues: initialValues ?? getDefaultLinkValues(),
  });

  const [isPending, startTransition] = useTransition();
  const [savedLink, setSavedLink] = useState<{ id?: string; url?: string; slug?: string } | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success(t('copy.success')))
      .catch(() => toast.error(t('copy.error')));
  };

  const handleGoBack = () => {
    router.push(callbackUrl);
  };

  const onSubmit = (data: LinkFormValues) => {
    startTransition(async () => {
      const promise = upsertLinkAction({
        data,
        tenantId,
        documentId,
        dataroomId,
        linkType,
      });

      toast.promise(promise, {
        loading: t('saving.loading'),
        success: (result) => {
          if (result?.url || result?.slug) {
            const url = result.url || (result.slug ? `/l/${result.slug}` : '');
            setSavedLink({
              id: result.id,
              url: result.url ?? undefined,
              slug: result.slug ?? undefined,
            });
            return t('saving.success', { url });
          }
          return t('saving.successNoUrl');
        },
        error: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return t('saving.error');
        },
      });
    });
  };

  if (savedLink?.url || savedLink?.slug) {
    const url = savedLink.url || (savedLink.slug ? `/l/${savedLink.slug}` : '');
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            {t('saved.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t('saved.message')}</p>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md overflow-hidden">
            <p className="text-sm truncate flex-1">{url}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('buttons.back')}
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => handleCopyLink(url)}>
            <Copy className="mr-2 h-4 w-4" />
            {t('buttons.copy')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <FormRoot onSubmit={form.handleSubmit(onSubmit)}>
        <FormContent>
          <FormSection>
            {/* Basic Information AccordionSection */}
            <AccordionSection title={t('basicInfo.title')} icon={<LinkIcon className="h-4 w-4 text-primary" />} defaultOpen={true}>
              <div className="grid gap-4 p-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem label={t('basicInfo.name.label')} description={t('basicInfo.name.description')}>
                      <Input placeholder={t('basicInfo.name.placeholder')} autoComplete="off" {...field} className="max-w-md" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem label={t('basicInfo.expirationDate.label')} description={t('basicInfo.expirationDate.description')} className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={`w-full justify-start text-left font-normal ${!field.value && 'text-muted-foreground'}`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP', { locale: es }) : <span>{t('basicInfo.expirationDate.select')}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} autoFocus disabled={(date) => date < new Date()} />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionSection>

            {/* Security AccordionSection */}
            <Security tenantId={tenantId} />

            {/* Features AccordionSection */}
            <AccordionSection title={t('features.additional')} icon={<FileText className="h-4 w-4 text-primary" />} defaultOpen={false}>
              <div className="grid gap-4 p-1">
                <FormField
                  control={form.control}
                  name="allowDownload"
                  render={({ field }) => (
                    <FormSwitchItem label={t('features.allowDownload.label')} icon={<Download className="h-4 w-4" />} tooltip={t('features.allowDownload.tooltip')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormSwitchItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableNotification"
                  render={({ field }) => (
                    <FormSwitchItem label={t('features.enableNotification.label')} icon={<Bell className="h-4 w-4" />} tooltip={t('features.enableNotification.tooltip')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormSwitchItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableFeedback"
                  render={({ field }) => (
                    <FormSwitchItem label={t('features.enableFeedback.label')} icon={<MessageSquare className="h-4 w-4" />} tooltip={t('features.enableFeedback.tooltip')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormSwitchItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableQuestion"
                  render={({ field }) => (
                    <FormSwitchItem label={t('features.enableQuestion.label')} icon={<MessageSquare className="h-4 w-4" />} tooltip={t('features.enableQuestion.tooltip')}>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormSwitchItem>
                  )}
                />
              </div>
            </AccordionSection>

            {/* Custom Fields AccordionSection */}
            <CustomField />
          </FormSection>
        </FormContent>
        <FormActions isPending={isPending} title={initialValues ? t('saveChanges') : t('create')} className="px-4" />
      </FormRoot>
    </Form>
  );
};
