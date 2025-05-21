import { useTranslations } from 'next-intl';

import { AnnotationNodeData } from '@/types/execution-flow';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { BaseForm } from './base-form';

interface AnnotationFormProps {
  formData: AnnotationNodeData;
  onGuideClick: () => void;
  onChange: (name: string, value: unknown) => void;
}

export function AnnotationForm({ formData, onGuideClick, onChange }: AnnotationFormProps) {
  const t = useTranslations('component.flowExecution.build.form');

  return (
    <BaseForm formData={formData} onGuideClick={onGuideClick} onChange={onChange}>
      <div className="space-y-2">
        <Label htmlFor="text">{t('text')}</Label>
        <Textarea id="text" value={formData.text || ''} onChange={(e) => onChange('text', e.target.value)} rows={5} />
      </div>
    </BaseForm>
  );
}
