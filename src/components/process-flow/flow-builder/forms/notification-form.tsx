import { useTranslations } from 'next-intl';

import { NotificationNodeData } from '@/types/execution-flow';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface NotificationFormProps {
  formData: NotificationNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function NotificationForm({ formData, onGuideClick, onChange }: NotificationFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="channel">{t('channel')}</Label>
        <Select value={formData.channel || 'email'} onValueChange={(value) => onChange('channel', value)}>
          <SelectTrigger id="channel">
            <SelectValue placeholder={t('channel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">{t('channels.email')}</SelectItem>
            <SelectItem value="sms">{t('channels.sms')}</SelectItem>
            <SelectItem value="alert">{t('channels.alert')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t('message')}</Label>
        <Textarea id="message" value={formData.message || ''} onChange={(e) => onChange('message', e.target.value)} rows={3} />
      </div>
    </BaseForm>
  );
}
