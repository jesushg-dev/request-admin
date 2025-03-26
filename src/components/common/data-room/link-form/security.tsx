'use client';

import { useState } from 'react';
import { useFindManyAgreement } from '@/services/api/hooks';
import { FileText, ImageIcon, Key, Lock, Mail, Shield, Trash2, UserPlus, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Label } from 'recharts';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AnimatedVisibility, FormItem, FormSwitchItem } from '@/components/shared/form-root';

import { LinkFormValues } from '.';
import { AccordionSection } from '../../../shared/accordion-section';

export function Security({ tenantId }: { tenantId: string }) {
  const t = useTranslations('admin.link.form.security');
  const { data: agreements = [] } = useFindManyAgreement({
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
    where: { tenantId },
  });

  const form = useFormContext<LinkFormValues>();
  const { fields: allowedViewersFields, append: appendAllowedViewer, remove: removeAllowedViewer } = useFieldArray({ control: form.control, name: 'allowedViewers' });
  const { fields: blockedViewersFields, append: appendBlockedViewer, remove: removeBlockedViewer } = useFieldArray({ control: form.control, name: 'denyViewers' });

  const [newAllowedViewer, setNewAllowedViewer] = useState<{ value: string; type: 'EMAIL' | 'DOMAIN' }>({ value: '', type: 'EMAIL' });
  const [newBlockedViewer, setNewBlockedViewer] = useState<{ value: string; type: 'EMAIL' | 'DOMAIN' }>({ value: '', type: 'EMAIL' });

  const addAllowedViewer = () => {
    if (newAllowedViewer.value.trim() === '') {
      toast.error(t('invalidInput'));
      return;
    }
    appendAllowedViewer(newAllowedViewer);
    setNewAllowedViewer({ value: '', type: 'EMAIL' });
  };

  const addBlockedViewer = () => {
    if (newBlockedViewer.value.trim() === '') {
      toast.error(t('invalidInput'));
      return;
    }
    appendBlockedViewer(newBlockedViewer);
    setNewBlockedViewer({ value: '', type: 'EMAIL' });
  };

  return (
    <AccordionSection title={t('title')} icon={<Shield className="h-5 w-5 text-primary" />} defaultOpen={false}>
      <div className="space-y-4">
        {/* Password Protection */}
        <FormField
          control={form.control}
          name="enablePassword"
          render={({ field }) => (
            <FormSwitchItem label={t('passwordProtection.label')} icon={<Lock className="h-4 w-4" />} tooltip={t('passwordProtection.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <AnimatedVisibility isVisible={form.watch('enablePassword')} key="password" mode="wait">
              <FormItem label={t('password.label')} description={t('password.description')} className="ml-6">
                <Input type="password" placeholder={t('password.placeholder')} {...field} />
              </FormItem>
            </AnimatedVisibility>
          )}
        />

        {/* Email Protection */}
        <FormField
          control={form.control}
          name="emailProtected"
          render={({ field }) => (
            <FormSwitchItem label={t('emailProtection.label')} icon={<Mail className="h-4 w-4" />} tooltip={t('emailProtection.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        <div className="ml-6 mt-2">
          <FormField
            control={form.control}
            name="emailAuthenticated"
            render={({ field }) => (
              <AnimatedVisibility isVisible={form.watch('emailProtected')} key="email" mode="wait">
                <FormSwitchItem label={t('emailVerification.label')} icon={<Key className="h-4 w-4" />} tooltip={t('emailVerification.tooltip')}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormSwitchItem>
              </AnimatedVisibility>
            )}
          />
        </div>

        {/* Allowed Viewers */}
        <FormField
          control={form.control}
          name="allowSpecificViewers"
          render={({ field }) => (
            <FormSwitchItem label={t('allowSpecificViewers.label')} icon={<UserPlus className="h-4 w-4" />} tooltip={t('allowSpecificViewers.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        <AnimatedVisibility isVisible={form.watch('allowSpecificViewers')} key="allowed" mode="wait">
          <div className="ml-6 space-y-4 p-4 border rounded-lg mr-2">
            <div className="flex flex-col gap-2">
              <Label>{t('allowSpecificViewers.addLabel')}</Label>
              <div className="flex gap-2">
                <Select value={newAllowedViewer.type} onValueChange={(value: 'EMAIL' | 'DOMAIN') => setNewAllowedViewer({ ...newAllowedViewer, type: value })}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">{t('viewerTypes.email')}</SelectItem>
                    <SelectItem value="DOMAIN">{t('viewerTypes.domain')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={newAllowedViewer.type === 'EMAIL' ? t('allowSpecificViewers.emailPlaceholder') : t('allowSpecificViewers.domainPlaceholder')}
                  value={newAllowedViewer.value}
                  onChange={(e) => setNewAllowedViewer({ ...newAllowedViewer, value: e.target.value })}
                  className="flex-1"
                />
                <Button type="button" onClick={addAllowedViewer}>
                  {t('allowSpecificViewers.addButton')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('allowSpecificViewers.listLabel')}</Label>
              {allowedViewersFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('allowSpecificViewers.empty')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allowedViewersFields.map((field, index) => (
                    <Badge key={field.id} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      <span>
                        {field.type === 'EMAIL' ? `${t('viewerTypes.email')}:` : `${t('viewerTypes.domain')}:`} {field.value}
                      </span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => removeAllowedViewer(index)}>
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">{t('remove')}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedVisibility>

        {/* Blocked Viewers */}
        <FormField
          control={form.control}
          name="blockSpecificViewers"
          render={({ field }) => (
            <FormSwitchItem label={t('blockSpecificViewers.label')} icon={<UserX className="h-4 w-4" />} tooltip={t('blockSpecificViewers.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        <AnimatedVisibility isVisible={form.watch('blockSpecificViewers')} key="blocked" mode="wait">
          <div className="ml-6 space-y-4 p-4 border rounded-lg mr-2">
            <div className="flex flex-col gap-2">
              <Label>{t('blockSpecificViewers.addLabel')}</Label>
              <div className="flex gap-2">
                <Select value={newBlockedViewer.type} onValueChange={(value: 'EMAIL' | 'DOMAIN') => setNewBlockedViewer({ ...newBlockedViewer, type: value })}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">{t('viewerTypes.email')}</SelectItem>
                    <SelectItem value="DOMAIN">{t('viewerTypes.domain')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={newBlockedViewer.type === 'EMAIL' ? t('blockSpecificViewers.emailPlaceholder') : t('blockSpecificViewers.domainPlaceholder')}
                  value={newBlockedViewer.value}
                  onChange={(e) => setNewBlockedViewer({ ...newBlockedViewer, value: e.target.value })}
                  className="flex-1"
                />
                <Button type="button" onClick={addBlockedViewer}>
                  {t('blockSpecificViewers.addButton')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('blockSpecificViewers.listLabel')}</Label>
              {blockedViewersFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('blockSpecificViewers.empty')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blockedViewersFields.map((field, index) => (
                    <Badge key={field.id} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      <span>
                        {field.type === 'EMAIL' ? `${t('viewerTypes.email')}:` : `${t('viewerTypes.domain')}:`} {field.value}
                      </span>
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => removeBlockedViewer(index)}>
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">{t('remove')}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedVisibility>

        {/* Screenshot Protection */}
        <FormField
          control={form.control}
          name="enableScreenshotProtection"
          render={({ field }) => (
            <FormSwitchItem label={t('screenshotProtection.label')} icon={<Shield className="h-4 w-4" />} tooltip={t('screenshotProtection.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        {/* Watermark */}
        <FormField
          control={form.control}
          name="enableWatermark"
          render={({ field }) => (
            <FormSwitchItem label={t('watermark.label')} icon={<ImageIcon className="h-4 w-4" />} tooltip={t('watermark.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        {/* Agreement Requirement */}
        <FormField
          control={form.control}
          name="enableAgreement"
          render={({ field }) => (
            <FormSwitchItem label={t('agreementRequirement.label')} icon={<FileText className="h-4 w-4" />} tooltip={t('agreementRequirement.tooltip')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormSwitchItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreementId"
          render={({ field }) => (
            <AnimatedVisibility isVisible={form.watch('enableAgreement')} key="agreement" mode="wait">
              <FormItem label={t('agreement.label')} description={t('agreement.description')} className="ml-6 mt-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('agreement.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {agreements.map((agreement) => (
                      <SelectItem key={agreement.id} value={agreement.id}>
                        {agreement.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </AnimatedVisibility>
          )}
        />
      </div>
    </AccordionSection>
  );
}
