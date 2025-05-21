import { useTranslations } from 'next-intl';

import { MessageNodeData } from '@/types/execution-flow';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface MessageFormProps {
  formData: MessageNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function MessageForm({ formData, onGuideClick, onChange }: MessageFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="message">{t('message')}</Label>
        <Textarea id="message" value={formData.message || ''} onChange={(e) => onChange('message', e.target.value)} rows={3} />
      </div>
    </BaseForm>
  );
}
